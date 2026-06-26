"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Flame, Wind, Trees, TrendingUp,
  Bell, BellRing, CheckCheck,
} from "lucide-react"
import type { Alert, AlertSeverity, AlertType } from "@/lib/db-schema"

// ── Config ────────────────────────────────────────────────────────────────
const SEVERITY_STYLES: Record<AlertSeverity, { badge: string; dot: string }> = {
  CRITICAL: { badge: "bg-red-500/20 text-red-400 border-red-500/30",   dot: "bg-red-500"    },
  HIGH:     { badge: "bg-orange-500/20 text-orange-400 border-orange-500/30", dot: "bg-orange-500" },
  MEDIUM:   { badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", dot: "bg-yellow-500" },
  LOW:      { badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-500" },
}

const TYPE_ICON: Record<AlertType, React.ReactNode> = {
  FIRE_DETECTED:  <Flame  className="size-3.5 text-orange-400" />,
  HIGH_AQI:       <Wind   className="size-3.5 text-sky-400"    />,
  DEFORESTATION:  <Trees  className="size-3.5 text-emerald-400"/>,
  CO2_SPIKE:      <TrendingUp className="size-3.5 text-purple-400" />,
}

type FilterTab = "all" | "critical" | "unread"

// ── Time helper ───────────────────────────────────────────────────────────
function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ── Props ─────────────────────────────────────────────────────────────────
interface AlertListProps {
  orgId: string
  onRegionFocus?: (regionId: string, lat?: number, lng?: number) => void
  compact?: boolean   // compact = sidebar widget, full = full page
}

// ── Component ─────────────────────────────────────────────────────────────
export function AlertList({ orgId, onRegionFocus, compact = false }: AlertListProps) {
  const [alerts, setAlerts]           = useState<Alert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [tab, setTab]                 = useState<FilterTab>("all")
  const [loading, setLoading]         = useState(true)

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`/api/alerts?orgId=${orgId}&limit=50`)
      if (!res.ok) return
      const data = await res.json()
      setAlerts(data.alerts ?? [])
      setUnreadCount(parseInt(res.headers.get("X-Unread-Count") ?? "0", 10))
    } catch {
      // silent — polling will retry
    } finally {
      setLoading(false)
    }
  }, [orgId])

  // Initial fetch + poll every 30s
  useEffect(() => {
    // fetchAlerts is async; state updates run after the fetch resolves, not
    // synchronously within the effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAlerts()
    const id = setInterval(fetchAlerts, 30_000)
    return () => clearInterval(id)
  }, [fetchAlerts])

  const acknowledge = async (alert: Alert) => {
    await fetch(
      `/api/alerts/${alert.alertId}/acknowledge?orgId=${orgId}`,
      { method: "PATCH" }
    )
    setAlerts((prev) =>
      prev.map((a) =>
        a.alertId === alert.alertId ? { ...a, acknowledged: true } : a
      )
    )
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  // Filter by tab
  const visible = alerts.filter((a) => {
    if (tab === "critical") return a.severity === "CRITICAL"
    if (tab === "unread")   return !a.acknowledged
    return true
  })

  const limit = compact ? 5 : visible.length

  return (
    <div className="flex flex-col h-full rounded-xl border border-gray-800 bg-gray-900/60">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          {unreadCount > 0
            ? <BellRing className="size-4 text-red-400 animate-pulse" />
            : <Bell className="size-4 text-gray-400" />}
          <span className="text-sm font-semibold text-gray-100">Alerts</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white min-w-[18px] text-center">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1">
          {(["all", "critical", "unread"] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded px-2 py-0.5 text-[11px] font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-800/60">
        {loading && (
          <div className="p-6 text-center text-xs text-gray-500">Loading alerts…</div>
        )}

        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <CheckCheck className="size-6 text-emerald-500" />
            <p className="text-sm font-medium text-gray-300">All clear</p>
            <p className="text-xs text-gray-500">No alerts for this filter</p>
          </div>
        )}

        {visible.slice(0, limit).map((alert) => {
          const s = SEVERITY_STYLES[alert.severity]
          return (
            <div
              key={alert.alertId}
              className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-800/40 cursor-pointer ${
                !alert.acknowledged ? "bg-gray-800/20" : ""
              }`}
              onClick={() => onRegionFocus?.(alert.regionId, alert.lat, alert.lng)}
            >
              {/* Dot */}
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${s.dot}`} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {TYPE_ICON[alert.type]}
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${s.badge}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-gray-500 ml-auto shrink-0">
                    {timeAgo(alert.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-gray-300 line-clamp-2">{alert.message}</p>
                <p className="mt-0.5 text-[10px] text-gray-500">{alert.regionId}</p>
              </div>

              {/* Acknowledge button */}
              {!alert.acknowledged && (
                <button
                  onClick={(e) => { e.stopPropagation(); acknowledge(alert) }}
                  className="shrink-0 rounded border border-gray-700 p-1 text-gray-500 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
                  title="Mark as acknowledged"
                >
                  <CheckCheck className="size-3" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AlertList
