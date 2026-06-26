import { cn } from "@/lib/utils"

interface RiskRingProps {
  score: number // 0-100
  size?: number
}

function riskColor(score: number) {
  if (score >= 70) return { stroke: "stroke-red-500", text: "text-red-400", label: "High" }
  if (score >= 40) return { stroke: "stroke-amber-500", text: "text-amber-400", label: "Medium" }
  return { stroke: "stroke-emerald-500", text: "text-emerald-400", label: "Low" }
}

export function RiskRing({ score, size = 84 }: RiskRingProps) {
  const stroke = 7
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference
  const { stroke: ringStroke, text, label } = riskColor(score)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-gray-800"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("transition-all", ringStroke)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-xl font-semibold tabular-nums", text)}>{score}</span>
        </div>
      </div>
      <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label} risk
      </span>
      <span className="sr-only">{`Risk score ${score} out of 100, ${label} risk`}</span>
    </div>
  )
}
