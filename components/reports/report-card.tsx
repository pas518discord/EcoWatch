import { Wind, Trees, Flame, Cloud, Check, FileText, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { AqiStatus, ClimateReport } from "@/lib/reports-data"
import { RiskRing } from "@/components/reports/risk-ring"

function aqiColor(status: AqiStatus) {
  switch (status) {
    case "Good":
      return "text-emerald-400"
    case "Moderate":
      return "text-amber-400"
    case "Unhealthy":
      return "text-orange-400"
    case "Hazardous":
      return "text-red-400"
  }
}

interface MetricBadgeProps {
  icon: React.ReactNode
  label: string
  value: string
  valueClass?: string
}

function MetricBadge({ icon, label, value, valueClass }: MetricBadgeProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/60 px-2.5 py-2">
      <span className="text-gray-500">{icon}</span>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-wide text-gray-500">{label}</span>
        <span className={cn("text-sm font-medium text-gray-100", valueClass)}>{value}</span>
      </div>
    </div>
  )
}

export function ReportCard({ report }: { report: ClimateReport }) {
  return (
    <Card className="border-gray-800 bg-gray-900 text-gray-100 ring-gray-800">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading text-base font-semibold text-balance text-gray-50">
              {report.title}
            </h3>
            <p className="mt-0.5 text-xs text-gray-400">{report.dateRange}</p>
            <p className="mt-0.5 text-xs text-gray-500">
              {report.region} &middot; {report.period}
            </p>
          </div>
          <RiskRing score={report.riskScore} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <MetricBadge
            icon={<Wind className="size-4" />}
            label="AQI"
            value={report.aqiStatus}
            valueClass={aqiColor(report.aqiStatus)}
          />
          <MetricBadge
            icon={<Trees className="size-4" />}
            label="Forest cover"
            value={`${report.forestCover}%`}
          />
          <MetricBadge
            icon={<Flame className="size-4" />}
            label="Fires"
            value={report.fires.toLocaleString()}
          />
          <MetricBadge icon={<Cloud className="size-4" />} label="CO2" value={report.co2} />
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
            <Check className="size-3" /> WHO AQI
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
            <Check className="size-3" /> GRI Aligned
          </span>
        </div>
      </CardContent>

      <CardFooter className="gap-2 border-gray-800 bg-gray-900/40">
        <Button size="sm" className="flex-1 bg-emerald-500 text-gray-950 hover:bg-emerald-400">
          <FileText className="size-3.5" /> View Report
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 border-gray-700 bg-transparent text-gray-200 hover:bg-gray-800 hover:text-gray-50"
        >
          <Download className="size-3.5" /> Download PDF
        </Button>
      </CardFooter>
    </Card>
  )
}
