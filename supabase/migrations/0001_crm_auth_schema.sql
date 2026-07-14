-- UpRoof CRM/CMS production schema (Supabase)
-- Run through Supabase SQL editor or migration pipeline.

create extension if not exists pgcrypto;

-- Generic updated_at trigger.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null check (role in ('superadmin', 'sales')),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_user_profiles_touch_updated_at on public.user_profiles;
create trigger trg_user_profiles_touch_updated_at
before update on public.user_profiles
for each row
execute function public.touch_updated_at();

-- Keep role checks server-authoritative (user_profiles), not JWT-claim-only.
create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_profiles
  where id = auth.uid()
    and is_active = true
  limit 1;
$$;

create or replace function public.is_superadmin_active()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'superadmin', false);
$$;

create or replace function public.is_sales_active()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'sales', false);
$$;

revoke all on function public.current_profile_role() from public;
revoke all on function public.is_superadmin_active() from public;
revoke all on function public.is_sales_active() from public;

grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.is_superadmin_active() to authenticated;
grant execute on function public.is_sales_active() to authenticated;

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  customer text not null,
  company text not null,
  phone text not null,
  email text not null,
  address text not null,
  problem text not null default '',
  project_address text not null default '',
  client_character_note text not null default '',
  status text not null,
  progress text not null,
  activity_update text not null,
  deal_progress text not null,
  note text not null,
  owner text not null,
  value numeric(12,2) not null check (value >= 0),
  next_action text not null,
  attachments_json jsonb not null default '[]'::jsonb,
  estimator_data_json jsonb not null default '[]'::jsonb,
  assigned_sales_user_id uuid references public.user_profiles(id),
  assigned_by_user_id uuid references public.user_profiles(id),
  assigned_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint crm_leads_status_check
    check (status in ('NEW', 'CONTACTED', 'INSPECTION_SCHEDULED', 'INSPECTION_COMPLETED', 'ESTIMATING', 'QUOTE_SENT', 'WON', 'LOST', 'PROJECT_STARTED', 'COMPLETED', 'CANCELLED')),
  constraint crm_leads_progress_check
    check (progress in ('new', 'reached', 'in progress', 'cancelled', 'won')),
  constraint crm_leads_deal_progress_check
    check (deal_progress in ('Negotiation', 'Signed', 'Lost', 'Won', 'Cancelled'))
);

drop trigger if exists trg_crm_leads_touch_updated_at on public.crm_leads;
create trigger trg_crm_leads_touch_updated_at
before update on public.crm_leads
for each row
execute function public.touch_updated_at();

