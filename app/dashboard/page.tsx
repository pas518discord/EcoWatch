import { DashboardShell } from "@/components/dashboard-shell"
import { MetricCard } from "@/components/metric-card"
import { ClimateMap } from "@/components/map/ClimateMap"
import { AIInsightsPanel } from "@/components/ai-insights-panel"
import { AQITimeSeries } from "@/components/charts/AQITimeSeries"
import { VegetationTrend } from "@/components/charts/VegetationTrend"
import { metrics } from "@/lib/data"

export default function DashboardPage() {
  return (
    <DashboardShell
      title="Climate Overview"
      description="Live environmental intelligence across all monitored regions."
    >
      <div className="flex flex-col gap-6">
        {/* Row 1 — key metrics */}
        <section
          aria-label="Key metrics"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        {/* Row 2 — climate map (60%) + AI insights (40%) */}
        <section
          aria-label="Map and insights"
          className="grid grid-cols-1 gap-6 lg:grid-cols-5"
        >
          <div className="lg:col-span-3">
            <ClimateMap />
          </div>
          <div className="lg:col-span-2">
            <AIInsightsPanel />
          </div>
        </section>

        {/* Row 3 — time-series analytics */}
        <section
          aria-label="Trend analytics"
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <AQITimeSeries />
          <VegetationTrend />
        </section>
      </div>
    </DashboardShell>
  )
}
