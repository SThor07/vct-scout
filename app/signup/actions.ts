"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { COACH_ROLES, type CoachRole } from "@/lib/constants"

export async function signup(_prev: { error?: string } | null, formData: FormData) {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const role = String(formData.get("role") ?? "") as CoachRole
  const orgName = String(formData.get("org_name") ?? "")

  if (!email || !password) {
    return { error: "Email and password are required." }
  }
  if (!COACH_ROLES.includes(role)) {
    return { error: "Pick a valid role." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, org_name: orgName },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create profile row. If email confirmation is on, the user may be null until verified.
  if (data.user) {
    const { error: profileErr } = await supabase
      .from("users")
      .insert({ id: data.user.id, role, org_name: orgName || null })
    if (profileErr && profileErr.code !== "23505") {
      return { error: profileErr.message }
    }
  }

  revalidatePath("/", "layout")
  redirect("/")
}
