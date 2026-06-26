import { createAlert } from "./db-operations"
import type { Alert, AlertSeverity, AlertType, ClimateReading, Organization } from "./db-schema"

// ── ID generator (no extra packages needed) ───────────────────────────────
function generateAlertId(): string {
  // Time-sortable ID: timestamp + random suffix
  const ts = Date.now().toString(36).toUpperCase()
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${ts}-${rnd}`
}

// ── Severity helpers ──────────────────────────────────────────────────────
function aqiSeverity(value: number, threshold: number): AlertSeverity | null {
  if (value > 200)      return "CRITICAL"
  if (value > 150)      return "HIGH"
  if (value > threshold) return "MEDIUM"
  return null
}

function ndviSeverity(value: number, threshold: number): AlertSeverity | null {
  if (value < threshold - 0.15) return "HIGH"
  if (value < threshold)        return "MEDIUM"
  return null
}

function co2Severity(value: number, threshold: number): AlertSeverity | null {
  if (value > threshold + 20) return "HIGH"
  if (value > threshold)      return "MEDIUM"
  return null
}

// ── Core function ─────────────────────────────────────────────────────────
/**
 * Check a single reading against org thresholds.
 * Creates a DynamoDB alert record if the threshold is crossed.
 * Returns the created alert or null if no threshold was crossed.
 */
export async function checkThresholdsAndAlert(
  reading: ClimateReading,
  org: Organization
): Promise<Alert | null> {
  const { alertThresholds } = org
  let type: AlertType | null = null
  let severity: AlertSeverity | null = null
  let message = ""

  switch (reading.data_type) {
    case "AQI": {
      severity = aqiSeverity(reading.value, alertThresholds.AQI)
      if (severity) {
        type = "HIGH_AQI"
        message = `Air quality in ${reading.regionId} reached AQI ${reading.value} — ${
          severity === "CRITICAL"
            ? "hazardous levels, immediate action required"
            : severity === "HIGH"
            ? "unhealthy for all groups"
            : "unhealthy for sensitive groups"
        }. Threshold: ${alertThresholds.AQI}.`
      }
      break
    }

    case "NDVI": {
      severity = ndviSeverity(reading.value, alertThresholds.NDVI)
      if (severity) {
        type = "DEFORESTATION"
        const pct = Math.round((1 - reading.value / alertThresholds.NDVI) * 100)
        message = `Vegetation cover in ${reading.regionId} dropped to NDVI ${reading.value.toFixed(2)} — ${pct}% below healthy threshold (${alertThresholds.NDVI}). Possible deforestation or drought stress.`
      }
      break
    }

    case "FIRE": {
      // Any fire detection is always CRITICAL
      type = "FIRE_DETECTED"
      severity = "CRITICAL"
      message = `Active fire detected in ${reading.regionId} (brightness: ${reading.value}K${
        reading.confidence ? `, confidence: ${reading.confidence}` : ""
      }). Immediate assessment recommended.`
      break
    }

    case "CO2": {
      severity = co2Severity(reading.value, alertThresholds.CO2)
      if (severity) {
        type = "CO2_SPIKE"
        message = `Atmospheric CO₂ in ${reading.regionId} reached ${reading.value} — ${
          reading.value - alertThresholds.CO2
        } above threshold (${alertThresholds.CO2}).`
      }
      break
    }
  }

  // No threshold crossed
  if (!type || !severity) return null

  const alert: Alert = {
    orgId: org.orgId,
    alertId: generateAlertId(),
    regionId: reading.regionId,
    type,
    severity,
    message,
    value: reading.value,
    threshold:
      type === "HIGH_AQI"       ? alertThresholds.AQI
      : type === "DEFORESTATION" ? alertThresholds.NDVI
      : type === "CO2_SPIKE"    ? alertThresholds.CO2
      : 0,
    acknowledged: false,
    createdAt: reading.timestamp ?? new Date().toISOString(),
    lat: reading.lat,
    lng: reading.lng,
  }

  try {
    await createAlert(alert)
    return alert
  } catch (err: unknown) {
    // ConditionExpression blocks duplicate alertIds — safe to swallow
    if (
      err instanceof Error &&
      err.name === "ConditionalCheckFailedException"
    ) {
      return null
    }
    throw err
  }
}

/**
 * Process a batch of readings and return all alerts created.
 */
export async function checkBatchAndAlert(
  readings: ClimateReading[],
  org: Organization
): Promise<Alert[]> {
  const results = await Promise.allSettled(
    readings.map((r) => checkThresholdsAndAlert(r, org))
  )

  return results
    .filter(
      (r): r is PromiseFulfilledResult<Alert> =>
        r.status === "fulfilled" && r.value !== null
    )
    .map((r) => r.value)
}
