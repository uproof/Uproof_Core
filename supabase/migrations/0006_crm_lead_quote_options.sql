-- Dedicated quote option storage per lead (Eco / Optimal / Lux)

create table if not exists public.crm_lead_quote_options (
  id bigint generated always as identity primary key,
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  option_type text not null check (option_type in ('eco', 'optimal', 'lux')),
  amount text not null default '',
  liked boolean not null default false,
  quote_file_name text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint crm_lead_quote_options_unique unique (lead_id, option_type)
);

create index if not exists idx_crm_lead_quote_options_lead_id on public.crm_lead_quote_options(lead_id);

alter table public.crm_lead_quote_options enable row level security;

drop policy if exists "superadmin_select_crm_lead_quote_options" on public.crm_lead_quote_options;
drop policy if exists "superadmin_insert_crm_lead_quote_options" on public.crm_lead_quote_options;
drop policy if exists "superadmin_update_crm_lead_quote_options" on public.crm_lead_quote_options;
drop policy if exists "superadmin_delete_crm_lead_quote_options" on public.crm_lead_quote_options;
drop policy if exists "sales_select_assigned_crm_lead_quote_options" on public.crm_lead_quote_options;
drop policy if exists "sales_update_assigned_crm_lead_quote_options" on public.crm_lead_quote_options;

create policy "superadmin_select_crm_lead_quote_options"
  on public.crm_lead_quote_options
  for select
  using (public.is_superadmin_active());

create policy "superadmin_insert_crm_lead_quote_options"
  on public.crm_lead_quote_options
  for insert
  with check (public.is_superadmin_active());

create policy "superadmin_update_crm_lead_quote_options"
  on public.crm_lead_quote_options
  for update
  using (public.is_superadmin_active())
  with check (public.is_superadmin_active());

create policy "superadmin_delete_crm_lead_quote_options"
  on public.crm_lead_quote_options
  for delete
  using (public.is_superadmin_active());

create policy "sales_select_assigned_crm_lead_quote_options"
  on public.crm_lead_quote_options
  for select
  using (
    public.is_sales_active()
    and exists (
      select 1
      from public.crm_leads leads
      where leads.id = crm_lead_quote_options.lead_id
        and leads.assigned_sales_user_id = auth.uid()
    )
  );

create policy "sales_update_assigned_crm_lead_quote_options"
  on public.crm_lead_quote_options
  for update
  using (
    public.is_sales_active()
    and exists (
      select 1
      from public.crm_leads leads
      where leads.id = crm_lead_quote_options.lead_id
        and leads.assigned_sales_user_id = auth.uid()
    )
  )
  with check (
    public.is_sales_active()
    and exists (
      select 1
      from public.crm_leads leads
      where leads.id = crm_lead_quote_options.lead_id
        and leads.assigned_sales_user_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.crm_lead_quote_options to service_role;
grant usage, select on sequence public.crm_lead_quote_options_id_seq to service_role;
