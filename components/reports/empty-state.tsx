import { FileBarChart, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

export function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900/40 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-emerald-400">
        <FileBarChart className="size-6" />
      </div>
      <h3 className="mt-4 font-heading text-lg font-semibold text-gray-50">No reports yet</h3>
      <p className="mt-1 max-w-sm text-sm text-pretty text-gray-400">
        Generate your first ESG report to track air quality, deforestation, and emissions across
        your regions.
      </p>
      <Button
        onClick={onGenerate}
        className="mt-5 bg-emerald-500 text-gray-950 hover:bg-emerald-400"
      >
        <Plus className="size-4" /> Generate New Report
      </Button>
    </div>
  )
}
