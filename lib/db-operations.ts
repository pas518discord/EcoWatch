import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb"
import { db, TABLES } from "./dynamodb"
import type {
  ClimateReading,
  Alert,
  Organization,
  AIReport,
} from "./db-schema"

// ─────────────────────────────────────────────
// CLIMATE READINGS
// ─────────────────────────────────────────────

/** Save one reading from NASA / OpenAQ to DynamoDB */
export async function putClimateReading(
  reading: ClimateReading
): Promise<void> {
  await db.send(
    new PutCommand({
      TableName: TABLES.CLIMATE_READINGS,
      Item: reading,
    })
  )
}

/** Save multiple readings in parallel (used by ingest route) */
export async function putClimateReadings(
  readings: ClimateReading[]
): Promise<void> {
  await Promise.all(readings.map(putClimateReading))
}

/**
 * Get readings for a region between two timestamps.
 * SK format is "TIMESTAMP#DATA_TYPE" so date-range queries work naturally.
 */
export async function getReadingsByRegion(
  regionId: string,
  startDate: string, // ISO string e.g. "2026-06-01T00:00:00Z"
  endDate: string,   // ISO string e.g. "2026-06-26T23:59:59Z"
  dataType?: string  // optional filter e.g. "AQI"
): Promise<ClimateReading[]> {
  const result = await db.send(
    new QueryCommand({
      TableName: TABLES.CLIMATE_READINGS,
      KeyConditionExpression:
        "regionId = :regionId AND sk BETWEEN :start AND :end",
      ExpressionAttributeValues: {
        ":regionId": regionId,
        ":start": startDate,
        ":end": endDate,
      },
      // Filter by data type if specified
      ...(dataType && {
        FilterExpression: "data_type = :type",
        ExpressionAttributeValues: {
          ":regionId": regionId,
          ":start": startDate,
          ":end": endDate,
          ":type": dataType,
        },
      }),
      ScanIndexForward: false, // newest first
      Limit: 500,
    })
  )
  return (result.Items ?? []) as ClimateReading[]
}

/** Get the most recent reading for a region + type (for dashboard cards) */
export async function getLatestReading(
  regionId: string,
  dataType: string
): Promise<ClimateReading | null> {
  const result = await db.send(
    new QueryCommand({
      TableName: TABLES.CLIMATE_READINGS,
      KeyConditionExpression: "regionId = :regionId",
      FilterExpression: "data_type = :type",
      ExpressionAttributeValues: {
        ":regionId": regionId,
        ":type": dataType,
      },
      ScanIndexForward: false,
      Limit: 1,
    })
  )
  return (result.Items?.[0] ?? null) as ClimateReading | null
}

// ─────────────────────────────────────────────
// ALERTS
// ─────────────────────────────────────────────

/** Create a new alert (called by alert engine when threshold crossed) */
export async function createAlert(alert: Alert): Promise<void> {
  await db.send(
    new PutCommand({
      TableName: TABLES.ALERTS,
      Item: alert,
      // Don't overwrite if exact same alertId exists
      ConditionExpression: "attribute_not_exists(alertId)",
    })
  )
}

/** Get all alerts for an org, newest first */
export async function getAlertsByOrg(
  orgId: string,
  limit = 50
): Promise<Alert[]> {
  const result = await db.send(
    new QueryCommand({
      TableName: TABLES.ALERTS,
      KeyConditionExpression: "orgId = :orgId",
      ExpressionAttributeValues: { ":orgId": orgId },
      ScanIndexForward: false, // newest first
      Limit: limit,
    })
  )
  return (result.Items ?? []) as Alert[]
}

/** Count unread (unacknowledged) alerts for an org */
export async function getUnreadAlertCount(orgId: string): Promise<number> {
  const result = await db.send(
    new QueryCommand({
      TableName: TABLES.ALERTS,
      KeyConditionExpression: "orgId = :orgId",
      FilterExpression: "acknowledged = :false",
      ExpressionAttributeValues: {
        ":orgId": orgId,
        ":false": false,
      },
      Select: "COUNT",
    })
  )
  return result.Count ?? 0
}

/** Mark a single alert as acknowledged */
export async function acknowledgeAlert(
  orgId: string,
  alertId: string
): Promise<void> {
  await db.send(
    new UpdateCommand({
      TableName: TABLES.ALERTS,
      Key: { orgId, alertId },
      UpdateExpression: "SET acknowledged = :true",
      ExpressionAttributeValues: { ":true": true },
    })
  )
}

// ─────────────────────────────────────────────
// ORGANIZATIONS
// ─────────────────────────────────────────────

/** Get one org by ID */
export async function getOrganization(
  orgId: string
): Promise<Organization | null> {
  const result = await db.send(
    new GetCommand({
      TableName: TABLES.ORGANIZATIONS,
      Key: { orgId },
    })
  )
  return (result.Item ?? null) as Organization | null
}

/** Create or overwrite an org (used in seed script) */
export async function putOrganization(org: Organization): Promise<void> {
  await db.send(
    new PutCommand({
      TableName: TABLES.ORGANIZATIONS,
      Item: { ...org, updatedAt: new Date().toISOString() },
    })
  )
}

/** Update alert thresholds for an org */
export async function updateAlertThresholds(
  orgId: string,
  thresholds: Partial<Organization["alertThresholds"]>
): Promise<void> {
  await db.send(
    new UpdateCommand({
      TableName: TABLES.ORGANIZATIONS,
      Key: { orgId },
      UpdateExpression:
        "SET alertThresholds = :t, updatedAt = :now",
      ExpressionAttributeValues: {
        ":t": thresholds,
        ":now": new Date().toISOString(),
      },
    })
  )
}

/** Update which regions an org monitors */
export async function updateMonitoredRegions(
  orgId: string,
  regions: string[]
): Promise<void> {
  await db.send(
    new UpdateCommand({
      TableName: TABLES.ORGANIZATIONS,
      Key: { orgId },
      UpdateExpression:
        "SET monitoredRegions = :r, updatedAt = :now",
      ExpressionAttributeValues: {
        ":r": regions,
        ":now": new Date().toISOString(),
      },
    })
  )
}

// ─────────────────────────────────────────────
// AI REPORTS
// ─────────────────────────────────────────────

/** Save a newly generated AI report */
export async function saveAIReport(report: AIReport): Promise<void> {
  await db.send(
    new PutCommand({
      TableName: TABLES.AI_REPORTS,
      Item: report,
    })
  )
}

/** Get all AI reports for an org, newest first */
export async function getReportsByOrg(
  orgId: string,
  limit = 20
): Promise<AIReport[]> {
  const result = await db.send(
    new QueryCommand({
      TableName: TABLES.AI_REPORTS,
      KeyConditionExpression: "orgId = :orgId",
      ExpressionAttributeValues: { ":orgId": orgId },
      ScanIndexForward: false,
      Limit: limit,
    })
  )
  return (result.Items ?? []) as AIReport[]
}

/** Get one specific report by orgId + date + region */
export async function getReport(
  orgId: string,
  reportDate: string,
  regionId: string
): Promise<AIReport | null> {
  const result = await db.send(
    new GetCommand({
      TableName: TABLES.AI_REPORTS,
      Key: { orgId, sk: `${reportDate}#${regionId}` },
    })
  )
  return (result.Item ?? null) as AIReport | null
}
