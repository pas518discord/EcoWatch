import type { ClimateReading } from "./db-schema"

// ─────────────────────────────────────────────
// AQI CALCULATION from PM2.5
// Uses US EPA formula — industry standard
// ─────────────────────────────────────────────
interface AQIBreakpoint {
  pmLow: number; pmHigh: number
  aqiLow: number; aqiHigh: number
}

const PM25_BREAKPOINTS: AQIBreakpoint[] = [
  { pmLow: 0.0,  pmHigh: 12.0,  aqiLow: 0,   aqiHigh: 50  },
  { pmLow: 12.1, pmHigh: 35.4,  aqiLow: 51,  aqiHigh: 100 },
  { pmLow: 35.5, pmHigh: 55.4,  aqiLow: 101, aqiHigh: 150 },
  { pmLow: 55.5, pmHigh: 150.4, aqiLow: 151, aqiHigh: 200 },
  { pmLow: 150.5,pmHigh: 250.4, aqiLow: 201, aqiHigh: 300 },
  { pmLow: 250.5,pmHigh: 500.4, aqiLow: 301, aqiHigh: 500 },
]

export function pm25ToAQI(pm25: number): number {
  const bp = PM25_BREAKPOINTS.find(
    (b) => pm25 >= b.pmLow && pm25 <= b.pmHigh
  )
  if (!bp) return pm25 > 500 ? 500 : 0
  return Math.round(
    ((bp.aqiHigh - bp.aqiLow) / (bp.pmHigh - bp.pmLow)) *
      (pm25 - bp.pmLow) +
      bp.aqiLow
  )
}

// ─────────────────────────────────────────────
// TRANSFORM NASA POWER RESPONSE
// ─────────────────────────────────────────────
interface NASAPowerRaw {
  properties?: {
    parameter?: {
      T2M?: Record<string, number>    // temperature at 2m
      PRECTOTCORR?: Record<string, number> // precipitation
    }
  }
  geometry?: { coordinates?: [number, number] }
}

export function transformNASAReading(
  raw: NASAPowerRaw,
  regionId: string,
  orgId: string,
  date: string
): ClimateReading[] {
  const readings: ClimateReading[] = []
  const coords = raw.geometry?.coordinates ?? [0, 0]
  const [lng, lat] = coords
  const params = raw.properties?.parameter ?? {}

  // Temperature reading
  const temp = params.T2M?.[date.replace(/-/g, "")]
  if (temp !== undefined && temp !== -999) {
    readings.push({
      regionId,
      sk: `${new Date().toISOString()}#CO2`, // using CO2 slot for temp
      timestamp: new Date().toISOString(),
      data_type: "CO2", // closest proxy for atmosphere data
      value: Math.round(temp * 10) / 10,
      unit: "°C",
      source: "NASA",
      orgId,
      lat,
      lng,
      rawData: { temperature: temp },
    })
  }

  return readings
}

// ─────────────────────────────────────────────
// TRANSFORM NASA FIRMS FIRE DATA
// CSV row from FIRMS API
// ─────────────────────────────────────────────
export interface FIRMSRow {
  latitude: string
  longitude: string
  bright_ti4: string   // brightness temperature
  acq_date: string     // "YYYY-MM-DD"
  confidence: string   // "high" | "nominal" | "low"
  frp: string          // fire radiative power
}

export function transformFIRMSReading(
  row: FIRMSRow,
  regionId: string,
  orgId: string
): ClimateReading {
  const timestamp = new Date(`${row.acq_date}T00:00:00Z`).toISOString()
  return {
    regionId,
    sk: `${timestamp}#FIRE`,
    timestamp,
    data_type: "FIRE",
    value: parseFloat(row.bright_ti4) || 0,
    unit: "K",  // Kelvin (brightness temperature)
    source: "NASA",
    orgId,
    lat: parseFloat(row.latitude),
    lng: parseFloat(row.longitude),
    confidence: row.confidence,
    rawData: { frp: row.frp, acq_date: row.acq_date },
  }
}

// ─────────────────────────────────────────────
// TRANSFORM OPENAQ RESPONSE
// ─────────────────────────────────────────────
interface OpenAQSensor {
  parameter: { name: string }
  latest?: { value: number; datetime?: { utc: string } }
  coordinates?: { latitude: number; longitude: number }
}

interface OpenAQLocation {
  name: string
  sensors?: OpenAQSensor[]
  coordinates?: { latitude: number; longitude: number }
}

export function transformOpenAQReading(
  location: OpenAQLocation,
  regionId: string,
  orgId: string
): ClimateReading[] {
  const readings: ClimateReading[] = []
  const coords = location.coordinates

  for (const sensor of location.sensors ?? []) {
    if (sensor.parameter.name !== "pm25") continue
    const value = sensor.latest?.value
    if (value === undefined || value < 0) continue

    const timestamp =
      sensor.latest?.datetime?.utc ?? new Date().toISOString()
    const aqi = pm25ToAQI(value)

    readings.push({
      regionId,
      sk: `${timestamp}#AQI`,
      timestamp,
      data_type: "AQI",
      value: aqi,
      unit: "AQI",
      source: "OPENAQ",
      orgId,
      lat: coords?.latitude,
      lng: coords?.longitude,
      rawData: { pm25: value, stationName: location.name },
    })
  }

  return readings
}

// ─────────────────────────────────────────────
// PARSE FIRMS CSV TEXT
// FIRMS returns raw CSV — this converts to objects
// ─────────────────────────────────────────────
export function parseFIRMSCsv(csvText: string): FIRMSRow[] {
  const lines = csvText.trim().split("\n")
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim())
    return Object.fromEntries(
      headers.map((h, i) => [h, values[i] ?? ""])
    ) as unknown as FIRMSRow
  })
}

// ─────────────────────────────────────────────
// AGGREGATE READINGS FOR AI ANALYSIS
// Summarises arrays of readings into a simple object
// so the AI prompt doesn't get flooded with raw data
// ─────────────────────────────────────────────
export function aggregateReadings(readings: ClimateReading[]) {
  const byType: Record<string, number[]> = {}

  for (const r of readings) {
    if (!byType[r.data_type]) byType[r.data_type] = []
    byType[r.data_type].push(r.value)
  }

  const avg = (arr: number[]) =>
    arr.length ? Math.round((arr.reduce((a, b) => a + b) / arr.length) * 10) / 10 : 0

  const aqiValues = byType["AQI"] ?? []
  const prevHalf = aqiValues.slice(0, Math.floor(aqiValues.length / 2))
  const currHalf = aqiValues.slice(Math.floor(aqiValues.length / 2))
  const aqiTrend =
    avg(currHalf) > avg(prevHalf) + 5
      ? "degrading"
      : avg(currHalf) < avg(prevHalf) - 5
      ? "improving"
      : "stable"

  return {
    avgAQI: avg(byType["AQI"] ?? []),
    avgNDVI: avg(byType["NDVI"] ?? []),
    avgCO2: avg(byType["CO2"] ?? []),
    fireCount: (byType["FIRE"] ?? []).length,
    totalReadings: readings.length,
    aqiTrend,
  }
}
