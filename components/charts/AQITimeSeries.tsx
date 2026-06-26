"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipContentProps } from "recharts"

type AQIPoint = {
  date: string
  aqi: number
}

// Generate 30 days of AQI data trending from 85 up to 140
function generateAQIData(): AQIPoint[] {
  const data: AQIPoint[] = []
  const today = new Date()
  const start = 85
  const end = 140

  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - (29 - i))

    // Linear upward trend with a little organic noise
    const progress = i / 29
    const trend = start + (end - start) * progress
    const noise = Math.sin(i * 1.3) * 6 + (i % 4) * 2 - 3
    const aqi = Math.round(Math.max(0, Math.min(300, trend + noise)))

    data.push({
      date: d.toISOString().slice(0, 10),
      aqi,
    })
  }

  return data
}

const AQI_DATA = generateAQIData()

function getCategory(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: "Good", color: "#22c55e" }
  if (aqi <= 100) return { label: "Moderate", color: "#eab308" }
  if (aqi <= 150) return { label: "Unhealthy (Sensitive)", color: "#f97316" }
  return { label: "Unhealthy", color: "#ef4444" }
}

function formatDate(value: string): string {
  const d = new Date(value)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function AQITooltip({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload || payload.length === 0) return null

  const aqi = payload[0].value as number
  const category = getCategory(aqi)

  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-xs font-medium text-zinc-400">{formatDate(label as string)}</p>
      <p className="mt-1 text-lg font-semibold text-zinc-50">
        AQI {aqi}
      </p>
      <div className="mt-1 flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: category.color }}
          aria-hidden="true"
        />
        <span className="text-xs font-medium" style={{ color: category.color }}>
          {category.label}
        </span>
      </div>
    </div>
  )
}

export function AQITimeSeries() {
  return (
    <div className="w-full rounded-xl border border-white/10 bg-zinc-900/50 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-50">Air Quality Index</h3>
        <p className="text-xs text-zinc-400">Last 30 days</p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={AQI_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.06} vertical={false} />

            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#ffffff", strokeOpacity: 0.1 }}
              minTickGap={24}
            />
            <YAxis
              domain={[0, 300]}
              ticks={[0, 50, 100, 150, 200, 250, 300]}
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={36}
            />

            <Tooltip
              content={<AQITooltip />}
              cursor={{ stroke: "#10b981", strokeOpacity: 0.4, strokeWidth: 1 }}
            />

            {/* Threshold reference lines */}
            <ReferenceLine
              y={50}
              stroke="#22c55e"
              strokeDasharray="5 5"
              strokeOpacity={0.8}
              label={{ value: "Good", position: "insideTopLeft", fill: "#22c55e", fontSize: 10 }}
            />
            <ReferenceLine
              y={100}
              stroke="#eab308"
              strokeDasharray="5 5"
              strokeOpacity={0.8}
              label={{ value: "Moderate", position: "insideTopLeft", fill: "#eab308", fontSize: 10 }}
            />
            <ReferenceLine
              y={150}
              stroke="#f97316"
              strokeDasharray="5 5"
              strokeOpacity={0.8}
              label={{ value: "Unhealthy", position: "insideTopLeft", fill: "#f97316", fontSize: 10 }}
            />

            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#aqiFill)"
              activeDot={{ r: 4, fill: "#10b981", stroke: "#052e16", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AQITimeSeries
