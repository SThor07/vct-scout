import { notFound } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { PlayerForm } from "@/components/player-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { deletePlayer, updatePlayer } from "../actions"
import type { Player } from "@/lib/types"
import Link from "next/link"
import { PALETTE, PIPELINE_COLOR, ROLE_COLOR } from "@/lib/colors"

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("id", id)
    .maybeSingle<Player>()

  if (!data) notFound()

  const updateAction = updatePlayer.bind(null, data.id)
  const deleteAction = deletePlayer.bind(null, data.id)

  const roleColor = ROLE_COLOR[data.role]
  const pipelineColor = PIPELINE_COLOR[data.pipeline_status]

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[2rem] font-bold tracking-tight leading-tight">
            {data.name}
          </h1>
          <p className="text-sm text-secondary-fg mt-1">
            <span style={{ color: roleColor }} className="font-bold uppercase tracking-[0.15em]">
              {data.role}
            </span>{" "}
            · {data.sub_region} · {data.current_team ?? "Free agent"}
          </p>
        </div>
        <Link
          href={`/scout?playerId=${data.id}`}
          className="text-xs uppercase tracking-[0.2em] text-primary hover:text-white px-4 py-2 border border-primary/40 hover:bg-primary transition-colors rounded-md"
        >
          Run AI scout →
        </Link>
      </div>

      <Card accentColor={roleColor} accentEdge="left">
        <CardContent className="flex flex-wrap gap-2 py-4">
          <Pill color={pipelineColor}>{data.pipeline_status}</Pill>
          <Pill
            color={
              data.contract_status === "Free Agent"
                ? PALETTE.green
                : data.contract_status === "Expiring"
                  ? PALETTE.gold
                  : PALETTE.textSecondary
            }
          >
            {data.contract_status}
          </Pill>
          {data.open_qualifier_eligible && <Pill color={PALETTE.gold}>OQ Eligible</Pill>}
          {data.championship_points && <Pill color={PALETTE.gold}>Championship Pts</Pill>}
        </CardContent>
      </Card>

      <PlayerForm initial={data} action={updateAction} submitLabel="Save changes" />

      <form action={deleteAction} className="flex justify-end">
        <Button type="submit" variant="destructive" size="sm">
          Delete player
        </Button>
      </form>
    </div>
  )
}

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-[0.15em]"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
    >
      {children}
    </span>
  )
}
