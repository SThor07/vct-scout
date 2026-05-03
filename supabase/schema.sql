-- VCT Scout — Supabase schema
-- Run this in the Supabase SQL editor.

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ===== users (1:1 with auth.users) =====
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('T1 Org','T2 Challengers','Independent Scout')),
  org_name text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

drop policy if exists "users self read" on public.users;
create policy "users self read" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users self insert" on public.users;
create policy "users self insert" on public.users
  for insert with check (auth.uid() = id);

drop policy if exists "users self update" on public.users;
create policy "users self update" on public.users
  for update using (auth.uid() = id);

-- ===== players =====
create table if not exists public.players (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  current_team text,
  sub_region text not null,
  role text not null check (role in ('IGL','Duelist','Sentinel','Controller','Flex')),
  agents text[] not null default '{}',
  acs numeric,
  kast numeric,
  kda numeric,
  first_blood_pct numeric,
  clutch_pct numeric,
  contract_status text not null default 'Free Agent'
    check (contract_status in ('Signed','Expiring','Free Agent')),
  open_qualifier_eligible boolean not null default false,
  championship_points boolean not null default false,
  notes text,
  pipeline_status text not null default 'Watching'
    check (pipeline_status in ('Watching','Shortlisted','Contacted','In Trial','Signed','Passed')),
  created_at timestamptz not null default now()
);

create index if not exists players_user_id_idx on public.players(user_id);
create index if not exists players_pipeline_status_idx on public.players(pipeline_status);

alter table public.players enable row level security;

drop policy if exists "players owner all" on public.players;
create policy "players owner all" on public.players
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== roster_builds =====
create table if not exists public.roster_builds (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null default 'Untitled Roster',
  player_ids uuid[] not null default '{}',
  ai_analysis jsonb,
  created_at timestamptz not null default now()
);

create index if not exists roster_builds_user_id_idx on public.roster_builds(user_id);

alter table public.roster_builds enable row level security;

drop policy if exists "roster_builds owner all" on public.roster_builds;
create policy "roster_builds owner all" on public.roster_builds
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
