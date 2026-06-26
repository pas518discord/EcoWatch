import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

// These env vars are auto-added by Vercel when you connect
// AWS via the Storage tab — no manual setup needed
const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// DocumentClient handles marshalling/unmarshalling automatically
// so you work with plain JS objects instead of DynamoDB types
export const db = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
})

// Table name constants — change these if you name tables differently
export const TABLES = {
  CLIMATE_READINGS: "climate_readings",
  ALERTS: "ecowatch_alerts",
  ORGANIZATIONS: "organizations",
  AI_REPORTS: "ai_reports",
} as const
