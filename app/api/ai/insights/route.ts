import { NextRequest, NextResponse } from "next/server"
import { getReadingsByRegion, saveAIReport } from "@/lib/db-operations"
import { aggregateReadings } from "@/lib/data-transformer"
import type { AIReport, RiskLevel } from "@/lib/db-schema"

interface InsightsRequest {
  regionId: string
  orgId: string
  timeframe: "7d" | "30d"
}

interface ClaudeInsightsResponse {
  summary: string
  riskScore: number
  riskLevel: RiskLevel
  keyFindings: string[]
  recommendations: string[]
  esgImpact: string
  forecast: string
}

// ── Helpers ───────────────────────────────────────────────────────────────
function getDateRange(timeframe: "7d" | "30d") {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - (timeframe === "7d" ? 7 : 30))
  return { start: start.toISOString(), end: end.toISOString() }
}

function trendLabel(trend: string) {
  return trend === "degrading"
    ? "worsening compared to prior period"
    : trend === "improving"
    ? "improving compared to prior period"
    : "stable compared to prior period"
}

// ── Main handler ──────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: InsightsRequest = await req.json()
    const { regionId, orgId, timeframe = "30d" } = body

    if (!regionId || !orgId) {
      return NextResponse.json(
        { error: "regionId and orgId are required" },
        { status: 400 }
      )
    }

    // 1. Pull readings from DynamoDB
    const { start, end } = getDateRange(timeframe)
    const readings = await getReadingsByRegion(regionId, start, end)

    if (readings.length === 0) {
      return NextResponse.json(
        { error: "No data found for this region. Run /api/ingest first." },
        { status: 404 }
      )
    }

    // 2. Aggregate into summary numbers for the prompt
    const agg = aggregateReadings(readings)

    // 3. Call Claude API
    const systemPrompt = `You are a senior environmental intelligence analyst for B2B enterprise clients.
You analyze satellite and sensor data and deliver concise, actionable insights.
Your clients include ESG compliance teams, NGOs, and government bodies.
Always respond with ONLY valid JSON — no markdown, no preamble, no explanation outside the JSON.`

    const userPrompt = `Analyze environmental data for region "${regionId}" over the past ${timeframe}.

Data summary:
- Average AQI: ${agg.avgAQI} (${readings.filter(r => r.data_type === "AQI").length} readings) — ${trendLabel(agg.aqiTrend)}
- Average NDVI (vegetation index): ${agg.avgNDVI}
- Fire detections: ${agg.fireCount} events
- Average CO₂ / temperature: ${agg.avgCO2}
- Total sensor readings: ${agg.totalReadings}

Respond ONLY with this exact JSON structure:
{
  "summary": "2-3 sentence executive summary suitable for a board-level ESG report",
  "riskScore": <integer 0-100, higher = more environmental risk>,
  "riskLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "keyFindings": ["<finding 1>", "<finding 2>", "<finding 3>"],
  "recommendations": ["<action 1>", "<action 2>", "<action 3>"],
  "esgImpact": "<one sentence on how this affects ESG/GRI reporting obligations>",
  "forecast": "<one sentence 30-day outlook based on trends>"
}`

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    })

    if (!claudeRes.ok) {
      const err = await claudeRes.text()
      console.error("Claude API error:", err)
      return NextResponse.json(
        { error: "AI analysis failed", detail: err },
        { status: 502 }
      )
    }

    const claudeData = await claudeRes.json()
    const rawText: string = claudeData.content?.[0]?.text ?? ""

    // 4. Parse JSON — strip any accidental markdown fences
    let insights: ClaudeInsightsResponse
    try {
      const clean = rawText.replace(/```json|```/g, "").trim()
      insights = JSON.parse(clean)
    } catch {
      console.error("Failed to parse Claude response:", rawText)
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: rawText },
        { status: 500 }
      )
    }

    // 5. Save to DynamoDB ai_reports table
    const today = new Date().toISOString().slice(0, 10)
    const report: AIReport = {
      orgId,
      sk: `${today}#${regionId}`,
      reportDate: today,
      regionId,
      summary: insights.summary,
      riskScore: insights.riskScore,
      riskLevel: insights.riskLevel,
      keyFindings: insights.keyFindings,
      recommendations: insights.recommendations,
      esgImpact: insights.esgImpact,
      forecast: insights.forecast,
      environmentalMetrics: {
        averageAQI: agg.avgAQI,
        aqiTrend: agg.aqiTrend as "improving" | "stable" | "degrading",
        vegetationCoverChange: agg.avgNDVI,
        co2Concentration: agg.avgCO2,
        fireIncidents: agg.fireCount,
      },
      generatedAt: new Date().toISOString(),
    }

    await saveAIReport(report)

    return NextResponse.json({
      success: true,
      report,
      readingsAnalyzed: readings.length,
    })
  } catch (err) {
    console.error("Insights route error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
