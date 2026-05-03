import Link from "next/link"

import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { PIPELINE_COLOR, ROLE_COLOR, PALETTE } from "@/lib/colors"
import type { Role, PipelineStatus } from "@/lib/constants"

export default async function PlayersPage() {
  const supabase = await createClient()
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .order("created_at", { ascending: false })

  const list = players ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[2rem] font-bold tracking-tight leading-tight">
            Players
          </h1>
          <p className="text-sm text-secondary-fg mt-1">
            <span className="hud-num text-base">{list.length}</span> tracked
          </p>
        </div>
        <Link
          href="/players/new"
          className="text-xs uppercase tracking-[0.2em] text-primary hover:text-white px-4 py-2 border border-primary/40 hover:bg-primary transition-colors rounded-md"
        >
          + New player
        </Link>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center text-base text-secondary-fg">
            No players yet.{" "}
            <Link href="/players/new" className="text-primary hover:underline">
              Add your first.
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {list.map((p) => {
            const roleColor = ROLE_COLOR[p.role as Role]
            const pipelineColor = PIPELINE_COLOR[p.pipeline_status as PipelineStatus]
            return (
              <Link key={p.id} href={`/players/${p.id}`} className="group">
                <Card
                  accentColor={roleColor}
                  accentEdge="left"
                  className="h-full hover:bg-accent/40 hover:border-primary/40 transition-colors"
                >
                  <CardContent className="py-5 px-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-xl font-bold leading-tight tracking-tight group-hover:text-primary transition-colors">
                          {p.name}
                        </h2>
                        <div className="text-sm text-secondary-fg mt-0.5">
                          {p.current_team ?? "Free agent"}
                        </div>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.15em]"
                        style={{
                          background: `${pipelineColor}22`,
                          color: pipelineColor,
                        }}
                      >
                        {p.pipeline_status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.15em]"
                        style={{ background: `${roleColor}22`, color: roleColor }}
                      >
                        {p.role}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.15em] bg-accent text-secondary-fg">
                        {p.sub_region}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-[0.15em]"
                        style={{
                          background:
                            p.contract_status === "Free Agent"
                              ? `${PALETTE.green}22`
                              : p.contract_status === "Expiring"
                                ? `${PALETTE.gold}22`
                                : "rgba(168,178,193,0.12)",
                          color:
                            p.contract_status === "Free Agent"
                              ? PALETTE.green
                              : p.contract_status === "Expiring"
                                ? PALETTE.gold
                                : PALETTE.textSecondary,
                        }}
                      >
                        {p.contract_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-border/40">
                      <Stat label="ACS" v={p.acs?.toFixed(0)} />
                      <Stat label="KAST" v={p.kast?.toFixed(0)} />
                      <Stat label="KDA" v={p.kda?.toFixed(2)} />
                      <Stat label="FB%" v={p.first_blood_pct?.toFixed(0)} />
                      <Stat label="CL%" v={p.clutch_pct?.toFixed(0)} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, v }: { label: string; v: string | undefined | null }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-secondary-fg">
        {label}
      </div>
      <div className="hud-num text-[1.5rem] font-bold leading-tight mt-0.5">
        {v ?? "—"}
      </div>
    </div>
  )
}
