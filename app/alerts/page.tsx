import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent } from "@/components/ui/card"
import { AlertsList } from "@/components/alerts-list"
import { alerts, type Severity } from "@/lib/data"

const summary: { severity: Severity; label: string }[] = [
  { severity: "critical", label: "Critical" },
  { severity: "high", label: "High" },
  { severity: "moderate", label: "Moderate" },
  { severity: "low", label: "Low" },
]

const tones: Record<Severity, string> = {
  critical: "text-destructive",
  high: "text-chart-3",
  moderate: "text-chart-2",
  low: "text-primary",
}

export default function AlertsPage() {
  return (
    <DashboardShell
      title="Alerts"
      description="All active and recent environmental alerts across your network."
    >
      <div className="flex flex-col gap-6">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summary.map((s) => {
            const count = alerts.filter((a) => a.severity === s.severity).length
            return (
              <Card key={s.severity}>
                <CardContent className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {s.label}
                  </span>
                  <span
                    className={`text-2xl font-semibold tabular-nums ${tones[s.severity]}`}
                  >
                    {count}
                  </span>
                </CardContent>
              </Card>
            )
          })}
        </section>

        <AlertsList
          title="Alert Feed"
          description="Chronological list of detected events"
        />
      </div>
    </DashboardShell>
  )
}
