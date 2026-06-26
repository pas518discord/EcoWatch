"use client"

import { useEffect, useState } from "react"
import type { RiskLevel } from "@/lib/db-schema"

interface RiskScoreMeterProps {
  score: number       // 0-100
  riskLevel: RiskLevel
  size?: number       // px, default 160
  animate?: boolean
}

// Color config per risk level
const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; label: string }> = {
  LOW:      { color: "#10b981", bg: "#064e3b", label: "LOW" },
  MEDIUM:   { color: "#eab308", bg: "#422006", label: "MEDIUM" },
  HIGH:     { color: "#f97316", bg: "#431407", label: "HIGH" },
  CRITICAL: { color: "#ef4444", bg: "#450a0a", label: "CRITICAL" },
}

export function RiskScoreMeter({
  score,
  riskLevel,
  size = 160,
  animate = true,
}: RiskScoreMeterProps) {
  const [displayed, setDisplayed] = useState(animate ? 0 : score)

  // Animate the number counting up on mount
  useEffect(() => {
    if (!animate) return
    let frame = 0
    const total = 40 // frames
    const timer = setInterval(() => {
      frame++
      setDisplayed(Math.round((score * frame) / total))
      if (frame >= total) clearInterval(timer)
    }, 16) // ~60fps
    return () => clearInterval(timer)
  }, [score, animate])

  const config = RISK_CONFIG[riskLevel] ?? RISK_CONFIG.LOW

  // SVG arc math
  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.78
  const strokeW = size * 0.08
  const circumference = 2 * Math.PI * radius

  // We draw 270° of arc (leaving 90° gap at the bottom)
  const arcFraction = 0.75
  const totalArc = circumference * arcFraction
  const fillArc = (displayed / 100) * totalArc
  const gapArc = totalArc - fillArc

  // Rotate so arc starts at bottom-left (-225°)
  const rotation = -225

  return (
    <div
      className="flex flex-col items-center gap-3"
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Risk score: ${score} (${riskLevel})`}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#1f2937"
            strokeWidth={strokeW}
            strokeDasharray={`${totalArc} ${circumference - totalArc}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${cx} ${cy})`}
          />

          {/* Filled arc — actual risk level */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth={strokeW}
            strokeDasharray={`${fillArc} ${gapArc + (circumference - totalArc)}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${cx} ${cy})`}
            style={{
              transition: animate ? "stroke-dasharray 0.8s ease-out" : undefined,
              filter: `drop-shadow(0 0 ${size * 0.05}px ${config.color}80)`,
            }}
          />
        </svg>

        {/* Centre content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span
            className="font-bold tabular-nums"
            style={{
              fontSize: size * 0.28,
              color: config.color,
              lineHeight: 1,
            }}
          >
            {displayed}
          </span>
          <span
            className="font-semibold tracking-widest uppercase"
            style={{
              fontSize: size * 0.09,
              color: config.color,
              opacity: 0.85,
            }}
          >
            {config.label}
          </span>
        </div>
      </div>

      {/* Sub-label */}
      <p className="text-xs text-gray-400 font-medium">Environmental Risk Score</p>
    </div>
  )
}

export default RiskScoreMeter
