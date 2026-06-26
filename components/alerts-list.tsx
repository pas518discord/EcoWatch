import { Clock, MapPin } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SeverityBadge } from "@/components/severity-badge"
import { alerts as allAlerts, type Alert } from "@/lib/data"

export function AlertsList({
  items = allAlerts,
  title = "Recent Alerts",
  description = "Latest environmental events across your regions",
}: {
  items?: Alert[]
  title?: string
  description?: string
}) {
  return (
    <Card className="h-full">
      <CardHeader className="border-b [.border-b]:pb-4">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {items.map((alert) => (
          <div
            key={alert.id}
            className="flex flex-col gap-2 rounded-lg p-3 transition-colors hover:bg-secondary/60"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-medium text-foreground text-pretty">
                {alert.title}
              </h3>
              <SeverityBadge severity={alert.severity} />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {alert.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/80">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {alert.region}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {alert.timestamp}
              </span>
              <span className="ml-auto font-mono text-muted-foreground/60">
                {alert.id}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
