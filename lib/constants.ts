export const SUB_REGIONS = [
  "NA",
  "LATAM",
  "Brazil",
  "EU",
  "MENA",
  "Turkey",
  "SEA",
  "Korea",
  "Japan",
  "South Asia",
  "CN",
] as const

export type SubRegion = (typeof SUB_REGIONS)[number]

export const ROLES = ["IGL", "Duelist", "Sentinel", "Controller", "Flex"] as const
export type Role = (typeof ROLES)[number]

export const AGENTS = [
  "Jett", "Raze", "Phoenix", "Reyna", "Yoru", "Neon", "Iso", "Waylay",
  "Sage", "Cypher", "Killjoy", "Chamber", "Deadlock", "Vyse",
  "Brimstone", "Omen", "Viper", "Astra", "Harbor", "Clove",
  "Sova", "Breach", "Skye", "KAY/O", "Fade", "Gekko", "Tejo",
] as const
export type Agent = (typeof AGENTS)[number]

export const CONTRACT_STATUSES = ["Signed", "Expiring", "Free Agent"] as const
export type ContractStatus = (typeof CONTRACT_STATUSES)[number]

export const PIPELINE_STATUSES = [
  "Watching",
  "Shortlisted",
  "Contacted",
  "In Trial",
  "Signed",
  "Passed",
] as const
export type PipelineStatus = (typeof PIPELINE_STATUSES)[number]

export const COACH_ROLES = [
  "T1 Org",
  "T2 Challengers",
  "Independent Scout",
] as const
export type CoachRole = (typeof COACH_ROLES)[number]
