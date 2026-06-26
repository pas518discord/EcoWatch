import { Wind, Trees, Bell } from "lucide-react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent } from "@/components/ui/card"
import { SeverityBadge } from "@/components/severity-badge"
import { regions } from "@/lib/data"

export default function RegionsPage() {
  return (
    <DashboardShell
      title="Regions"
      description="Environmental performance across all monitored geographies."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {regions.map((region) => (
          <Card key={region.name} className="transition-colors hover:bg-card/80">
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-medium text-foreground">
                    {region.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {region.country}
                  </p>
                </div>
                <SeverityBadge severity={region.risk} />
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-border pt-4">
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Wind className="size-3.5" /> AQI
                  </span>
                  <span className="text-lg font-semibold text-foreground tabular-nums">
                    {region.aqi}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Trees className="size-3.5" /> Forest
                  </span>
                  <span className="text-lg font-semibold text-foreground tabular-nums">
                    {region.forest}%
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Bell className="size-3.5" /> Alerts
                  </span>
                  <span className="text-lg font-semibold text-foreground tabular-nums">
                    {region.alerts}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  )
}
