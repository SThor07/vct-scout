import { NextRequest, NextResponse } from 'next/server'

interface ScoutRequest {
  playerData: {
    name: string
    currentTeam?: string
    subRegion: string
    role: string
    agents: string[]
    contractStatus?: string
    notes?: string
    stats: {
      acs: number
      kast: number
      kda: number
      firstBloodPct: number
      clutchPct: number
    }
  }
  coachSystemStyle: string
}

const ROLE_VERDICTS = ['perfect fit', 'workable', 'off-role risk', 'do not pursue'] as const
type RoleVerdict = (typeof ROLE_VERDICTS)[number]

interface ScoutReport {
  strengths: string[]
  weaknesses: string[]
  fitScore: number
  redFlags: string[]
  recommendation: string
  roleVerdict: RoleVerdict
}

const SYSTEM_PROMPT = `You are a professional VCT esports scout with deep knowledge of the 2027 VALORANT Champions Tour format. You analyze players for competitive fit, tactical role suitability, and potential in the new open qualifier system. Always respond in valid JSON only, no markdown, no preamble.`

const OLLAMA_API = process.env.OLLAMA_API_URL || 'http://localhost:11434'
const FETCH_TIMEOUT = 30000 // 30 seconds

async function callOllama(prompt: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

  try {
    const response = await fetch(`${OLLAMA_API}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.1:8b',
        system: SYSTEM_PROMPT,
        prompt,
        stream: false,
        format: 'json',
        options: { temperature: 0.7, top_p: 0.9 },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.response
  } catch (error) {
    clearTimeout(timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Ollama request timeout (>30s)')
    }
    throw error
  }
}

function buildScoutPrompt(playerData: ScoutRequest['playerData'], coachSystemStyle: string): string {
  const { name, role, subRegion, agents, contractStatus, notes, stats } = playerData
  return `Analyze this player for scouting purposes:
Name: ${name}
Role: ${role}
Region: ${subRegion}
ACS: ${stats.acs} | KAST: ${stats.kast} | KDA: ${stats.kda} | First Blood %: ${stats.firstBloodPct} | Clutch %: ${stats.clutchPct}
Agent Pool: ${agents.join(', ')}
Contract Status: ${contractStatus ?? 'Unknown'}
Coach's system style: ${coachSystemStyle}
Additional notes: ${notes ?? 'None'}

Return JSON with exactly these keys:
{
  strengths: string[],
  weaknesses: string[],
  fitScore: number (1-10),
  redFlags: string[],
  recommendation: string,
  roleVerdict: 'perfect fit' | 'workable' | 'off-role risk' | 'do not pursue'
}`
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ScoutRequest

    // Validate input
    if (!body.playerData || !body.coachSystemStyle) {
      return NextResponse.json(
        { error: 'Missing required fields: playerData and coachSystemStyle' },
        { status: 400 }
      )
    }

    // Build prompt
    const prompt = buildScoutPrompt(body.playerData, body.coachSystemStyle)

    // Call Ollama
    const response = await callOllama(prompt)

    // Parse JSON response
    let report: ScoutReport
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      report = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Failed to parse Ollama response:', response, parseError)
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      )
    }

    // Validate report structure
    if (
      !Array.isArray(report.strengths) ||
      !Array.isArray(report.weaknesses) ||
      !Array.isArray(report.redFlags) ||
      typeof report.fitScore !== 'number' ||
      typeof report.recommendation !== 'string' ||
      !ROLE_VERDICTS.includes(report.roleVerdict)
    ) {
      return NextResponse.json(
        { error: 'Invalid report structure from AI' },
        { status: 500 }
      )
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Scout API error:', error)

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'AI service timeout. Please try again.' },
          { status: 504 }
        )
      }
      if (error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'AI service unavailable. Ensure Ollama is running at http://localhost:11434' },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
