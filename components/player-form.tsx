"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  AGENTS,
  CONTRACT_STATUSES,
  PIPELINE_STATUSES,
  ROLES,
  SUB_REGIONS,
} from "@/lib/constants"
import type { Player } from "@/lib/types"

type Props = {
  initial?: Player
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

export function PlayerForm({ initial, action, submitLabel }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [scrapeStatus, setScrapeStatus] = useState<string | null>(null)

  const [agents, setAgents] = useState<string[]>(initial?.agents ?? [])
  const [acs, setAcs] = useState<string>(initial?.acs?.toString() ?? "")
  const [kast, setKast] = useState<string>(initial?.kast?.toString() ?? "")
  const [kda, setKda] = useState<string>(initial?.kda?.toString() ?? "")
  const [firstBlood, setFirstBlood] = useState<string>(
    initial?.first_blood_pct?.toString() ?? ""
  )

  const playerName = initial?.name ?? ""

  async function autofillFromVlr(name: string) {
    if (!name.trim()) return
    setScrapeStatus("Querying VLR.gg…")
    try {
      const res = await fetch("/api/scrape-player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Scrape failed")
      if (data.acs != null) setAcs(String(data.acs))
      if (data.kast != null) setKast(String(data.kast))
      if (data.kda != null) setKda(String(data.kda))
      if (data.firstBloodPct != null) setFirstBlood(String(data.firstBloodPct))
      const filled = ["acs", "kast", "kda", "firstBloodPct"].filter(
        (k) => data[k] != null
      )
      setScrapeStatus(
        filled.length > 0
          ? `Auto-filled ${filled.length} field${filled.length > 1 ? "s" : ""} from VLR.`
          : "VLR returned no usable stats — fill manually."
      )
    } catch (err) {
      setScrapeStatus(err instanceof Error ? err.message : "Scrape failed")
    }
  }

  function toggleAgent(a: string) {
    setAgents((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )
  }

  function onSubmit(formData: FormData) {
    // ensure agents are present
    formData.delete("agents")
    for (const a of agents) formData.append("agents", a)
    startTransition(async () => {
      await action(formData)
      router.refresh()
    })
  }

  return (
    <form action={onSubmit} className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="grid gap-1.5 md:col-span-2">
            <Label htmlFor="name">Player name (IGN)</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                name="name"
                defaultValue={playerName}
                required
                placeholder="e.g. TenZ"
              />
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement)
                  autofillFromVlr(input.value)
                }}
              >
                VLR autofill
              </Button>
            </div>
            {scrapeStatus && (
              <p className="text-[11px] text-muted-foreground">{scrapeStatus}</p>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="current_team">Current team</Label>
            <Input
              id="current_team"
              name="current_team"
              defaultValue={initial?.current_team ?? ""}
              placeholder="e.g. Sentinels / Free Agent"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sub_region">Sub-region</Label>
            <Select id="sub_region" name="sub_region" defaultValue={initial?.sub_region ?? "NA"}>
              {SUB_REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="role">Role</Label>
            <Select id="role" name="role" defaultValue={initial?.role ?? "Duelist"}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contract_status">Contract</Label>
            <Select
              id="contract_status"
              name="contract_status"
              defaultValue={initial?.contract_status ?? "Free Agent"}
            >
              {CONTRACT_STATUSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent pool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {AGENTS.map((a) => {
              const on = agents.includes(a)
              return (
                <button
                  type="button"
                  key={a}
                  onClick={() => toggleAgent(a)}
                  className={
                    "px-2 py-1 rounded-md text-xs font-medium border transition-colors " +
                    (on
                      ? "bg-primary/15 text-primary border-primary/40"
                      : "bg-secondary text-muted-foreground border-transparent hover:text-foreground")
                  }
                >
                  {a}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="acs">ACS</Label>
            <Input id="acs" name="acs" inputMode="decimal" value={acs} onChange={(e) => setAcs(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="kast">KAST %</Label>
            <Input id="kast" name="kast" inputMode="decimal" value={kast} onChange={(e) => setKast(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="kda">KDA</Label>
            <Input id="kda" name="kda" inputMode="decimal" value={kda} onChange={(e) => setKda(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="first_blood_pct">First Blood %</Label>
            <Input
              id="first_blood_pct"
              name="first_blood_pct"
              inputMode="decimal"
              value={firstBlood}
              onChange={(e) => setFirstBlood(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="clutch_pct">Clutch %</Label>
            <Input
              id="clutch_pct"
              name="clutch_pct"
              inputMode="decimal"
              defaultValue={initial?.clutch_pct?.toString() ?? ""}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2027 flags & pipeline</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="open_qualifier_eligible"
              defaultChecked={initial?.open_qualifier_eligible ?? false}
              className="size-4 accent-primary"
            />
            Open Qualifier eligible
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="championship_points"
              defaultChecked={initial?.championship_points ?? false}
              className="size-4 accent-primary"
            />
            Championship Points (non-partner)
          </label>
          <div className="grid gap-1.5 md:col-span-2">
            <Label htmlFor="pipeline_status">Pipeline stage</Label>
            <Select
              id="pipeline_status"
              name="pipeline_status"
              defaultValue={initial?.pipeline_status ?? "Watching"}
            >
              {PIPELINE_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            name="notes"
            rows={5}
            defaultValue={initial?.notes ?? ""}
            placeholder="VOD review, intel, mental, comms, anything worth remembering."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  )
}
