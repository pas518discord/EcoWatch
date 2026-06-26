import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-8 w-24" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function MapSkeleton() {
  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
      <Skeleton className="h-[480px] w-full rounded-none" />
    </Card>
  )
}

export function InsightsSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col gap-4 pt-2">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg bg-secondary/40 p-4">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-1 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function AlertsSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col gap-3 pt-2">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 p-3">
            <div className="flex justify-between gap-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
