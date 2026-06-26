import { NextRequest, NextResponse } from "next/server"
import { transformOpenAQReading } from "@/lib/data-transformer"

// OpenAQ v3 — completely free, no API key needed
// Docs: https://docs.openaq.org/

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const lat      = searchParams.get("lat")      ?? "15.9"
  const lng      = searchParams.get("lng")      ?? "79.7"
  const regionId = searchParams.get("regionId") ?? "IN-AP"
  const orgId    = searchParams.get("orgId")    ?? "org_demo_001"
  const radius   = searchParams.get("radius")   ?? "100000" // 100km radius

  const url = new URL("https://api.openaq.org/v3/locations")
  url.searchParams.set("coordinates", `${lat},${lng}`)
  url.searchParams.set("radius",      radius)
  url.searchParams.set("limit",       "10")
  url.searchParams.set("order_by",    "distance")

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept:       "application/json",
        // OpenAQ has optional API key for higher rate limits
        // Works without it for hackathon level usage
        ...(process.env.OPENAQ_API_KEY && {
          "X-API-Key": process.env.OPENAQ_API_KEY,
        }),
      },
      next: { revalidate: 1800 }, // cache 30 minutes
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `OpenAQ API error: ${res.status}` },
        { status: 502 }
      )
    }

    const data = await res.json()
    const locations = data.results ?? []

    const readings = locations.flatMap((loc: Parameters<typeof transformOpenAQReading>[0]) =>
      transformOpenAQReading(loc, regionId, orgId)
    )

    // Calculate average AQI across all stations for this region
    const aqiValues = readings.map((r: { value: number }) => r.value)
    const avgAQI =
      aqiValues.length > 0
        ? Math.round(
            aqiValues.reduce((a: number, b: number) => a + b, 0) /
              aqiValues.length
          )
        : null

    return NextResponse.json({
      source: "OPENAQ",
      regionId,
      stationsFound: locations.length,
      avgAQI,
      readings,
      fetchedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error("OpenAQ fetch error:", err)
    return NextResponse.json(
      { error: "Failed to fetch OpenAQ data" },
      { status: 500 }
    )
  }
}
