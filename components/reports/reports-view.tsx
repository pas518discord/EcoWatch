"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { REGIONS, SAMPLE_REPORTS } from "@/lib/reports-data"
import { ReportCard } from "@/components/reports/report-card"
import { EmptyState } from "@/components/reports/empty-state"
import { PricingSection } from "@/components/reports/pricing-section"

export function ReportsView() {
  const [period, setPeriod] = useState<string>("all")
  const [region, setRegion] = useState<string>("All Regions")

  const reports = useMemo(() => {
    return SAMPLE_REPORTS.filter((r) => {
      const matchPeriod = period === "all" || r.period === period
      const matchRegion = region === "All Regions" || r.region === region
      return matchPeriod && matchRegion
    })
  }, [period, region])

  function resetFilters() {
    setPeriod("all")
    setRegion("All Regions")
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-gray-50 md:text-3xl">
            ESG Reports
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Air quality, deforestation, and emissions intelligence across your regions.
          </p>
        </div>
        <Button className="bg-emerald-500 text-gray-950 hover:bg-emerald-400" size="lg">
          <Plus className="size-4" /> Generate New Report
        </Button>
      </header>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900/60 p-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Period</span>
          <Select value={period} onValueChange={(v) => setPeriod(v as string)}>
            <SelectTrigger className="w-36 border-gray-700 bg-gray-950 text-gray-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All periods</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="Quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Region</span>
          <Select value={region} onValueChange={(v) => setRegion(v as string)}>
            <SelectTrigger className="w-48 border-gray-700 bg-gray-950 text-gray-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports grid or empty state */}
      {reports.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <EmptyState onGenerate={resetFilters} />
      )}

      {/* Pricing */}
      <PricingSection />
    </div>
  )
}
