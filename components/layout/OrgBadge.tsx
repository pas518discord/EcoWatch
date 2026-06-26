"use client"

import { useSession, signOut } from "next-auth/react"
import {
  User, LogOut, Settings, ChevronDown,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import type { OrgPlan } from "@/lib/db-schema"

const PLAN_STYLES: Record<OrgPlan, { badge: string; label: string }> = {
  starter:    { badge: "bg-slate-500/20 text-slate-300 border-slate-500/30",       label: "Starter"    },
  pro:        { badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", label: "Pro"        },
  enterprise: { badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",       label: "Enterprise" },
}

export function OrgBadge() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  if (status === "loading") {
    return (
      <div className="h-8 w-36 animate-pulse rounded-lg bg-gray-800" />
    )
  }

  if (!session) return null

  const plan = (session.user.plan ?? "starter") as OrgPlan
  const planStyle = PLAN_STYLES[plan] ?? PLAN_STYLES.starter

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-1.5 transition-colors hover:border-gray-700"
      >
        {/* Avatar */}
        <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <User className="size-3.5" />
        </div>

        {/* Org name */}
        <span className="hidden max-w-[140px] truncate text-sm font-medium text-gray-200 sm:block">
          {session.user.orgName}
        </span>

        {/* Plan badge */}
        <span
          className={`hidden rounded border px-1.5 py-0.5 text-[10px] font-semibold sm:inline-flex ${planStyle.badge}`}
        >
          {planStyle.label}
        </span>

        <ChevronDown
          className={`size-3.5 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-800 bg-gray-900 shadow-2xl z-50">
          {/* User info */}
          <div className="border-b border-gray-800 px-4 py-3">
            <p className="text-xs font-semibold text-gray-100 truncate">
              {session.user.orgName}
            </p>
            <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            <span className={`mt-1.5 inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold ${planStyle.badge}`}>
              {planStyle.label} Plan
            </span>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <a
              href="/settings"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
              onClick={() => setOpen(false)}
            >
              <Settings className="size-4 text-gray-500" />
              Settings
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrgBadge
