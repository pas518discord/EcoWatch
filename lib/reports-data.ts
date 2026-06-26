export type AqiStatus = "Good" | "Moderate" | "Unhealthy" | "Hazardous"

export interface ClimateReport {
  id: string
  title: string
  dateRange: string
  region: string
  period: "Monthly" | "Quarterly"
  riskScore: number // 0-100, higher = more risk
  aqiStatus: AqiStatus
  forestCover: number // percentage
  fires: number
  co2: string // e.g. "412 ppm"
}

export const SAMPLE_REPORTS: ClimateReport[] = [
  {
    id: "rep-2025-q3-sea",
    title: "Southeast Asia Climate Risk",
    dateRange: "Jul 1 – Sep 30, 2025",
    region: "Southeast Asia",
    period: "Quarterly",
    riskScore: 74,
    aqiStatus: "Unhealthy",
    forestCover: 61,
    fires: 1240,
    co2: "412 ppm",
  },
  {
    id: "rep-2025-q3-amazon",
    title: "Amazon Basin Deforestation Brief",
    dateRange: "Jul 1 – Sep 30, 2025",
    region: "South America",
    period: "Quarterly",
    riskScore: 88,
    aqiStatus: "Moderate",
    forestCover: 78,
    fires: 3420,
    co2: "418 ppm",
  },
  {
    id: "rep-2025-sep-nordic",
    title: "Nordic Region Air Quality",
    dateRange: "Sep 1 – Sep 30, 2025",
    region: "Northern Europe",
    period: "Monthly",
    riskScore: 24,
    aqiStatus: "Good",
    forestCover: 68,
    fires: 87,
    co2: "405 ppm",
  },
]

export const REGIONS = [
  "All Regions",
  "Southeast Asia",
  "South America",
  "Northern Europe",
  "North America",
  "Sub-Saharan Africa",
] as const

export interface PricingTier {
  name: string
  price: string
  cadence: string
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: "$99",
    cadence: "/mo",
    description: "For small teams getting started with ESG monitoring.",
    features: ["2 regions", "Monthly reports", "WHO AQI compliance", "Email support"],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$499",
    cadence: "/mo",
    description: "For organizations that need broad, frequent coverage.",
    features: [
      "10 regions",
      "Monthly & quarterly reports",
      "WHO AQI + GRI alignment",
      "PDF exports & API access",
      "Priority support",
    ],
    highlighted: true,
    cta: "Start Pro Trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    description: "For global teams with advanced compliance needs.",
    features: [
      "Unlimited regions",
      "Custom reporting cadence",
      "Full compliance suite",
      "Dedicated success manager",
      "SLA & SSO",
    ],
    cta: "Contact Sales",
  },
]
