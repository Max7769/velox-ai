-- Velox AI — Supabase Schema
-- Run this in Supabase SQL editor: https://supabase.com/dashboard

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Submissions
create table if not exists public.submissions (
  id              text primary key default 'VLX-' || substring(uuid_generate_v4()::text, 1, 8),
  broker_name     text not null,
  broker_email    text not null,
  broker_company  text not null,
  status          text not null default 'pending' check (status in ('pending','processing','accepted','declined','referred')),
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

-- Audit trail
create table if not exists public.audit_log (
  id              uuid primary key default uuid_generate_v4(),
  submission_id   text references public.submissions(id) on delete cascade,
  action          text not null,
  actor           text not null,
  detail          text,
  created_at      timestamptz not null default now()
);

-- Appetite rules
create table if not exists public.appetite_rules (
  id              uuid primary key default uuid_generate_v4(),
  coverage_type   text not null default 'All',
  field           text not null,
  operator        text not null check (operator in ('gt','lt','eq','contains','not_contains')),
  value           text not null,
  action          text not null check (action in ('accept','decline','refer')),
  priority        integer not null default 10,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

-- Team members
create table if not exists public.team_members (
  id              uuid primary key default uuid_generate_v4(),
  email           text unique not null,
  name            text not null,
  role            text not null default 'underwriter' check (role in ('admin','underwriter','viewer')),
  invited_by      text,
  joined_at       timestamptz not null default now()
);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger submissions_updated_at
  before update on public.submissions
  for each row execute function public.handle_updated_at();

-- RLS (Row Level Security)
alter table public.submissions   enable row level security;
alter table public.audit_log     enable row level security;
alter table public.appetite_rules enable row level security;
alter table public.team_members  enable row level security;

-- Policies (service role bypasses RLS — use service key on backend)
create policy "allow_service" on public.submissions   for all using (true);
create policy "allow_service" on public.audit_log     for all using (true);
create policy "allow_service" on public.appetite_rules for all using (true);
create policy "allow_service" on public.team_members  for all using (true);

-- Seed default appetite rules
insert into public.appetite_rules (coverage_type, field, operator, value, action, priority) values
  ('All',          'score', 'gt', '75', 'accept',  1),
  ('All',          'score', 'lt', '35', 'decline', 2),
  ('Marine Cargo', 'score', 'gt', '65', 'accept',  3),
  ('Cyber Liability', 'loss_history', 'contains', 'claim', 'refer', 4),
  ('All',          'score', 'gt', '50', 'refer',   5),
  ('All',          'score', 'lt', '50', 'decline', 6);
