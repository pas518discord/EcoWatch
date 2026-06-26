import { NextRequest, NextResponse } from "next/server"
import { putClimateReadings, getOrganization, createAlert } from "@/lib/db-operations"
import { transformFIRMSReading } from "@/lib/data-transformer"
import { MONITORED_REGIONS } from "@/lib/db-schema"
import type { Alert, Organization } from "@/lib/db-schema"

// ─────────────────────────────────────────────
// ALERT THRESHOLD CHECKER
// ─────────────────────────────────────────────
async function checkAndCreateAlerts(
  readings: Array<{ value: number; data_type: string; regionId: string; lat?: number; lng?: number; timestamp: string }>,
  org: Organization
): Promise<number> {
  let alertCount = 0
  const { alertThresholds } = org

  for (const reading of readings) {
    let shouldAlert = false
    let severity: Alert["severity"] = "LOW"
    let type: Alert["type"] = "HIGH_AQI"
    let message = ""

    if (reading.data_type === "AQI") {
      if (reading.value > alertThresholds.AQI) {
        shouldAlert = true
        type = "HIGH_AQI"
        severity =
          reading.value > 200 ? "CRITICAL"
          : reading.value > 150 ? "HIGH"
          : "MEDIUM"
        message = `AQI reached ${reading.value} in ${reading.regionId} (threshold: ${alertThresholds.AQI})`
      }
    }

    if (reading.data_type === "FIRE") {
      shouldAlert = true
      type = "FIRE_DETECTED"
      severity = "CRITICAL"
      message = `Active fire detected in ${reading.regionId} (brightness: ${reading.value}K)`
    }

    if (reading.data_type === "CO2" && reading.value > alertThresholds.CO2) {
      shouldAlert = true
      type = "CO2_SPIKE"
      severity = reading.value > alertThresholds.CO2 + 20 ? "HIGH" : "MEDIUM"
      message = `CO₂ at ${reading.value}°C in ${reading.regionId} (threshold: ${alertThresholds.CO2})`
    }

    if (shouldAlert) {
      const alert: Alert = {
        orgId: org.orgId,
        alertId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        regionId: reading.regionId,
        type,
        severity,
        message,
        value: reading.value,
        threshold:
          type === "HIGH_AQI" ? alertThresholds.AQI
          : type === "CO2_SPIKE" ? alertThresholds.CO2
          : 0,
        acknowledged: false,
        createdAt: reading.timestamp,
        lat: reading.lat,
        lng: reading.lng,
      }

      try {
        await createAlert(alert)
        alertCount++
      } catch {
        // ConditionExpression prevents duplicate alerts — safe to ignore
      }
    }
  }

  return alertCount
}

// ─────────────────────────────────────────────
// MAIN INGEST HANDLER
// Called by Vercel Cron every hour (see vercel.json)
// Also callable manually: GET /api/ingest
// ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // Security: only allow Vercel cron or requests with the secret
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  const isCronJob = authHeader === `Bearer ${cronSecret}`
  const isDevMode = process.env.NODE_ENV === "development"

  if (!isCronJob && !isDevMode) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results = {
    ingestedReadings: 0,
    alertsCreated: 0,
    errors: [] as string[],
    regionsProcessed: [] as string[],
  }

  // Demo org for now — in production, fetch all active orgs
  const DEMO_ORG_ID = "org_demo_001"
  const org = await getOrganization(DEMO_ORG_ID)

  if (!org) {
    return NextResponse.json(
      { error: "Demo org not found. Run seed script first." },
      { status: 500 }
    )
  }

  // Process each monitored region
  for (const regionId of org.monitoredRegions) {
    const region = MONITORED_REGIONS.find((r) => r.id === regionId)
    if (!region) continue

    const allReadings: Array<ReturnType<typeof transformFIRMSReading>> = []

    // ── 1. Fetch OpenAQ (AQI) data ──
    try {
      const aqUrl = new URL(`${req.nextUrl.origin}/api/data/openaq`)
      aqUrl.searchParams.set("lat",      String(region.lat))
      aqUrl.searchParams.set("lng",      String(region.lng))
      aqUrl.searchParams.set("regionId", region.id)
      aqUrl.searchParams.set("orgId",    org.orgId)

      const aqRes = await fetch(aqUrl.toString())
      if (aqRes.ok) {
        const aqData = await aqRes.json()
        allReadings.push(...(aqData.readings ?? []))
      }
    } catch (e) {
      results.errors.push(`OpenAQ error for ${regionId}: ${e}`)
    }

    // ── 2. Fetch NASA FIRMS (fire) data ──
    if (process.env.NASA_FIRMS_MAP_KEY) {
      try {
        const firmsUrl = new URL(`${req.nextUrl.origin}/api/data/firms`)
        firmsUrl.searchParams.set("regionId", region.id)
        firmsUrl.searchParams.set("orgId",    org.orgId)
        firmsUrl.searchParams.set("country",  region.country)
        firmsUrl.searchParams.set("days",     "1")

        const firmsRes = await fetch(firmsUrl.toString())
        if (firmsRes.ok) {
          const firmsData = await firmsRes.json()
          allReadings.push(...(firmsData.readings ?? []))
        }
      } catch (e) {
        results.errors.push(`FIRMS error for ${regionId}: ${e}`)
      }
    }

    // ── 3. Save all readings to DynamoDB ──
    if (allReadings.length > 0) {
      try {
        await putClimateReadings(allReadings)
        results.ingestedReadings += allReadings.length
      } catch (e) {
        results.errors.push(`DynamoDB write error for ${regionId}: ${e}`)
      }

      // ── 4. Check thresholds and create alerts ──
      try {
        const alertCount = await checkAndCreateAlerts(allReadings, org)
        results.alertsCreated += alertCount
      } catch (e) {
        results.errors.push(`Alert check error for ${regionId}: ${e}`)
      }
    }

    results.regionsProcessed.push(regionId)
  }

  return NextResponse.json({
    success: true,
    ...results,
    completedAt: new Date().toISOString(),
  })
}
