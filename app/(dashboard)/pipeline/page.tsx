import { createClient } from "@/lib/supabase/server"
import { PipelineBoard } from "@/components/pipeline-board"
import type { Player } from "@/lib/types"

export default async function PipelinePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("players")
    .select("*")
    .order("created_at", { ascending: false })

  const players = (data ?? []) as Player[]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Scouting Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          Drag players between stages. Persists immediately.
        </p>
      </div>
      <PipelineBoard players={players} />
    </div>
  )
}
