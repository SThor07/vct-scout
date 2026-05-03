import { createClient } from "@/lib/supabase/server"
import { RosterBuilder } from "@/components/roster-builder"
import type { Player, RosterBuild } from "@/lib/types"

export default async function RosterPage() {
  const supabase = await createClient()
  const [{ data: players }, { data: builds }] = await Promise.all([
    supabase.from("players").select("*").order("created_at", { ascending: false }),
    supabase
      .from("roster_builds")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Roster Builder</h1>
        <p className="text-sm text-muted-foreground">
          Slot 5 players into the IGL / Duelist / Sentinel / Controller / Flex frame, then have the AI assess composition.
        </p>
      </div>
      <RosterBuilder
        players={(players ?? []) as Player[]}
        recentBuilds={(builds ?? []) as RosterBuild[]}
      />
    </div>
  )
}
