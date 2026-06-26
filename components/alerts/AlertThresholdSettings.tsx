"use client"

import { useState } from "react"
import { Save, Info, CheckCircle2 } from "lucide-react"
import type { AlertThresholds } from "@/lib/db-schema"

interface AlertThresholdSettingsProps {
  orgId: string
  initialThresholds: AlertThresholds
}

// Industry reference values shown alongside sliders
const INDUSTRY_LIMITS = {
  AQI:  { safe: 50,  who: 100, label: "WHO safe: 50 | Alert default: 100" },
  NDVI: { safe: 0.6, who: 0.3, label: "Healthy forest: >0.6 | Alert threshold: <0.3" },
  CO2:  { safe: 400, who: 420, label: "Pre-industrial: 280 | Current global avg: 422" },
}

function Slider({
  label, value, min, max, step, onChange, hint, unit,
}: {
  label: string; value: number; min: number; max: number
  step: number; onChange: (v: number) => void; hint: string; unit: string
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-200">{label}</span>
        <span className="rounded-md bg-gray-800 px-2 py-0.5 text-sm font-mono font-semibold text-emerald-400">
          {value}{unit}
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${pct}%, #374151 ${pct}%, #374151 100%)`,
          }}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <Info className="size-3 text-gray-600 shrink-0" />
        <span className="text-[11px] text-gray-500">{hint}</span>
      </div>
    </div>
  )
}

export function AlertThresholdSettings({
  orgId,
  initialThresholds,
}: AlertThresholdSettingsProps) {
  const [thresholds, setThresholds] = useState<AlertThresholds>(initialThresholds)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const update = (key: keyof AlertThresholds) => (value: number) => {
    setThresholds((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      await fetch(`/api/orgs/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertThresholds: thresholds }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 space-y-8">
      <div>
        <h2 className="text-base font-semibold text-gray-100">Alert Thresholds</h2>
        <p className="mt-1 text-sm text-gray-400">
          Alerts trigger when readings cross these values. Changes apply to all monitored regions.
        </p>
      </div>

      <div className="space-y-8">
        <Slider
          label="Air Quality Index (AQI)"
          value={thresholds.AQI}
          min={0} max={300} step={5} unit=""
          onChange={update("AQI")}
          hint={INDUSTRY_LIMITS.AQI.label}
        />

        <Slider
          label="Vegetation Index (NDVI)"
          value={thresholds.NDVI}
          min={0} max={1} step={0.05} unit=""
          onChange={update("NDVI")}
          hint={INDUSTRY_LIMITS.NDVI.label}
        />

        <Slider
          label="CO₂ Concentration"
          value={thresholds.CO2}
          min={300} max={500} step={5} unit=" ppm"
          onChange={update("CO2")}
          hint={INDUSTRY_LIMITS.CO2.label}
        />
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-emerald-400 disabled:opacity-60 transition-colors"
        >
          {saving ? (
            <div className="size-4 rounded-full border-2 border-gray-950 border-t-transparent animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? "Saving…" : "Save Thresholds"}
        </button>

        {saved && (
          <div className="flex items-center gap-1.5 text-sm text-emerald-400">
            <CheckCircle2 className="size-4" />
            Saved successfully
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertThresholdSettings
