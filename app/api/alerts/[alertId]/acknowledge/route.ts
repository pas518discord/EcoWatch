import { NextRequest, NextResponse } from "next/server"
import { acknowledgeAlert } from "@/lib/db-operations"

interface RouteParams {
  params: Promise<{ alertId: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { alertId } = await params
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get("orgId")

  if (!orgId || !alertId) {
    return NextResponse.json(
      { error: "orgId (query) and alertId (path) are required" },
      { status: 400 }
    )
  }

  try {
    await acknowledgeAlert(orgId, alertId)
    return NextResponse.json({
      success: true,
      alertId,
      acknowledged: true,
      acknowledgedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error("Acknowledge error:", err)
    return NextResponse.json(
      { error: "Failed to acknowledge alert" },
      { status: 500 }
    )
  }
}
