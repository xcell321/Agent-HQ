-- Agent HQ — initial schema (M0)
-- Multi-user: every row belongs to one user (auth.users). RLS isolates users:
-- a signed-in user can only read/write their own office; anonymous = nothing.
-- API keys are stored ONLY as ciphertext (api_key_ciphertext); encryption and
-- decryption happen in the runner/server with KEY_ENCRYPTION_SECRET, never in
-- the browser.

create extension if not exists pgcrypto;

-- ---------- helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- providers (a user's connected APIs) ----------
create table public.providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,                          -- e.g. 'FreeLLMAPI', 'Groq'
  base_url text not null,                      -- OpenAI-compatible base URL
  api_key_ciphertext text,                     -- null for keyless local endpoints
  default_model text not null default '',
  kind text not null default 'custom'
    check (kind in ('direct', 'router', 'custom')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

-- ---------- agents ----------
create table public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider_id uuid references public.providers (id) on delete set null,
  name text not null,                          -- e.g. 'Bantay'
  role text not null default '',               -- e.g. 'Reviewer'
  kind text not null default 'api'
    check (kind in ('api', 'cli', 'named')),
  model text not null default '',
  status text not null default 'offline'
    check (status in ('working', 'waiting', 'idle', 'offline')),
  current_task text not null default '',
  status_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

-- ---------- activity (live feed) ----------
create table public.activity (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  agent_id uuid references public.agents (id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

-- ---------- approvals ----------
create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  agent_id uuid references public.agents (id) on delete set null,
  title text not null,
  detail text not null default '',
  state text not null default 'pending'
    check (state in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

-- ---------- projects ----------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  path text not null default '',               -- path on the user's PC (reporter-side)
  last_activity_at timestamptz,
  last_event text not null default '',         -- e.g. 'commit', 'push'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

-- ---------- heartbeats (one row per user: their PC runner) ----------
create table public.heartbeats (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_seen_at timestamptz not null default now(),
  runner_version text not null default ''
);

-- ---------- usage (per user, per provider, per agent) ----------
create table public.usage_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  provider_id uuid references public.providers (id) on delete set null,
  agent_id uuid references public.agents (id) on delete set null,
  model text not null default '',
  prompt_tokens integer not null default 0 check (prompt_tokens >= 0),
  completion_tokens integer not null default 0 check (completion_tokens >= 0),
  created_at timestamptz not null default now()
);

-- ---------- indexes ----------
create index idx_providers_user on public.providers (user_id);
create index idx_agents_user on public.agents (user_id);
create index idx_activity_user_created on public.activity (user_id, created_at desc);
create index idx_approvals_user_state on public.approvals (user_id, state);
create index idx_projects_user on public.projects (user_id);
create index idx_usage_user_created on public.usage_events (user_id, created_at desc);

-- ---------- updated_at triggers ----------
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_providers_updated before update on public.providers
  for each row execute function public.set_updated_at();
create trigger trg_agents_updated before update on public.agents
  for each row execute function public.set_updated_at();
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------- row level security ----------
alter table public.profiles enable row level security;
alter table public.providers enable row level security;
alter table public.agents enable row level security;
alter table public.activity enable row level security;
alter table public.approvals enable row level security;
alter table public.projects enable row level security;
alter table public.heartbeats enable row level security;
alter table public.usage_events enable row level security;

-- Owner-only policies: auth.uid() must own the row.
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own providers" on public.providers
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own agents" on public.agents
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own activity" on public.activity
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own approvals" on public.approvals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own projects" on public.projects
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own heartbeat" on public.heartbeats
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own usage" on public.usage_events
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Realtime: the office subscribes to live changes on these tables.
alter publication supabase_realtime add table public.agents;
alter publication supabase_realtime add table public.activity;
alter publication supabase_realtime add table public.approvals;
alter publication supabase_realtime add table public.heartbeats;

-- NOTE (reporter/runner): the PC runner writes with the service-role key,
-- which bypasses RLS. That key lives ONLY on the user's own PC (and in the
-- server environment), never in the browser bundle. Hardening option for
-- later: per-user runner tokens scoped by a dedicated role.
