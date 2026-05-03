"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { fitScoreColor, PALETTE, verdictColor } from "@/lib/colors"
import type { Player, ScoutReport } from "@/lib/types"

const DEFAULT_SYSTEM = `Aggressive, default-heavy NA system. Lean on duelist tempo + sentinel double-anchor. We need IGLs that can mid-round adapt; we tolerate fragger weaknesses on Controllers but not Duelists.`

export function ScoutPanel({
  players,
  initialPlayerId,
}: {
  players: Player[]
  initialPlayerId: string | null
}) {
  const [playerId, setPlayerId] = useState<string | null>(initialPlayerId)
  const [coachSystem, setCoachSystem] = useState(DEFAULT_SYSTEM)
  const [report, setReport] = useState<ScoutReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const player = useMemo(
    () => players.find((p) => p.id === playerId) ?? null,
    [players, playerId]
  )

  async function run() {
    if (!player) return
    setLoading(true)
    setError(null)
    setReport(null)
    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerData: {
            name: player.name,
            currentTeam: player.current_team ?? "Free Agent",
            subRegion: player.sub_region,
            role: player.role,
            agents: player.agents,
            contractStatus: player.contract_status,
            notes: player.notes ?? "",
            stats: {
              acs: player.acs ?? 0,
              kast: player.kast ?? 0,
              kda: player.kda ?? 0,
              firstBloodPct: player.first_blood_pct ?? 0,
              clutchPct: player.clutch_pct ?? 0,
            },
          },
          coachSystemStyle: coachSystem,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Scout request failed")
      setReport(data as ScoutReport)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scout request failed")
    } finally {
      setLoading(false)
    }
  }

  const fitColor = report ? fitScoreColor(report.fitScore) : PALETTE.textSecondary
  const vColor = report ? verdictColor(report.roleVerdict) : PALETTE.textSecondary

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card accentColor={PALETTE.cyan} accentEdge="top">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="size-1.5 rounded-full" style={{ background: PALETTE.cyan }} />
            Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="player">Player</Label>
            <Select
              id="player"
              value={playerId ?? ""}
              onChange={(e) => setPlayerId(e.target.value || null)}
            >
              <option value="" disabled>Select a player</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.role} · {p.sub_region}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="system">Coach system style</Label>
            <Textarea
              id="system"
              rows={6}
              value={coachSystem}
              onChange={(e) => setCoachSystem(e.target.value)}
            />
          </div>
          {player && (
            <div className="grid grid-cols-5 gap-2">
              <Stat label="ACS" v={player.acs?.toFixed(0)} />
              <Stat label="KAST" v={player.kast?.toFixed(0)} />
              <Stat label="KDA" v={player.kda?.toFixed(2)} />
              <Stat label="FB%" v={player.first_blood_pct?.toFixed(0)} />
              <Stat label="CL%" v={player.clutch_pct?.toFixed(0)} />
            </div>
          )}
          <div className="flex justify-end">
            <Button
              type="button"
              disabled={!player || loading}
              onClick={run}
              className="px-6"
            >
              {loading ? "Generating…" : "Run AI scout"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card accentColor={fitColor} accentEdge="top">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="size-1.5 rounded-full" style={{ background: fitColor }} />
            Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!report ? (
            <div className="text-base text-secondary-fg py-12 text-center">
              {loading
                ? "Querying llama3.1:8b (10–30s)…"
                : "Run the scout to see results here."}
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="flex items-center gap-6 py-4">
                <div
                  className="font-mono font-bold leading-none"
                  style={{ color: fitColor, fontSize: "5rem", textShadow: `0 0 24px ${fitColor}66` }}
                >
                  {report.fitScore}
                  <span className="text-secondary-fg text-3xl font-normal">/10</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-secondary-fg">
                    Role verdict
                  </div>
                  <div
                    className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-[0.12em] inline-flex w-fit"
                    style={{
                      background: `${vColor}22`,
                      color: vColor,
                      border: `1px solid ${vColor}66`,
                    }}
                  >
                    {report.roleVerdict}
                  </div>
                </div>
              </div>
              <Section label="Recommendation" body={report.recommendation} />
              <List
                label="Strengths"
                items={report.strengths}
                color={PALETTE.green}
                glyph="▲"
              />
              <List
                label="Weaknesses"
                items={report.weaknesses}
                color={PALETTE.gold}
                glyph="●"
              />
              <List
                label="Red flags"
                items={report.redFlags}
                color={PALETTE.scarlet}
                glyph="✕"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, v }: { label: string; v: string | undefined }) {
  return (
    <div className="rounded-md bg-accent/40 px-2 py-3 text-center">
      <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-secondary-fg">
        {label}
      </div>
      <div className="hud-num text-[1.5rem] font-bold leading-tight mt-1">
        {v ?? "—"}
      </div>
    </div>
  )
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-secondary-fg mb-2">
        {label}
      </div>
      <p className="text-base leading-relaxed">{body}</p>
    </div>
  )
}

function List({
  label,
  items,
  color,
  glyph,
}: {
  label: string
  items: string[]
  color: string
  glyph: string
}) {
  if (!items?.length) return null
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-secondary-fg mb-2">
        {label}
      </div>
      <ul className="grid gap-3">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="font-mono font-bold mt-0.5 select-none"
              style={{ color, textShadow: `0 0 6px ${color}88` }}
            >
              {glyph}
            </span>
            <span className="text-base leading-relaxed">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
