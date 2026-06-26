"use client"

import { useState } from "react"
import { Activity, Trees, Flame, Factory, ChevronDown, MapPin } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ---------------------------------------------------------------------------
// Types & mock data
// ---------------------------------------------------------------------------

export type ClimateMetric = "aqi" | "forest" | "fire" | "co2"

interface MetricConfig {
  id: ClimateMetric
  label: string
  icon: React.ComponentType<{ className?: string }>
  /** Tailwind class for the color dot indicator */
  dotClass: string
}

const METRICS: MetricConfig[] = [
  { id: "aqi", label: "AQI", icon: Activity, dotClass: "bg-sky-400" },
  { id: "forest", label: "Forest", icon: Trees, dotClass: "bg-emerald-500" },
  { id: "fire", label: "Fire", icon: Flame, dotClass: "bg-orange-500" },
  { id: "co2", label: "CO₂", icon: Factory, dotClass: "bg-rose-500" },
]

const LEGEND_STOPS = [
  { label: "Good", swatchClass: "bg-emerald-500" },
  { label: "Moderate", swatchClass: "bg-yellow-400" },
  { label: "Unhealthy", swatchClass: "bg-orange-500" },
  { label: "Hazardous", swatchClass: "bg-red-600" },
]

const DEFAULT_REGIONS = [
  "North America",
  "South America",
  "Europe",
  "Africa",
  "Asia Pacific",
  "Middle East",
]

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ClimateMapProps {
  /** Currently active metric (controlled). Falls back to internal state if omitted. */
  activeMetric?: ClimateMetric
  onMetricChange?: (metric: ClimateMetric) => void
  regions?: string[]
  activeRegion?: string
  onRegionChange?: (region: string) => void
  isLoading?: boolean
  className?: string
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function ClimateMapSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-[600px] w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-950",
        className,
      )}
    >
      {/* Left panel skeleton */}
      <div className="absolute left-4 top-4 z-10 flex w-44 flex-col gap-2 rounded-lg border border-gray-800 bg-gray-900/80 p-3">
        <Skeleton className="h-4 w-20 bg-gray-800" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full bg-gray-800" />
        ))}
      </div>

      {/* Region selector skeleton */}
      <div className="absolute right-4 top-4 z-10">
        <Skeleton className="h-9 w-40 bg-gray-800" />
      </div>

      {/* Legend skeleton */}
      <div className="absolute inset-x-4 bottom-4 z-10">
        <Skeleton className="h-12 w-full bg-gray-800" />
      </div>

      {/* Map area shimmer */}
      <div className="flex h-full w-full items-center justify-center">
        <Skeleton className="h-full w-full rounded-none bg-gray-900" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ClimateMap({
  activeMetric,
  onMetricChange,
  regions = DEFAULT_REGIONS,
  activeRegion,
  onRegionChange,
  isLoading = false,
  className,
}: ClimateMapProps) {
  const [internalMetric, setInternalMetric] = useState<ClimateMetric>("aqi")
  const [internalRegion, setInternalRegion] = useState<string>(regions[0])

  const selectedMetric = activeMetric ?? internalMetric
  const selectedRegion = activeRegion ?? internalRegion

  function handleMetricChange(metric: ClimateMetric) {
    setInternalMetric(metric)
    onMetricChange?.(metric)
  }

  function handleRegionChange(region: string) {
    setInternalRegion(region)
    onRegionChange?.(region)
  }

  if (isLoading) {
    return <ClimateMapSkeleton className={className} />
  }

  return (
    <div
      className={cn(
        "relative h-[600px] w-full overflow-hidden rounded-xl border border-gray-800 bg-gray-950",
        className,
      )}
    >
      {/* Placeholder map area (dark CartoDB stand-in) */}
      <div
        className="absolute inset-0 bg-gray-950"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      >
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <MapPin className="size-8" />
            <p className="text-sm font-medium">Map area</p>
            <p className="text-xs text-gray-700">Dark CartoDB tiles render here</p>
          </div>
        </div>
      </div>

      {/* Left panel: metric toggles */}
      <div className="absolute left-4 top-4 z-10 w-44 rounded-lg border border-gray-800 bg-gray-900/80 p-3 backdrop-blur-sm">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Metrics
        </p>
        <div className="flex flex-col gap-1.5">
          {METRICS.map((metric) => {
            const Icon = metric.icon
            const isActive = metric.id === selectedMetric
            return (
              <Button
                key={metric.id}
                type="button"
                variant="ghost"
                onClick={() => handleMetricChange(metric.id)}
                aria-pressed={isActive}
                className={cn(
                  "h-9 w-full justify-start gap-2 px-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-gray-100",
                  isActive && "bg-gray-800 text-gray-50 ring-1 ring-gray-700",
                )}
              >
                <span
                  className={cn("size-2.5 shrink-0 rounded-full", metric.dotClass)}
                  aria-hidden="true"
                />
                <Icon className="size-4 shrink-0 text-gray-400" />
                <span className="flex-1 text-left">{metric.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Top-right: region selector */}
      <div className="absolute right-4 top-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="h-9 min-w-40 justify-between gap-2 border-gray-800 bg-gray-900/80 text-sm text-gray-200 backdrop-blur-sm hover:bg-gray-800 hover:text-gray-50"
              />
            }
          >
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-gray-400" />
              {selectedRegion}
            </span>
            <ChevronDown className="size-4 text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-40 border-gray-800 bg-gray-900 text-gray-200"
          >
            {regions.map((region) => (
              <DropdownMenuItem
                key={region}
                onSelect={() => handleRegionChange(region)}
                className={cn(
                  "cursor-pointer text-sm text-gray-300 focus:bg-gray-800 focus:text-gray-50",
                  region === selectedRegion && "bg-gray-800 text-gray-50",
                )}
              >
                {region}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Bottom legend bar */}
      <div className="absolute inset-x-4 bottom-4 z-10 rounded-lg border border-gray-800 bg-gray-900/80 p-3 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {METRICS.find((m) => m.id === selectedMetric)?.label} scale
          </p>
          <div className="flex-1">
            {/* Continuous color scale green -> yellow -> orange -> red */}
            <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 via-orange-500 to-red-600" />
            <div className="mt-1.5 flex items-center justify-between">
              {LEGEND_STOPS.map((stop) => (
                <div key={stop.label} className="flex items-center gap-1.5">
                  <span
                    className={cn("size-2 rounded-full", stop.swatchClass)}
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-medium text-gray-400">
                    {stop.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClimateMap
