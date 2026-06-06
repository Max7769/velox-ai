-- Velox AI — Supabase Schema v2
-- Run in: https://supabase.com/dashboard → SQL Editor → New query
-- Safe to re-run (all statements are idempotent)

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Tables ───────────────────────────────────────────────────────────────────

create table if not exists public.submissions (
  id              text primary key,
  broker_name     text not null default '',
  broker_email    text not null default '',
  broker_company  text not null default '',
  status          text not null default 'pending'
                    check (status in ('pending','processing','accepted','declined','referred')),
  score           integer check (score between 0 and 100),
  extracted_data  jsonb,
  file_name       text,
  file_path       text,
  notes           text,
  decision_by     text,
  decision_at     timestamptz,
  processed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.audit_log (
  id              uuid primary key default uuid_generate_v4(),
  submission_id   text references public.submissions(id) on delete cascade,
  action          text not null,
  actor           text not null,
  detail          text,
  created_at      timestamptz not null default now()
);

create table if not exists public.appetite_rules (
  id              text primary key default 'rule-' || substring(uuid_generate_v4()::text, 1, 8),
  coverage_type   text not null default 'All',
  field           text not null,
  operator        text not null check (operator in ('gt','lt','eq','contains','not_contains')),
  value           text not null,
  action          text not null check (action in ('accept','decline','refer')),
  priority        integer not null default 10,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

create table if not exists public.team_members (
  id              uuid primary key default uuid_generate_v4(),
  email           text unique not null,
  name            text not null,
  role            text not null default 'underwriter' check (role in ('admin','underwriter','viewer')),
  avatar          text,
  invited_by      text,
  joined_at       timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists submissions_status_idx    on public.submissions(status);
create index if not exists submissions_created_idx   on public.submissions(created_at desc);
create index if not exists submissions_broker_idx    on public.submissions(broker_company);
create index if not exists audit_log_submission_idx  on public.audit_log(submission_id);

-- ── Updated_at trigger ───────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists submissions_updated_at on public.submissions;
create trigger submissions_updated_at
  before update on public.submissions
  for each row execute function public.handle_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Service role key (used on the backend) bypasses RLS automatically.
-- Anon key (used by the frontend) must pass through the policies below.

alter table public.submissions    enable row level security;
alter table public.audit_log      enable row level security;
alter table public.appetite_rules enable row level security;
alter table public.team_members   enable row level security;

-- Drop and recreate policies so re-running is idempotent
do $$ begin
  drop policy if exists "anon_select"  on public.submissions;
  drop policy if exists "anon_insert"  on public.submissions;
  drop policy if exists "anon_update"  on public.submissions;
  drop policy if exists "anon_select"  on public.audit_log;
  drop policy if exists "anon_insert"  on public.audit_log;
  drop policy if exists "anon_select"  on public.appetite_rules;
  drop policy if exists "anon_insert"  on public.appetite_rules;
  drop policy if exists "anon_update"  on public.appetite_rules;
  drop policy if exists "anon_select"  on public.team_members;
  drop policy if exists "anon_insert"  on public.team_members;
end $$;

-- submissions: full anon access (app controls auth via Clerk)
create policy "anon_select" on public.submissions for select using (true);
create policy "anon_insert" on public.submissions for insert with check (true);
create policy "anon_update" on public.submissions for update using (true) with check (true);

-- audit_log
create policy "anon_select" on public.audit_log for select using (true);
create policy "anon_insert" on public.audit_log for insert with check (true);

-- appetite_rules
create policy "anon_select" on public.appetite_rules for select using (true);
create policy "anon_insert" on public.appetite_rules for insert with check (true);
create policy "anon_update" on public.appetite_rules for update using (true) with check (true);

-- team_members
create policy "anon_select" on public.team_members for select using (true);
create policy "anon_insert" on public.team_members for insert with check (true);

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- Enables postgres_changes subscriptions used by lib/realtime.ts
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table public.submissions;
commit;

-- ── Seed data ────────────────────────────────────────────────────────────────
-- Default appetite rules (skip if already exist)
insert into public.appetite_rules (coverage_type, field, operator, value, action, priority)
  select * from (values
    ('All',            'score', 'gt',       '75',    'accept',  1),
    ('All',            'score', 'lt',       '35',    'decline', 2),
    ('Marine Cargo',   'score', 'gt',       '65',    'accept',  3),
    ('Cyber Liability','loss_history','contains','claim','refer',4),
    ('All',            'score', 'gt',       '50',    'refer',   5),
    ('All',            'score', 'lt',       '50',    'decline', 6)
  ) as t(coverage_type, field, operator, value, action, priority)
where not exists (select 1 from public.appetite_rules limit 1);

-- Default admin team member (replace with real credentials)
insert into public.team_members (email, name, role)
  select 'uzarek.maksymilian@gmail.com', 'Max Uzarek', 'admin'
  where not exists (select 1 from public.team_members limit 1);
