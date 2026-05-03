import { NextRequest, NextResponse } from "next/server"

interface RosterPlayer {
  name: string
  role: string
  subRegion: string
  agents: string[]
  stats: {
    acs: number
    kast: number
    kda: number
    firstBloodPct: number
    clutchPct: number
  }
}

interface RosterRequest {
  players: RosterPlayer[]
  systemStyle?: string
}

interface RosterAnalysis {
  synergies: string[]
  gaps: string[]
  riskAssessment: string
  overallRating: number
}

const OLLAMA_API = process.env.OLLAMA_API_URL || "http://localhost:11434"
const FETCH_TIMEOUT = 30000

async function callOllama(prompt: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  try {
    const res = await fetch(`${OLLAMA_API}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1:8b",
        prompt,
        stream: false,
        format: "json",
        options: { temperature: 0.6, top_p: 0.9 },
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) throw new Error(`Ollama API error: ${res.statusText}`)
    const data = await res.json()
    return data.response as string
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Ollama request timeout (>30s)")
    }
    throw err
  }
}

function buildPrompt(req: RosterRequest): string {
  const roster = req.players
    .map(
      (p, i) =>
        `Slot ${i + 1}: ${p.name} (${p.role}, ${p.subRegion})
  - Agents: ${p.agents.join(", ") || "—"}
  - ACS ${p.stats.acs}, KAST ${p.stats.kast}%, KDA ${p.stats.kda}, FB% ${p.stats.firstBloodPct}, Clutch% ${p.stats.clutchPct}`
    )
    .join("\n")

  return `You are a VCT 2027 head coach evaluating a 5-player roster build.

ROSTER:
${roster}

${req.systemStyle ? `SYSTEM STYLE:\n${req.systemStyle}\n` : ""}
VCT 2027 CONTEXT:
- Required role coverage: IGL, Duelist, Sentinel, Controller, Flex
- Cross-region rosters face visa/comms friction
- Open Qualifier path means deep maps + map pool flex matters
- Agent overlap is acceptable; map-pool overlap is not

Respond ONLY with valid JSON in this shape:
{
  "synergies": ["..."],
  "gaps": ["..."],
  "riskAssessment": "1-3 sentences on overall risk profile",
  "overallRating": 7
}

overallRating is 1-10. Be specific — reference player names and roles.`
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RosterRequest
    if (!Array.isArray(body.players) || body.players.length === 0) {
      return NextResponse.json({ error: "Provide at least one player" }, { status: 400 })
    }

    const raw = await callOllama(buildPrompt(body))
    let analysis: RosterAnalysis
    try {
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) throw new Error("No JSON in model response")
      analysis = JSON.parse(match[0])
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response. Try again." },
        { status: 500 }
      )
    }

    if (
      !Array.isArray(analysis.synergies) ||
      !Array.isArray(analysis.gaps) ||
      typeof analysis.overallRating !== "number"
    ) {
      return NextResponse.json({ error: "Invalid analysis structure" }, { status: 500 })
    }

    return NextResponse.json(analysis)
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("timeout")) {
        return NextResponse.json({ error: "AI service timeout" }, { status: 504 })
      }
      if (err.message.includes("ECONNREFUSED")) {
        return NextResponse.json(
          { error: "AI service unavailable. Ensure Ollama is running." },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
