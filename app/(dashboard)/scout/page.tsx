import { createClient } from "@/lib/supabase/server"
import { ScoutPanel } from "@/components/scout-panel"
import type { Player } from "@/lib/types"

export default async function ScoutPage({
  searchParams,
}: {
  searchParams: Promise<{ playerId?: string }>
}) {
  const { playerId } = await searchParams
  const supabase = await createClient()
  const { data } = await supabase
    .from("players")
    .select("*")
    .order("created_at", { ascending: false })
  const players = (data ?? []) as Player[]
  const initial = players.find((p) => p.id === playerId) ?? players[0] ?? null

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Scout</h1>
        <p className="text-sm text-muted-foreground">
          Local llama3.1:8b via Ollama. Reports are generated against your coach system style.
        </p>
      </div>
      <ScoutPanel players={players} initialPlayerId={initial?.id ?? null} />
    </div>
  )
}
