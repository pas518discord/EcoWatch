// ─────────────────────────────────────────────
// TABLE 1: climate_readings
// PK: regionId   SK: timestamp#data_type
// e.g. PK="IN-AP" SK="2026-06-26T10:00:00Z#AQI"
// ─────────────────────────────────────────────
export type DataType = "AQI" | "NDVI" | "FIRE" | "CO2"
export type DataSource = "NASA" | "OPENAQ" | "COPERNICUS"

export interface ClimateReading {
  regionId: string           // partition key  e.g. "IN-AP"
  sk: string                 // sort key       e.g. "2026-06-26T10:00:00Z#AQI"
  timestamp: string          // ISO string     e.g. "2026-06-26T10:00:00Z"
  data_type: DataType        // "AQI" | "NDVI" | "FIRE" | "CO2"
  value: number              // the reading value
  unit: string               // "ppm" | "index" | "K" | "brightness"
  source: DataSource         // which API it came from
  orgId: string              // which org this belongs to (multi-tenant)
  lat?: number               // optional coordinates for map pinning
  lng?: number
  confidence?: string        // for fire data: "high" | "nominal" | "low"
  rawData?: Record<string, unknown>  // original API response snapshot
}

// ─────────────────────────────────────────────
// TABLE 2: ecowatch_alerts
// PK: orgId   SK: alertId (ULID for time ordering)
// ─────────────────────────────────────────────
export type AlertType =
  | "DEFORESTATION"
  | "HIGH_AQI"
  | "FIRE_DETECTED"
  | "CO2_SPIKE"

export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export interface Alert {
  orgId: string              // partition key
  alertId: string            // sort key (use Date.now() + random for ordering)
  regionId: string
  type: AlertType
  severity: AlertSeverity
  message: string
  value: number              // the reading value that triggered the alert
  threshold: number          // the threshold that was crossed
  acknowledged: boolean
  createdAt: string          // ISO string
  lat?: number
  lng?: number
}

// ─────────────────────────────────────────────
// TABLE 3: organizations
// PK: orgId
// ─────────────────────────────────────────────
export type OrgPlan = "starter" | "pro" | "enterprise"

export interface AlertThresholds {
  AQI: number                // default 100 — alert if AQI exceeds this
  NDVI: number               // default 0.3 — alert if NDVI drops below this
  CO2: number                // default 420 ppm
  FIRE: number               // default 0 — any fire triggers alert
}

export interface Organization {
  orgId: string              // partition key  e.g. "org_001"
  name: string               // e.g. "GreenCorp ESG Team"
  email: string
  plan: OrgPlan
  monitoredRegions: string[] // array of regionIds e.g. ["IN-AP", "BR-AM"]
  alertThresholds: AlertThresholds
  createdAt: string
  updatedAt: string
}

// ─────────────────────────────────────────────
// TABLE 4: ai_reports
// PK: orgId   SK: reportDate#regionId
// e.g. PK="org_001" SK="2026-06-01#IN-AP"
// ─────────────────────────────────────────────
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

export interface AIReport {
  orgId: string              // partition key
  sk: string                 // sort key e.g. "2026-06-01#IN-AP"
  reportDate: string         // "YYYY-MM-DD"
  regionId: string
  summary: string            // 2-3 sentence executive summary
  riskScore: number          // 0-100
  riskLevel: RiskLevel
  keyFindings: string[]
  recommendations: string[]
  esgImpact: string
  forecast: string
  environmentalMetrics: {
    averageAQI: number
    aqiTrend: "improving" | "stable" | "degrading"
    vegetationCoverChange: number  // % change
    co2Concentration: number
    fireIncidents: number
  }
  generatedAt: string        // ISO string
}

// ─────────────────────────────────────────────
// REGION DEFINITIONS
// Used across the app for consistent naming
// ─────────────────────────────────────────────
export interface Region {
  id: string
  name: string
  lat: number
  lng: number
  country: string
}

export const MONITORED_REGIONS: Region[] = [
  { id: "IN-AP",  name: "Andhra Pradesh, India",      lat: 15.9,  lng: 79.7,   country: "IND" },
  { id: "BR-AM",  name: "Amazon Basin, Brazil",        lat: -3.4,  lng: -65.1,  country: "BRA" },
  { id: "ID-KL",  name: "Kalimantan, Indonesia",       lat: 0.9,   lng: 113.9,  country: "IDN" },
  { id: "CD-CO",  name: "Congo Basin, Africa",         lat: -0.2,  lng: 24.9,   country: "COD" },
  { id: "AU-NW",  name: "Northwest Australia",         lat: -23.7, lng: 122.4,  country: "AUS" },
  { id: "US-CA",  name: "California, USA",             lat: 36.7,  lng: -119.4, country: "USA" },
]
