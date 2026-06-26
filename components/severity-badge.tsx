import { cn } from "@/lib/utils"
import { type Severity, severityLabels } from "@/lib/data"

const styles: Record<Severity, string> = {
  critical: "bg-destructive/15 text-destructive ring-destructive/30",
  high: "bg-chart-3/15 text-chart-3 ring-chart-3/30",
  moderate: "bg-chart-2/15 text-chart-2 ring-chart-2/30",
  low: "bg-primary/15 text-primary ring-primary/30",
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-xs font-medium ring-1 ring-inset",
        styles[severity],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {severityLabels[severity]}
    </span>
  )
}
