import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard-shell"
import { ReportsView } from "@/components/reports/reports-view"

export const metadata: Metadata = {
  title: "ESG Reports | EcoWatch",
  description:
    "Generate and review ESG climate reports covering air quality, deforestation, and emissions across your regions.",
}

export default function ReportsPage() {
  return (
    <DashboardShell>
      <ReportsView />
    </DashboardShell>
  )
}