create table if not exists public.crm_user_activity (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.user_profiles(id),
  actor_email text not null,
  actor_role text not null check (actor_role in ('superadmin', 'sales')),
  action text not null,
  lead_id uuid references public.crm_leads(id),
  detail text,
  ip inet,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_crm_leads_assigned_sales_user_id on public.crm_leads(assigned_sales_user_id);
create index if not exists idx_crm_user_activity_actor_user_id on public.crm_user_activity(actor_user_id);
create index if not exists idx_crm_user_activity_created_at on public.crm_user_activity(created_at desc);

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  recipient_email text not null,
  title text not null,
  message text not null,
  link text not null default '',
  read_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_notifications_recipient_email on public.notifications(recipient_email, created_at desc);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  request_id text not null,
  actor_email text not null,
  actor_role text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  detail text not null default '',
  success boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_audit_log_created_at on public.audit_log(created_at desc);

create table if not exists public.crm_events (
  id bigint generated always as identity primary key,
  event_type text not null,
  aggregate_type text not null,
  aggregate_id text not null,
  payload_json jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_crm_events_created_at on public.crm_events(created_at desc);

alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;
alter table public.crm_events enable row level security;

drop policy if exists "superadmin_select_notifications" on public.notifications;
drop policy if exists "superadmin_insert_notifications" on public.notifications;
drop policy if exists "superadmin_select_audit_log" on public.audit_log;
drop policy if exists "superadmin_insert_audit_log" on public.audit_log;
drop policy if exists "superadmin_select_crm_events" on public.crm_events;
drop policy if exists "superadmin_insert_crm_events" on public.crm_events;

create policy "superadmin_select_notifications"
  on public.notifications
  for select
  using (public.is_superadmin_active());

create policy "superadmin_insert_notifications"
  on public.notifications
  for insert
  with check (public.is_superadmin_active());

create policy "superadmin_select_audit_log"
  on public.audit_log
  for select
  using (public.is_superadmin_active());

create policy "superadmin_insert_audit_log"
  on public.audit_log
  for insert
  with check (public.is_superadmin_active());

create policy "superadmin_select_crm_events"
  on public.crm_events
  for select
  using (public.is_superadmin_active());

create policy "superadmin_insert_crm_events"
  on public.crm_events
  for insert
  with check (public.is_superadmin_active());

create table if not exists public.rate_limits (
  identifier text primary key,
  count integer not null,
  reset_at bigint not null,
  updated_at_utc timestamptz not null default timezone('utc', now())
);

alter table public.rate_limits enable row level security;

drop policy if exists "no_public_rate_limit_access" on public.rate_limits;
create policy "no_public_rate_limit_access"
  on public.rate_limits
  for all
  using (false)
  with check (false);

alter table public.user_profiles enable row level security;
alter table public.crm_leads enable row level security;
alter table public.crm_user_activity enable row level security;

-- Remove legacy broad policies if they exist.
drop policy if exists "superadmin_full_user_profiles" on public.user_profiles;
drop policy if exists "superadmin_full_crm_leads" on public.crm_leads;
drop policy if exists "superadmin_full_crm_user_activity" on public.crm_user_activity;
drop policy if exists "sales_select_assigned_leads" on public.crm_leads;
drop policy if exists "sales_update_assigned_leads" on public.crm_leads;
drop policy if exists "sales_read_own_activity" on public.crm_user_activity;

-- user_profiles RLS
create policy "superadmin_select_user_profiles"
  on public.user_profiles
  for select
  using (public.is_superadmin_active());

create policy "superadmin_insert_user_profiles"
  on public.user_profiles
  for insert
  with check (public.is_superadmin_active());

create policy "superadmin_update_user_profiles"
  on public.user_profiles
  for update
  using (public.is_superadmin_active())
  with check (public.is_superadmin_active());

create policy "superadmin_delete_user_profiles"
  on public.user_profiles
  for delete
  using (public.is_superadmin_active());

create policy "sales_select_own_profile"
  on public.user_profiles
  for select
  using (public.is_sales_active() and id = auth.uid());

-- crm_leads RLS
create policy "superadmin_select_crm_leads"
  on public.crm_leads
  for select
  using (public.is_superadmin_active());

create policy "superadmin_insert_crm_leads"
  on public.crm_leads
  for insert
  with check (public.is_superadmin_active());

create policy "superadmin_update_crm_leads"
  on public.crm_leads
  for update
  using (public.is_superadmin_active())
  with check (public.is_superadmin_active());

create policy "superadmin_delete_crm_leads"
  on public.crm_leads
  for delete
  using (public.is_superadmin_active());

create policy "sales_select_assigned_leads"
  on public.crm_leads
  for select
  using (
    public.is_sales_active()
    and assigned_sales_user_id = auth.uid()
  );

create policy "sales_update_assigned_leads"
  on public.crm_leads
  for update
  using (
    public.is_sales_active()
    and assigned_sales_user_id = auth.uid()
  )
  with check (
    public.is_sales_active()
    and assigned_sales_user_id = auth.uid()
  );

-- crm_user_activity RLS (immutable log: no update/delete policy)
create policy "superadmin_select_crm_user_activity"
  on public.crm_user_activity
  for select
  using (public.is_superadmin_active());

create policy "superadmin_insert_crm_user_activity"
  on public.crm_user_activity
  for insert
  with check (public.is_superadmin_active());

create policy "sales_read_own_activity"
  on public.crm_user_activity
  for select
  using (
    public.is_sales_active()
    and actor_user_id = auth.uid()
  );
