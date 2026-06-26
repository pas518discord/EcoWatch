import { NextRequest, NextResponse } from "next/server"
import { parseFIRMSCsv, transformFIRMSReading } from "@/lib/data-transformer"

// NASA FIRMS — Fire Information for Resource Management System
// Free API key from: https://firms.modaps.eosdis.nasa.gov/api/map_key/
// Takes 1 minute to register, instant key

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const regionId = searchParams.get("regionId") ?? "IN-AP"
  const orgId    = searchParams.get("orgId")    ?? "org_demo_001"
  const country  = searchParams.get("country")  ?? "IND"  // ISO 3166-1 alpha-3
  const days     = searchParams.get("days")     ?? "1"    // 1, 2, or 7

  const mapKey = process.env.NASA_FIRMS_MAP_KEY

  if (!mapKey) {
    // Return empty instead of crashing — FIRMS key is optional for demo
    console.warn("NASA_FIRMS_MAP_KEY not set — skipping fire data")
    return NextResponse.json({
      source: "NASA_FIRMS",
      regionId,
      readings: [],
      warning: "FIRMS API key not configured",
      fetchedAt: new Date().toISOString(),
    })
  }

  // VIIRS SNPP is the best freely available fire product
  const url = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${mapKey}/VIIRS_SNPP_NRT/${country}/${days}`

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // cache 1 hour
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `FIRMS API error: ${res.status}` },
        { status: 502 }
      )
    }

    const csvText = await res.text()
    const rows = parseFIRMSCsv(csvText)

    // Only keep high/nominal confidence fire detections
    const filtered = rows.filter(
      (r) => r.confidence === "high" || r.confidence === "nominal"
    )

    const readings = filtered
      .slice(0, 100) // max 100 readings per call
      .map((row) => transformFIRMSReading(row, regionId, orgId))

    return NextResponse.json({
      source: "NASA_FIRMS",
      regionId,
      country,
      totalDetected: rows.length,
      highConfidence: filtered.length,
      readings,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error("FIRMS fetch error:", err)
    return NextResponse.json(
      { error: "Failed to fetch FIRMS data" },
      { status: 500 }
    )
  }
}
