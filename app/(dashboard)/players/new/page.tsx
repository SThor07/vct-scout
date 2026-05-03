import { PlayerForm } from "@/components/player-form"
import { createPlayer } from "../actions"

export default function NewPlayerPage() {
  return (
    <div className="flex flex-col gap-4 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New player</h1>
        <p className="text-sm text-muted-foreground">
          Add a player to your scouting list. Use VLR autofill to grab live stats.
        </p>
      </div>
      <PlayerForm action={createPlayer} submitLabel="Create player" />
    </div>
  )
}
