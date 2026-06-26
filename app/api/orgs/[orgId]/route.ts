import { NextRequest, NextResponse } from "next/server"
import {
  getOrganization,
  updateAlertThresholds,
  updateMonitoredRegions,
} from "@/lib/db-operations"

interface RouteParams {
  params: Promise<{ orgId: string }>
}

// GET /api/orgs/:orgId — fetch a single organization
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { orgId } = await params

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 })
  }

  try {
    const org = await getOrganization(orgId)
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }
    return NextResponse.json({ org })
  } catch (err) {
    console.error("Get org error:", err)
    return NextResponse.json({ error: "Failed to load organization" }, { status: 500 })
  }
}

// PATCH /api/orgs/:orgId — update alert thresholds and/or monitored regions
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { orgId } = await params

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 })
  }

  try {
    const body = await req.json()

    if (body.alertThresholds) {
      await updateAlertThresholds(orgId, body.alertThresholds)
    }
    if (Array.isArray(body.monitoredRegions)) {
      await updateMonitoredRegions(orgId, body.monitoredRegions)
    }

    const org = await getOrganization(orgId)
    return NextResponse.json({ success: true, org })
  } catch (err) {
    console.error("Update org error:", err)
    return NextResponse.json({ error: "Failed to update organization" }, { status: 500 })
  }
}
