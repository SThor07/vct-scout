"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import {
  AGENTS,
  CONTRACT_STATUSES,
  PIPELINE_STATUSES,
  ROLES,
  SUB_REGIONS,
} from "@/lib/constants"

const DEV_FALLBACK_USER_ID = "00000000-0000-0000-0000-000000000000"

function num(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function parsePlayerForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const sub_region = String(formData.get("sub_region") ?? "")
  const role = String(formData.get("role") ?? "")
  const contract_status = String(formData.get("contract_status") ?? "Free Agent")
  const pipeline_status = String(formData.get("pipeline_status") ?? "Watching")

  if (!name) throw new Error("Player name is required")
  if (!SUB_REGIONS.includes(sub_region as never)) throw new Error("Invalid region")
  if (!ROLES.includes(role as never)) throw new Error("Invalid role")
  if (!CONTRACT_STATUSES.includes(contract_status as never)) throw new Error("Invalid contract")
  if (!PIPELINE_STATUSES.includes(pipeline_status as never)) throw new Error("Invalid pipeline status")

  const agentsRaw = formData.getAll("agents").map(String)
  const agents = agentsRaw.filter((a) => AGENTS.includes(a as never))

  return {
    name,
    current_team: String(formData.get("current_team") ?? "").trim() || null,
    sub_region,
    role,
    agents,
    acs: num(formData.get("acs")),
    kast: num(formData.get("kast")),
    kda: num(formData.get("kda")),
    first_blood_pct: num(formData.get("first_blood_pct")),
    clutch_pct: num(formData.get("clutch_pct")),
    contract_status,
    open_qualifier_eligible: formData.get("open_qualifier_eligible") === "on",
    championship_points: formData.get("championship_points") === "on",
    notes: String(formData.get("notes") ?? "").trim() || null,
    pipeline_status,
  }
}

export async function createPlayer(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id ?? DEV_FALLBACK_USER_ID

  const payload = parsePlayerForm(formData)
  const { data, error } = await supabase
    .from("players")
    .insert({ ...payload, user_id: userId })
    .select("id")
    .single()

  if (error) throw new Error(error.message)
  revalidatePath("/players")
  revalidatePath("/pipeline")
  revalidatePath("/")
  redirect(`/players/${data.id}`)
}

export async function updatePlayer(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id ?? DEV_FALLBACK_USER_ID

  const payload = parsePlayerForm(formData)
  const { error } = await supabase
    .from("players")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw new Error(error.message)
  revalidatePath("/players")
  revalidatePath(`/players/${id}`)
  revalidatePath("/pipeline")
  revalidatePath("/")
}

export async function deletePlayer(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id ?? DEV_FALLBACK_USER_ID

  const { error } = await supabase
    .from("players")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw new Error(error.message)
  revalidatePath("/players")
  revalidatePath("/pipeline")
  revalidatePath("/")
  redirect("/players")
}

export async function updatePipelineStatus(id: string, status: string) {
  if (!PIPELINE_STATUSES.includes(status as never)) {
    throw new Error("Invalid pipeline status")
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const userId = user?.id ?? DEV_FALLBACK_USER_ID

  const { error } = await supabase
    .from("players")
    .update({ pipeline_status: status })
    .eq("id", id)
    .eq("user_id", userId)

  if (error) throw new Error(error.message)
  revalidatePath("/pipeline")
  revalidatePath("/players")
}
