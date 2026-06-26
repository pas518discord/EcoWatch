import { NextRequest, NextResponse } from "next/server"
import { transformNASAReading } from "@/lib/data-transformer"

// NASA POWER API — completely free, no API key needed
// Docs: https://power.larc.nasa.gov/docs/services/api/

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const lat  = searchParams.get("lat")  ?? "15.9"   // default: Andhra Pradesh
  const lng  = searchParams.get("lng")  ?? "79.7"
  const regionId = searchParams.get("regionId") ?? "IN-AP"
  const orgId    = searchParams.get("orgId")    ?? "org_demo_001"

  // Date range: last 7 days
  const today = new Date()
  const weekAgo = new Date(today)
  weekAgo.setDate(today.getDate() - 7)

  const fmt = (d: Date) =>
    d.toISOString().slice(0, 10).replace(/-/g, "")

  const url = new URL(
    "https://power.larc.nasa.gov/api/temporal/daily/point"
  )
  url.searchParams.set("parameters",  "T2M,PRECTOTCORR,RH2M")
  url.searchParams.set("community",   "RE")
  url.searchParams.set("longitude",   lng)
  url.searchParams.set("latitude",    lat)
  url.searchParams.set("start",       fmt(weekAgo))
  url.searchParams.set("end",         fmt(today))
  url.searchParams.set("format",      "JSON")

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      // Cache for 1 hour — NASA data only updates daily
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `NASA API error: ${res.status}` },
        { status: 502 }
      )
    }

    const raw = await res.json()
    const date = today.toISOString().slice(0, 10)
    const readings = transformNASAReading(raw, regionId, orgId, date)

    return NextResponse.json({
      source: "NASA_POWER",
      regionId,
      readings,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error("NASA fetch error:", err)
    return NextResponse.json(
      { error: "Failed to fetch NASA data" },
      { status: 500 }
    )
  }
}
