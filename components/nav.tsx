"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "@/app/login/actions"

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/players", label: "Players" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/scout", label: "AI Scout" },
  { href: "/roster", label: "Roster" },
]

export function Nav({ orgLabel }: { orgLabel: string }) {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-sidebar/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex h-16 items-center gap-8 px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="size-3 rounded-sm bg-primary shadow-[0_0_12px_var(--color-primary)] group-hover:shadow-[0_0_18px_var(--color-primary)] transition-shadow" />
          <span className="text-base font-bold tracking-tight">VCT SCOUT</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-secondary-fg ml-1">
            2027
          </span>
        </Link>
        <nav className="flex items-center gap-1 h-full">
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative h-full flex items-center px-4 text-[0.9rem] font-medium tracking-[0.08em] uppercase transition-colors",
                  "hover:text-white hover:bg-gradient-to-b hover:from-transparent hover:to-primary/10",
                  active
                    ? "text-white after:content-[''] after:absolute after:left-3 after:right-3 after:bottom-0 after:h-[3px] after:bg-primary after:shadow-[0_0_10px_var(--color-primary)]"
                    : "text-secondary-fg"
                )}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs tracking-wider text-secondary-fg">
            {orgLabel}
          </span>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
