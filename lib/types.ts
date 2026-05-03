import type {
  Agent,
  ContractStatus,
  PipelineStatus,
  Role,
  SubRegion,
  CoachRole,
} from "./constants"

export interface Player {
  id: string
  user_id: string
  name: string
  current_team: string | null
  sub_region: SubRegion
  role: Role
  agents: Agent[]
  acs: number | null
  kast: number | null
  kda: number | null
  first_blood_pct: number | null
  clutch_pct: number | null
  contract_status: ContractStatus
  open_qualifier_eligible: boolean
  championship_points: boolean
  notes: string | null
  pipeline_status: PipelineStatus
  created_at: string
}

export type PlayerInsert = Omit<Player, "id" | "user_id" | "created_at">

export interface UserProfile {
  id: string
  role: CoachRole
  org_name: string | null
}

export interface RosterBuild {
  id: string
  user_id: string
  name: string
  player_ids: string[]
  ai_analysis: RosterAnalysis | null
  created_at: string
}

export interface RosterAnalysis {
  synergies: string[]
  gaps: string[]
  riskAssessment: string
  overallRating: number
}

export type RoleVerdict =
  | "perfect fit"
  | "workable"
  | "off-role risk"
  | "do not pursue"

export interface ScoutReport {
  strengths: string[]
  weaknesses: string[]
  fitScore: number
  redFlags: string[]
  recommendation: string
  roleVerdict: RoleVerdict
}
