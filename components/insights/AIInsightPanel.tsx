"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Sparkles, RefreshCw, CheckCircle2,
  AlertTriangle, TrendingUp, FileText, Clock,
} from "lucide-react"
import { RiskScoreMeter } from "./RiskScoreMeter"
import type { AIReport, RiskLevel } from "@/lib/db-schema"

interface AIInsightPanelProps {
  regionId: string
  orgId: string
  timeframe?: "7d" | "30d"
  onGenerateReport?: () => void
}

type LoadState = "idle" | "loading" | "done" | "error"

const LOADING_MESSAGES = [
  "Connecting to satellite data…",
  "Aggregating sensor readings…",
  "Running AI analysis…",
  "Generating ESG insights…",
]

export function AIInsightPanel({
  regionId,
  orgId,
  timeframe = "30d",
  onGenerateReport,
}: AIInsightPanelProps) {
  const [state, setState] = useState<LoadState>("idle")
  const [report, setReport] = useState<AIReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadMsg, setLoadMsg] = useState(LOADING_MESSAGES[0])
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null)
  const [minutesAgo, setMinutesAgo] = useState<number | null>(null)

  const generate = useCallback(async () => {
    setState("loading")
    setError(null)

    // Cycle through loading messages for visual interest
    let msgIdx = 0
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length
      setLoadMsg(LOADING_MESSAGES[msgIdx])
    }, 1200)

    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regionId, orgId, timeframe }),
      })

      clearInterval(interval)

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Analysis failed")
      }

      const data = await res.json()
      setReport(data.report)
      setLastGenerated(new Date())
      setMinutesAgo(0)
      setState("done")
    } catch (err) {
      clearInterval(interval)
      setError(err instanceof Error ? err.message : "Unknown error")
      setState("error")
    }
  }, [regionId, orgId, timeframe])

  useEffect(() => {
    if (!lastGenerated) return
    const id = setInterval(() => {
      setMinutesAgo(Math.floor((Date.now() - lastGenerated.getTime()) / 60000))
    }, 60_000)
    return () => clearInterval(id)
  }, [lastGenerated])

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-800 bg-gray-900/60 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-gray-100">AI Insights</h2>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            Claude AI
          </span>
        </div>

        {lastGenerated && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="size-3" />
            <span>{minutesAgo === 0 ? "Just now" : `${minutesAgo}m ago`}</span>
          </div>
        )}
      </div>

      {/* ── IDLE STATE ─────────────────────────────────── */}
      {state === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
          <div className="rounded-full bg-gray-800 p-4">
            <Sparkles className="size-8 text-gray-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-300">
              No analysis yet
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Run AI to get climate insights for {regionId}
            </p>
          </div>
          <button
            onClick={generate}
            className="mt-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-emerald-400 transition-colors"
          >
            Generate Insights
          </button>
        </div>
      )}

      {/* ── LOADING STATE ──────────────────────────────── */}
      {state === "loading" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
          <div className="relative">
            <div className="size-14 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
            <Sparkles className="absolute inset-0 m-auto size-5 text-emerald-400" />
          </div>
          <p className="text-sm text-emerald-400 animate-pulse font-medium">
            {loadMsg}
          </p>
        </div>
      )}

      {/* ── ERROR STATE ────────────────────────────────── */}
      {state === "error" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8">
          <AlertTriangle className="size-8 text-red-400" />
          <p className="text-sm text-red-400 text-center">{error}</p>
          <button
            onClick={generate}
            className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-600 transition-colors"
          >
            <RefreshCw className="size-3.5" /> Try again
          </button>
        </div>
      )}

      {/* ── RESULTS STATE ──────────────────────────────── */}
      {state === "done" && report && (
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto">
          {/* Risk score gauge */}
          <div className="flex justify-center">
            <RiskScoreMeter
              score={report.riskScore}
              riskLevel={report.riskLevel as RiskLevel}
              size={140}
            />
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-gray-800 bg-gray-950/60 p-3">
            <p className="text-xs text-gray-400 leading-relaxed">
              {report.summary}
            </p>
          </div>

          {/* Key Findings */}
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-yellow-400" />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Key Findings
              </span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {report.keyFindings.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-md bg-yellow-500/5 border border-yellow-500/10 px-3 py-2"
                >
                  <AlertTriangle className="mt-0.5 size-3 shrink-0 text-yellow-500" />
                  <span className="text-xs text-gray-300">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Recommended Actions
              </span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {report.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                    {i + 1}
                  </span>
                  <span className="text-xs text-gray-300">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ESG Impact + Forecast */}
          <div className="grid grid-cols-1 gap-2">
            <div className="rounded-lg border border-gray-800 bg-gray-950/40 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                ESG Impact
              </p>
              <p className="text-xs text-gray-300">{report.esgImpact}</p>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-950/40 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                30-Day Forecast
              </p>
              <p className="text-xs text-gray-300">{report.forecast}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onGenerateReport}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-gray-950 hover:bg-emerald-400 transition-colors"
            >
              <FileText className="size-3.5" />
              Generate ESG Report
            </button>
            <button
              onClick={generate}
              className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-2 text-xs text-gray-400 hover:border-gray-600 hover:text-gray-200 transition-colors"
              title="Refresh analysis"
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AIInsightPanel
