import Link from "next/link"

import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PIPELINE_STATUSES } from "@/lib/constants"
import { PALETTE, PIPELINE_COLOR, ROLE_COLOR } from "@/lib/colors"
import type { Role } from "@/lib/constants"

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: players } = await supabase
    .from("players")
    .select("id, name, role, sub_region, pipeline_status, contract_status, acs")
    .order("created_at", { ascending: false })

  const all = players ?? []
  const counts: Record<string, number> = Object.fromEntries(
    PIPELINE_STATUSES.map((s) => [s, 0])
  )
  for (const p of all) counts[p.pipeline_status] = (counts[p.pipeline_status] ?? 0) + 1

  const freeAgents = all.filter((p) => p.contract_status === "Free Agent")
  const recent = all.slice(0, 6)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[2rem] font-bold tracking-tight leading-tight">
            Scouting Overview
          </h1>
          <p className="text-sm text-secondary-fg mt-1 tracking-wide">
            VCT 2027 talent pipeline ·{" "}
            <span className="hud-num text-base">{all.length}</span> tracked players
          </p>
        </div>
        <Link
          href="/players/new"
          className="text-xs uppercase tracking-[0.2em] text-primary hover:text-white px-4 py-2 border border-primary/40 hover:bg-primary transition-colors rounded-md"
        >
          + New player
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {PIPELINE_STATUSES.map((s) => {
          const color = PIPELINE_COLOR[s]
          return (
            <Card key={s} accentColor={color} accentEdge="left" className="hover:bg-accent/40 transition-colors">
              <CardContent className="py-5">
                <div
                  className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color }}
                >
                  {s}
                </div>
                <div
                  className="text-[3rem] font-bold leading-none mt-2 font-mono"
                  style={{ color }}
                >
                  {counts[s] ?? 0}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card accentColor={PALETTE.cyan} accentEdge="top">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="size-1.5 rounded-full" style={{ background: PALETTE.cyan }} />
              Recent additions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <p className="px-5 py-8 text-sm text-secondary-fg">
                No players yet — add your first scouting target.
              </p>
            ) : (
              <ul className="divide-y divide-border/40">
                {recent.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors">
                    <Link
                      href={`/players/${p.id}`}
                      className="flex-1 text-base font-semibold hover:text-primary"
                    >
                      {p.name}
                    </Link>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                      style={{ color: ROLE_COLOR[p.role as Role] }}
                    >
                      {p.role}
                    </span>
                    <Badge variant="outline">{p.sub_region}</Badge>
                    <span className="hud-num text-base w-12 text-right">
                      {p.acs ? p.acs.toFixed(0) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card accentColor={PALETTE.green} accentEdge="top">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="size-1.5 rounded-full" style={{ background: PALETTE.green }} />
              Free agents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {freeAgents.length === 0 ? (
              <p className="px-5 py-8 text-sm text-secondary-fg">
                No free agents currently tracked.
              </p>
            ) : (
              <ul className="divide-y divide-border/40">
                {freeAgents.slice(0, 8).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors">
                    <Link
                      href={`/players/${p.id}`}
                      className="flex-1 text-base font-semibold hover:text-primary"
                    >
                      {p.name}
                    </Link>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.15em] px-2 py-0.5 rounded-md"
                      style={{
                        background: `${PIPELINE_COLOR[p.pipeline_status as keyof typeof PIPELINE_COLOR]}22`,
                        color: PIPELINE_COLOR[p.pipeline_status as keyof typeof PIPELINE_COLOR],
                      }}
                    >
                      {p.pipeline_status}
                    </span>
                    <Badge variant="outline">{p.sub_region}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
