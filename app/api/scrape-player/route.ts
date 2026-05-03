import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

interface VLRPlayerStats {
  acs: number | null
  kast: number | null
  kda: number | null
  firstBloodPct: number | null
}

async function scrapeVLRStats(playerName: string): Promise<VLRPlayerStats> {
  try {
    const searchUrl = `https://vlr.gg/stats?name=${encodeURIComponent(playerName)}`
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`VLR.gg returned status ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Parse stats from VLR.gg table
    // Note: VLR.gg structure may vary, this is a basic example
    const stats: VLRPlayerStats = {
      acs: null,
      kast: null,
      kda: null,
      firstBloodPct: null,
    }

    // Try to extract ACS
    const acsText = $('.stat-val')
      .filter((_i, el) => $(el).text().includes('ACS'))
      .next()
      .text()
      .trim()
    stats.acs = acsText ? parseFloat(acsText) : null

    // Try to extract KAST
    const kastText = $('.stat-val')
      .filter((_i, el) => $(el).text().includes('KAST'))
      .next()
      .text()
      .trim()
      .replace('%', '')
    stats.kast = kastText ? parseFloat(kastText) : null

    // Try to extract KDA
    const kdaText = $('.stat-val')
      .filter((_i, el) => $(el).text().includes('K/D/A'))
      .next()
      .text()
      .trim()
    if (kdaText) {
      const [k, d, a] = kdaText.split('/').map(Number)
      stats.kda = d > 0 ? (k + a) / d : k + a
    }

    return stats
  } catch (error) {
    console.error('VLR scrape error:', error)
    return {
      acs: null,
      kast: null,
      kda: null,
      firstBloodPct: null,
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { playerName } = (await request.json()) as { playerName: string }

    if (!playerName || playerName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      )
    }

    const stats = await scrapeVLRStats(playerName)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Scrape API error:', error)
    return NextResponse.json(
      { error: 'Failed to scrape player stats' },
      { status: 500 }
    )
  }
}
