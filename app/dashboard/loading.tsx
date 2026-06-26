import { DashboardShell } from "@/components/dashboard-shell"
import {
  MetricsSkeleton,
  MapSkeleton,
  InsightsSkeleton,
  AlertsSkeleton,
} from "@/components/dashboard-skeleton"

export default function DashboardLoading() {
  return (
    <DashboardShell
      title="Climate Overview"
      description="Live environmental intelligence across all monitored regions."
    >
      <div className="flex flex-col gap-6">
        <MetricsSkeleton />
        <MapSkeleton />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InsightsSkeleton />
          <AlertsSkeleton />
        </div>
      </div>
    </DashboardShell>
  )
}
