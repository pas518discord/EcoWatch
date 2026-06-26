import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type Metric } from "@/lib/data"

export function MetricCard({ metric }: { metric: Metric }) {
  const up = metric.trend >= 0
  const good = up === metric.positiveIsGood
  const TrendIcon = up ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {metric.label}
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
              good
                ? "bg-primary/12 text-primary ring-primary/25"
                : "bg-destructive/12 text-destructive ring-destructive/25",
            )}
          >
            <TrendIcon className="size-3" />
            {up ? "+" : ""}
            {metric.trend}%
          </span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
            {metric.value}
          </span>
          {metric.unit && (
            <span className="text-sm font-medium text-muted-foreground">
              {metric.unit}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-muted-foreground">{metric.helper}</p>
          <p className="text-xs text-muted-foreground/70">{metric.trendLabel}</p>
        </div>
      </CardContent>
    </Card>
  )
}
