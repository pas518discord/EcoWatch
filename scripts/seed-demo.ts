/**
 * RUN THIS ONCE to set up DynamoDB tables + seed demo data
 * Command: npx tsx scripts/seed-demo.ts
 */

import {
  DynamoDBClient,
  CreateTableCommand,
  type CreateTableCommandInput,
} from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb"
import type { Organization, ClimateReading } from "../lib/db-schema"
import { TABLES } from "../lib/dynamodb"
import * as dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const client = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "ap-south-1",
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})
const db = DynamoDBDocumentClient.from(client)

// ── CREATE TABLES ──────────────────────────────────────────
async function createTables() {
  const tables: CreateTableCommandInput[] = [
    {
      TableName: TABLES.CLIMATE_READINGS,
      KeySchema: [
        { AttributeName: "regionId", KeyType: "HASH" },
        { AttributeName: "sk",       KeyType: "RANGE" },
      ],
      AttributeDefinitions: [
        { AttributeName: "regionId", AttributeType: "S" },
        { AttributeName: "sk",       AttributeType: "S" },
      ],
      BillingMode: "PAY_PER_REQUEST" as const,
    },
    {
      TableName: TABLES.ALERTS,
      KeySchema: [
        { AttributeName: "orgId",    KeyType: "HASH" },
        { AttributeName: "alertId",  KeyType: "RANGE" },
      ],
      AttributeDefinitions: [
        { AttributeName: "orgId",    AttributeType: "S" },
        { AttributeName: "alertId",  AttributeType: "S" },
      ],
      BillingMode: "PAY_PER_REQUEST" as const,
    },
    {
      TableName: TABLES.ORGANIZATIONS,
      KeySchema: [
        { AttributeName: "orgId",    KeyType: "HASH" },
      ],
      AttributeDefinitions: [
        { AttributeName: "orgId",    AttributeType: "S" },
      ],
      BillingMode: "PAY_PER_REQUEST" as const,
    },
    {
      TableName: TABLES.AI_REPORTS,
      KeySchema: [
        { AttributeName: "orgId",    KeyType: "HASH" },
        { AttributeName: "sk",       KeyType: "RANGE" },
      ],
      AttributeDefinitions: [
        { AttributeName: "orgId",    AttributeType: "S" },
        { AttributeName: "sk",       AttributeType: "S" },
      ],
      BillingMode: "PAY_PER_REQUEST" as const,
    },
  ]

  for (const table of tables) {
    try {
      await client.send(new CreateTableCommand(table))
      console.log(`✅ Created table: ${table.TableName}`)
    } catch (err: unknown) {
      if (
        err instanceof Error &&
        err.name === "ResourceInUseException"
      ) {
        console.log(`⚠️  Table already exists: ${table.TableName}`)
      } else {
        throw err
      }
    }
  }
}

// ── SEED ORGANIZATIONS ─────────────────────────────────────
async function seedOrganizations() {
  const orgs: Organization[] = [
    {
      orgId: "org_demo_001",
      name: "GreenCorp ESG Team",
      email: "demo@ecowatch.io",
      plan: "pro",
      monitoredRegions: ["IN-AP", "BR-AM"],
      alertThresholds: { AQI: 100, NDVI: 0.3, CO2: 420, FIRE: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      orgId: "org_demo_002",
      name: "Amazon Watch NGO",
      email: "demo2@ecowatch.io",
      plan: "starter",
      monitoredRegions: ["BR-AM", "ID-KL"],
      alertThresholds: { AQI: 150, NDVI: 0.2, CO2: 450, FIRE: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  for (const org of orgs) {
    await db.send(new PutCommand({ TableName: TABLES.ORGANIZATIONS, Item: org }))
    console.log(`✅ Seeded org: ${org.name}`)
  }
}

// ── SEED 30 DAYS OF CLIMATE READINGS ──────────────────────
async function seedClimateReadings() {
  const readings: ClimateReading[] = []
  const today = new Date()

  // Andhra Pradesh — AQI worsening 85→140
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const ts = d.toISOString()
    const progress = (29 - i) / 29
    const aqi = Math.round(85 + (140 - 85) * progress + (Math.random() * 10 - 5))

    readings.push({
      regionId: "IN-AP",
      sk: `${ts}#AQI`,
      timestamp: ts,
      data_type: "AQI",
      value: aqi,
      unit: "AQI",
      source: "OPENAQ",
      orgId: "org_demo_001",
      lat: 15.9, lng: 79.7,
    })
  }

  // Amazon — NDVI declining 0.70→0.51, plus 3 fire events
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const ts = d.toISOString()
    const progress = (29 - i) / 29
    const ndvi = Math.round((0.70 - (0.19 * progress) + (Math.random() * 0.02 - 0.01)) * 100) / 100

    readings.push({
      regionId: "BR-AM",
      sk: `${ts}#NDVI`,
      timestamp: ts,
      data_type: "NDVI",
      value: ndvi,
      unit: "index",
      source: "COPERNICUS",
      orgId: "org_demo_001",
      lat: -3.4, lng: -65.1,
    })

    // Add 3 fire events at days 10, 18, 25
    if (i === 19 || i === 11 || i === 4) {
      readings.push({
        regionId: "BR-AM",
        sk: `${ts}#FIRE`,
        timestamp: ts,
        data_type: "FIRE",
        value: 320 + Math.round(Math.random() * 80),
        unit: "K",
        source: "NASA",
        orgId: "org_demo_001",
        lat: -3.4 + (Math.random() * 2 - 1),
        lng: -65.1 + (Math.random() * 2 - 1),
        confidence: "high",
      })
    }
  }

  // Write in batches of 25 (DynamoDB limit per batch)
  for (let i = 0; i < readings.length; i += 25) {
    const batch = readings.slice(i, i + 25)
    await Promise.all(
      batch.map((r) =>
        db.send(new PutCommand({ TableName: TABLES.CLIMATE_READINGS, Item: r }))
      )
    )
  }
  console.log(`✅ Seeded ${readings.length} climate readings`)
}

// ── RUN ───────────────────────────────────────────────────
async function main() {
  console.log("🚀 Starting EcoWatch seed script...\n")
  await createTables()
  console.log("")
  await seedOrganizations()
  console.log("")
  await seedClimateReadings()
  console.log("\n✅ All done! Your DynamoDB tables are ready.")
  console.log("📸 Take a screenshot of the AWS DynamoDB console for submission.")
}

main().catch((err) => {
  console.error("❌ Seed failed:", err)
  process.exit(1)
})
