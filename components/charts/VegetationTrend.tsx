"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TooltipContentProps } from "recharts"

type NDVIPoint = {
  month: string
  thisYear: number
  lastYear: number
}

// This year declines from 0.72 to 0.51; last year holds healthier values
const NDVI_DATA: NDVIPoint[] = [
  { month: "Jan", thisYear: 0.72, lastYear: 0.74 },
  { month: "Feb", thisYear: 0.68, lastYear: 0.73 },
  { month: "Mar", thisYear: 0.63, lastYear: 0.71 },
  { month: "Apr", thisYear: 0.59, lastYear: 0.69 },
  { month: "May", thisYear: 0.54, lastYear: 0.68 },
  { month: "Jun", thisYear: 0.51, lastYear: 0.66 },
]

const DEGRADED_THRESHOLD = 0.3

function NDVITooltip({ active, payload, label }: Partial<TooltipContentProps<number, string>>) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="text-xs font-medium text-zinc-400">{label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey as string} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className="text-xs text-zinc-300">
              {entry.dataKey === "thisYear" ? "This Year" : "Last Year"}
            </span>
            <span className="ml-auto text-xs font-semibold text-zinc-50">
              {(entry.value as number).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function VegetationTrend() {
  return (
    <div className="w-full rounded-xl border border-white/10 bg-zinc-900/50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-50">Vegetation Health (NDVI)</h3>
          <p className="text-xs text-zinc-400">This year vs. last year</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="text-xs text-zinc-300">This Year</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 bg-slate-500" aria-hidden="true" />
            <span className="text-xs text-zinc-300">Last Year</span>
          </div>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={NDVI_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.06} vertical={false} />

            <XAxis
              dataKey="month"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: "#ffffff", strokeOpacity: 0.1 }}
            />
            <YAxis
              domain={[0, 1]}
              ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]}
              tickFormatter={(v) => (v as number).toFixed(1)}
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={36}
            />

            <Tooltip content={<NDVITooltip />} cursor={{ stroke: "#64748b", strokeOpacity: 0.4 }} />

            {/* Degraded zone below threshold */}
            <ReferenceArea
              y1={0}
              y2={DEGRADED_THRESHOLD}
              fill="#ef4444"
              fillOpacity={0.12}
              ifOverflow="extendDomain"
            />
            <ReferenceLine
              y={DEGRADED_THRESHOLD}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeOpacity={0.8}
              label={{ value: "Degraded", position: "insideBottomLeft", fill: "#ef4444", fontSize: 10 }}
            />

            <Line
              type="monotone"
              dataKey="thisYear"
              name="This Year"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#10b981", stroke: "#052e16", strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="lastYear"
              name="Last Year"
              stroke="#64748b"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 3, fill: "#64748b", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#64748b", stroke: "#0f172a", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default VegetationTrend
