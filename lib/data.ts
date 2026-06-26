export type Severity = "critical" | "high" | "moderate" | "low"

export type Metric = {
  label: string
  value: string
  unit?: string
  helper: string
  trend: number
  trendLabel: string
  positiveIsGood: boolean
}

export const metrics: Metric[] = [
  {
    label: "Air Quality Index",
    value: "58",
    unit: "AQI",
    helper: "Aggregate across 142 monitored zones",
    trend: -6.4,
    trendLabel: "vs. last 7 days",
    positiveIsGood: false,
  },
  {
    label: "Forest Cover",
    value: "64.2",
    unit: "%",
    helper: "Canopy coverage across active regions",
    trend: -1.8,
    trendLabel: "vs. last quarter",
    positiveIsGood: true,
  },
  {
    label: "Active Alerts",
    value: "12",
    helper: "3 critical, 5 high, 4 moderate",
    trend: 8.0,
    trendLabel: "vs. yesterday",
    positiveIsGood: false,
  },
]

export type Alert = {
  id: string
  title: string
  description: string
  region: string
  severity: Severity
  timestamp: string
}

export const alerts: Alert[] = [
  {
    id: "ALT-4821",
    title: "Hazardous AQI spike detected",
    description: "PM2.5 levels exceeded 180 µg/m³ in the industrial corridor.",
    region: "Jakarta, ID",
    severity: "critical",
    timestamp: "8 min ago",
  },
  {
    id: "ALT-4819",
    title: "Accelerated deforestation",
    description: "Satellite imagery shows 340 ha canopy loss week-over-week.",
    region: "Pará, BR",
    severity: "high",
    timestamp: "42 min ago",
  },
  {
    id: "ALT-4815",
    title: "Heatwave threshold breached",
    description: "Surface temperatures sustained above 41°C for 72 hours.",
    region: "Andalusia, ES",
    severity: "high",
    timestamp: "1 hr ago",
  },
  {
    id: "ALT-4810",
    title: "Water reservoir decline",
    description: "Primary catchment dropped to 38% of seasonal average.",
    region: "Cape Town, ZA",
    severity: "moderate",
    timestamp: "3 hr ago",
  },
  {
    id: "ALT-4802",
    title: "Coastal flood watch lifted",
    description: "Tidal surge receded below advisory levels overnight.",
    region: "Rotterdam, NL",
    severity: "low",
    timestamp: "6 hr ago",
  },
]

export type Insight = {
  id: string
  category: "Prediction" | "Trend" | "Recommendation"
  title: string
  body: string
  confidence: number
}

export const insights: Insight[] = [
  {
    id: "INS-01",
    category: "Prediction",
    title: "Elevated wildfire risk in 9 regions",
    body: "Dry-season models forecast a 27% increase in ignition probability across Mediterranean zones over the next 14 days.",
    confidence: 91,
  },
  {
    id: "INS-02",
    category: "Trend",
    title: "Urban AQI improving in East Asia",
    body: "Coordinated emission controls correlate with a sustained 12% AQI reduction quarter-over-quarter.",
    confidence: 84,
  },
  {
    id: "INS-03",
    category: "Recommendation",
    title: "Prioritize reforestation in Pará",
    body: "Targeting 4 high-loss grids could offset an estimated 1.2 Mt CO₂e annually and stabilize local watersheds.",
    confidence: 78,
  },
]

export type Region = {
  name: string
  country: string
  aqi: number
  forest: number
  risk: Severity
  alerts: number
}

export const regions: Region[] = [
  { name: "Jakarta", country: "Indonesia", aqi: 178, forest: 41.2, risk: "critical", alerts: 4 },
  { name: "Pará", country: "Brazil", aqi: 62, forest: 71.8, risk: "high", alerts: 3 },
  { name: "Andalusia", country: "Spain", aqi: 71, forest: 38.4, risk: "high", alerts: 2 },
  { name: "Cape Town", country: "South Africa", aqi: 54, forest: 22.1, risk: "moderate", alerts: 1 },
  { name: "Rotterdam", country: "Netherlands", aqi: 39, forest: 18.6, risk: "low", alerts: 0 },
  { name: "Bengaluru", country: "India", aqi: 96, forest: 29.7, risk: "moderate", alerts: 1 },
  { name: "Oslo", country: "Norway", aqi: 28, forest: 66.3, risk: "low", alerts: 0 },
  { name: "Lagos", country: "Nigeria", aqi: 134, forest: 14.9, risk: "high", alerts: 2 },
]

export type Report = {
  id: string
  title: string
  period: string
  scope: string
  status: "Published" | "In review" | "Draft"
  updated: string
}

export const reports: Report[] = [
  { id: "ESG-2026-Q1", title: "Q1 Carbon Disclosure Summary", period: "Q1 2026", scope: "Scope 1, 2, 3", status: "Published", updated: "Mar 14, 2026" },
  { id: "ESG-2025-AR", title: "Annual Sustainability Report", period: "FY 2025", scope: "Enterprise-wide", status: "Published", updated: "Feb 2, 2026" },
  { id: "ESG-2026-BIO", title: "Biodiversity Impact Assessment", period: "Q1 2026", scope: "Forestry assets", status: "In review", updated: "Mar 9, 2026" },
  { id: "ESG-2026-WTR", title: "Water Stewardship Disclosure", period: "Q1 2026", scope: "Operations", status: "Draft", updated: "Mar 18, 2026" },
]

export const severityLabels: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  moderate: "Moderate",
  low: "Low",
}
