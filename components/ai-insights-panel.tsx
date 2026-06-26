import { Sparkles, LineChart, Lightbulb, type LucideIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { insights, type Insight } from "@/lib/data"

const categoryIcon: Record<Insight["category"], LucideIcon> = {
  Prediction: LineChart,
  Trend: Sparkles,
  Recommendation: Lightbulb,
}

export function AIInsightsPanel() {
  return (
    <Card className="h-full">
      <CardHeader className="border-b [.border-b]:pb-4">
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="size-4" />
          </span>
          AI Insights
        </CardTitle>
        <CardDescription>
          Model-generated risk forecasts and sustainability guidance
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {insights.map((insight) => {
          const Icon = categoryIcon[insight.category]
          return (
            <div
              key={insight.id}
              className="rounded-lg bg-secondary/50 p-4 ring-1 ring-inset ring-border transition-colors hover:bg-secondary"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Icon className="size-3.5" />
                  {insight.category}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {insight.confidence}% confidence
                </span>
              </div>
              <h3 className="mt-2 text-sm font-medium text-foreground text-pretty">
                {insight.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {insight.body}
              </p>
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${insight.confidence}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
