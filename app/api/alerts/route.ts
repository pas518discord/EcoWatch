import { NextRequest, NextResponse } from "next/server"
import { getAlertsByOrg, getUnreadAlertCount } from "@/lib/db-operations"

// GET /api/alerts?orgId=org_demo_001&limit=50
// Returns the most recent alerts for an org plus an unread count header.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orgId = searchParams.get("orgId")
  const limit = parseInt(searchParams.get("limit") ?? "50", 10)

  if (!orgId) {
    return NextResponse.json(
      { error: "orgId query param is required" },
      { status: 400 }
    )
  }

  try {
    const [alerts, unreadCount] = await Promise.all([
      getAlertsByOrg(orgId, Number.isFinite(limit) ? limit : 50),
      getUnreadAlertCount(orgId),
    ])

    return NextResponse.json(
      { alerts, unreadCount },
      { headers: { "X-Unread-Count": String(unreadCount) } }
    )
  } catch (err) {
    console.error("List alerts error:", err)
    return NextResponse.json(
      { error: "Failed to load alerts" },
      { status: 500 }
    )
  }
}
