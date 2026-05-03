"use client"

import Link from "next/link"
import { useActionState } from "react"

import { signup } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { COACH_ROLES } from "@/lib/constants"

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, null)

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="size-2 rounded-sm bg-primary" /> VCT SCOUT
          </CardTitle>
          <CardDescription>Set up a coach / scout account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="role">Role</Label>
              <Select id="role" name="role" required defaultValue="">
                <option value="" disabled>Select role</option>
                {COACH_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="org_name">Org / Team name <span className="opacity-50">(optional)</span></Label>
              <Input id="org_name" name="org_name" type="text" />
            </div>
            {state?.error && (
              <p className="text-xs text-destructive">{state.error}</p>
            )}
            <Button type="submit" disabled={pending} className="mt-1">
              {pending ? "Creating…" : "Create account"}
            </Button>
            <p className="text-xs text-muted-foreground text-center pt-2">
              Already registered?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
