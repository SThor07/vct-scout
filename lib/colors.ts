import type { PipelineStatus, Role } from "./constants"

export const PALETTE = {
  bg: "#0F1923",
  card: "#1A2634",
  scarlet: "#FF4655",
  cyan: "#00D4FF",
  gold: "#F5A623",
  green: "#00FF94",
  purple: "#8B5CF6",
  textPrimary: "#FFFFFF",
  textSecondary: "#A8B2C1",
  textMuted: "#4A5568",
} as const

export const PIPELINE_COLOR: Record<PipelineStatus, string> = {
  Watching: PALETTE.cyan,
  Shortlisted: PALETTE.gold,
  Contacted: PALETTE.scarlet,
  "In Trial": PALETTE.purple,
  Signed: PALETTE.green,
  Passed: PALETTE.textMuted,
}

export const ROLE_COLOR: Record<Role, string> = {
  IGL: PALETTE.gold,
  Duelist: PALETTE.scarlet,
  Sentinel: PALETTE.cyan,
  Controller: PALETTE.purple,
  Flex: PALETTE.green,
}

export function fitScoreColor(score: number): string {
  if (score >= 8) return PALETTE.green
  if (score >= 5) return PALETTE.gold
  return PALETTE.scarlet
}

export function verdictColor(
  verdict: "perfect fit" | "workable" | "off-role risk" | "do not pursue"
): string {
  switch (verdict) {
    case "perfect fit":
      return PALETTE.green
    case "workable":
      return PALETTE.cyan
    case "off-role risk":
      return PALETTE.gold
    case "do not pursue":
      return PALETTE.scarlet
  }
}
