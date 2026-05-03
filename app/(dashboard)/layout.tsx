import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { Nav } from "@/components/nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  let user: { id: string; email?: string } | null = null
  if (process.env.NODE_ENV !== "development") {
    const { data } = await supabase.auth.getUser()
    if (!data.user) redirect("/login")
    user = { id: data.user.id, email: data.user.email }
  }

  const profile = user
    ? (
        await supabase
          .from("users")
          .select("role, org_name")
          .eq("id", user.id)
          .maybeSingle()
      ).data
    : null

  const orgLabel = profile?.org_name
    ? `${profile.org_name} · ${profile.role}`
    : profile?.role ?? user?.email ?? "dev mode"

  return (
    <div className="flex flex-1 flex-col">
      <Nav orgLabel={orgLabel} />
      <main className="flex-1 px-8 py-8 max-w-[1600px] w-full mx-auto">
        {children}
      </main>
    </div>
  )
}
