"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import type { RosterAnalysis } from "@/lib/types"

const DEV_FALLBACK_USER_ID = "00000000-0000-0000-0000-000000000000"

export async function saveRoster(payload: {
  name: string
  player_ids: string[]
  ai_analysis: RosterAnalysis | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id ?? DEV_FALLBACK_USER_ID

  const { error } = await supabase.from("roster_builds").insert({
    user_id: userId,
    name: payload.name || "Untitled Roster",
    player_ids: payload.player_ids,
    ai_analysis: payload.ai_analysis,
  })
  if (error) throw new Error(error.message)
  revalidatePath("/roster")
}
