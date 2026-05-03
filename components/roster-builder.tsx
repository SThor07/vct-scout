"use client"

import { useMemo, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Role } from "@/lib/constants"
import type { Player, RosterAnalysis, RosterBuild } from "@/lib/types"
import { saveRoster } from "@/app/(dashboard)/roster/actions"
import { PALETTE, ROLE_COLOR } from "@/lib/colors"

const SLOT_ROLES: Role[] = ["IGL", "Duelist", "Sentinel", "Controller", "Flex"]

export function RosterBuilder({
  players,
  recentBuilds,
}: {
  players: Player[]
  recentBuilds: RosterBuild[]
}) {
  const [slots, setSlots] = useState<Record<Role, string | null>>({
    IGL: null,
    Duelist: null,
    Sentinel: null,
    Controller: null,
    Flex: null,
  })
  const [name, setName] = useState("")
  const [systemStyle, setSystemStyle] = useState("")
  const [analysis, setAnalysis] = useState<RosterAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savePending, startSave] = useTransition()

  const playersById = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players]
  )

  const filled = SLOT_ROLES.filter((r) => slots[r])
  const filledPlayers = filled
    .map((r) => playersById.get(slots[r]!))
    .filter((p): p is Player => Boolean(p))

  function setSlot(role: Role, id: string | null) {
    setSlots((s) => ({ ...s, [role]: id }))
  }

  async function evaluate() {
    if (filledPlayers.length === 0) return
    setLoading(true)
    setError(null)
    setAnalysis(null)
    try {
      const res = await fetch("/api/roster-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemStyle,
          players: filledPlayers.map((p) => ({
            name: p.name,
            role: p.role,
            subRegion: p.sub_region,
            agents: p.agents,
            stats: {
              acs: p.acs ?? 0,
              kast: p.kast ?? 0,
              kda: p.kda ?? 0,
              firstBloodPct: p.first_blood_pct ?? 0,
              clutchPct: p.clutch_pct ?? 0,
            },
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Roster evaluation failed")
      setAnalysis(data as RosterAnalysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Roster evaluation failed")
    } finally {
      setLoading(false)
    }
  }

  function save() {
    startSave(async () => {
      try {
        await saveRoster({
          name,
          player_ids: filledPlayers.map((p) => p.id),
          ai_analysis: analysis,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed")
      }
    })
  }

  function optionsFor(role: Role) {
    const matched = players.filter((p) => p.role === role)
    const others = players.filter((p) => p.role !== role)
    return { matched, others }
  }

  const ratingColor =
    analysis == null
      ? PALETTE.textSecondary
      : analysis.overallRating >= 8
        ? PALETTE.green
        : analysis.overallRating >= 5
          ? PALETTE.gold
          : PALETTE.scarlet

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="flex flex-col gap-6">
        <Card accentColor={PALETTE.scarlet} accentEdge="top">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="size-1.5 rounded-full" style={{ background: PALETTE.scarlet }} />
              Lineup
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {SLOT_ROLES.map((role) => {
              const { matched, others } = optionsFor(role)
              const id = slots[role]
              const player = id ? playersById.get(id) : null
              const color = ROLE_COLOR[role]
              const empty = !player
              return (
                <div
                  key={role}
                  className="grid grid-cols-[110px_1fr] items-center gap-3 rounded-md p-2"
                  style={{
                    border: empty
                      ? `2px dashed ${color}55`
                      : `2px solid ${color}44`,
                    background: empty ? "transparent" : `${color}0A`,
                  }}
                >
                  <span
                    className="text-xs font-bold uppercase tracking-[0.18em] text-center"
                    style={{ color }}
                  >
                    {role}
                  </span>
                  <div className="flex items-center gap-2">
                    <Select
                      value={id ?? ""}
                      onChange={(e) => setSlot(role, e.target.value || null)}
                    >
                      <option value="">— empty —</option>
                      {matched.length > 0 && (
                        <optgroup label={`${role} fits`}>
                          {matched.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} · {p.sub_region}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {others.length > 0 && (
                        <optgroup label="Other players">
                          {others.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.role}) · {p.sub_region}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </Select>
                    {player && player.role !== role && (
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.15em]"
                        style={{ background: `${PALETTE.gold}22`, color: PALETTE.gold }}
                      >
                        off-role
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System & metadata</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rname">Build name</Label>
              <Input
                id="rname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. NA OQ Run – Build A"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rsys">System style (optional)</Label>
              <Textarea
                id="rsys"
                rows={4}
                value={systemStyle}
                onChange={(e) => setSystemStyle(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={savePending || filledPlayers.length === 0}
                onClick={save}
              >
                {savePending ? "Saving…" : "Save build"}
              </Button>
              <Button
                type="button"
                onClick={evaluate}
                disabled={loading || filledPlayers.length === 0}
                size="lg"
                className="px-6 text-sm uppercase tracking-[0.12em] font-bold shadow-[0_0_18px_rgba(255,70,85,0.35)]"
              >
                {loading ? "Analyzing…" : "Run AI analysis"}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card accentColor={ratingColor} accentEdge="top">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="size-1.5 rounded-full" style={{ background: ratingColor }} />
              Composition analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!analysis ? (
              <div className="text-base text-secondary-fg py-12 text-center">
                {loading
                  ? "Querying llama3.1:8b (10–30s)…"
                  : "Fill at least one slot and run AI analysis."}
              </div>
            ) : (
              <div className="grid gap-6">
                <div className="flex items-center gap-6 py-4">
                  <div
                    className="font-mono font-bold leading-none"
                    style={{
                      color: ratingColor,
                      fontSize: "5rem",
                      textShadow: `0 0 24px ${ratingColor}66`,
                    }}
                  >
                    {analysis.overallRating}
                    <span className="text-secondary-fg text-3xl font-normal">/10</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-secondary-fg">
                    Overall composition
                  </div>
                </div>
                <Section label="Risk assessment" body={analysis.riskAssessment} />
                <List
                  label="Synergies"
                  items={analysis.synergies}
                  color={PALETTE.green}
                  glyph="▲"
                />
                <List
                  label="Gaps"
                  items={analysis.gaps}
                  color={PALETTE.gold}
                  glyph="●"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {recentBuilds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent builds</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border/40">
                {recentBuilds.map((b) => (
                  <li
                    key={b.id}
                    className="px-5 py-3 flex items-center justify-between hover:bg-accent/30 transition-colors"
                  >
                    <span className="font-semibold">{b.name}</span>
                    <span className="text-xs text-secondary-fg">
                      {b.player_ids.length} players ·{" "}
                      {new Date(b.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
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
