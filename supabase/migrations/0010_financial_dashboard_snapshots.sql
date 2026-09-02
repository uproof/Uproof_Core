-- =========================================================
-- UpRoof CRM - Financial System Schema
-- Supabase / PostgreSQL
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- 1. FINANCIAL CATEGORIES
-- =========================================================
-- Canonical categories used by the application.
-- These are manually managed by admins.
-- =========================================================

create table if not exists public.financial_categories (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  slug text not null unique,

  sort_order integer not null default 0,
  active boolean not null default true,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint financial_categories_name_unique unique (name)
);

create index if not exists idx_financial_categories_sort_order
  on public.financial_categories(sort_order);

create index if not exists idx_financial_categories_active
  on public.financial_categories(active);

drop trigger if exists trg_financial_categories_touch_updated_at
  on public.financial_categories;

create trigger trg_financial_categories_touch_updated_at
before update on public.financial_categories
for each row
execute function public.touch_updated_at();

-- =========================================================
-- 2. CATEGORY ALIASES
-- =========================================================
-- Handles source-category naming variations.
-- =========================================================

create table if not exists public.financial_category_aliases (
  id uuid primary key default gen_random_uuid(),

  source_name text not null unique,

  category_id uuid not null
    references public.financial_categories(id)
    on delete restrict,

  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_financial_category_aliases_category
  on public.financial_category_aliases(category_id);

-- =========================================================
-- 3. CATEGORY CORRECTION RULES
-- =========================================================
-- Used when the source category itself is wrong.
-- =========================================================

create table if not exists public.financial_category_rules (
  id uuid primary key default gen_random_uuid(),

  match_field text not null
    check (
      match_field in (
        'item_name',
        'vendor',
        'source_category_name'
      )
    ),

  pattern text not null,

  category_id uuid not null
    references public.financial_categories(id)
    on delete restrict,

  priority integer not null default 100,
  active boolean not null default true,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_financial_category_rules_lookup
  on public.financial_category_rules(match_field, active, priority);

create index if not exists idx_financial_category_rules_category
  on public.financial_category_rules(category_id);

drop trigger if exists trg_financial_category_rules_touch_updated_at
  on public.financial_category_rules;

create trigger trg_financial_category_rules_touch_updated_at
before update on public.financial_category_rules
for each row
execute function public.touch_updated_at();

-- =========================================================
-- 4. FINANCIAL IMPORTS
-- =========================================================
-- One record per uploaded CSV/XLSX import.
-- =========================================================

create table if not exists public.financial_imports (
  id uuid primary key default gen_random_uuid(),

  file_name text not null,

  source_type text not null default 'manual_file'
    check (
      source_type in ('manual_file', 'csv', 'xlsx')
    ),

  status text not null default 'pending'
    check (
      status in (
        'pending',
        'validating',
        'warning',
        'success',
        'failed'
      )
    ),

  rows_total integer not null default 0,
  rows_imported integer not null default 0,
  rows_failed integer not null default 0,

  invoice_count integer not null default 0,
  project_count integer not null default 0,
  vendor_count integer not null default 0,

  total_amount numeric(14,2),

  warnings jsonb not null default '[]'::jsonb,
  errors jsonb not null default '[]'::jsonb,

  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,

  created_at timestamptz not null default timezone('utc', now()),

  created_by uuid references public.user_profiles(id)
    on delete set null
);

create index if not exists idx_financial_imports_created_at
  on public.financial_imports(created_at desc);

create index if not exists idx_financial_imports_status
  on public.financial_imports(status);

-- =========================================================
-- 5. FINANCIAL DASHBOARD SNAPSHOTS
-- =========================================================
-- A historical point-in-time record of an imported dataset.
-- =========================================================

create table if not exists public.financial_dashboard_snapshots (
  id uuid primary key default gen_random_uuid(),

  import_id uuid not null
    references public.financial_imports(id)
    on delete restrict,

  data_json jsonb,

  synced_at timestamptz not null default timezone('utc', now()),

  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_financial_snapshots_synced_at
  on public.financial_dashboard_snapshots(synced_at desc);

create index if not exists idx_financial_snapshots_import_id
  on public.financial_dashboard_snapshots(import_id);

-- =========================================================
-- 6. FINANCIAL TRANSACTIONS
-- =========================================================
-- PRIMARY SOURCE OF TRUTH.
-- =========================================================

create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),

  import_id uuid
    references public.financial_imports(id)
    on delete restrict,

  snapshot_id uuid
    references public.financial_dashboard_snapshots(id)
    on delete restrict,

  invoice_id text not null,

  invoice_date date not null,

  month text not null
    check (month ~ '^[0-9]{4}-[0-9]{2}$'),

  project text not null,

  vendor text not null,

  item_name text,

  source_category_name text,

  category_id uuid
    references public.financial_categories(id)
    on delete restrict,

  qty numeric(14,3),

  unit text,

  unit_price numeric(14,2),

  total_without_vat numeric(14,2) not null,

  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_financial_transactions_import_id
  on public.financial_transactions(import_id);

create index if not exists idx_financial_transactions_snapshot_id
  on public.financial_transactions(snapshot_id);

create index if not exists idx_financial_transactions_invoice_id
  on public.financial_transactions(invoice_id);

create index if not exists idx_financial_transactions_invoice_date
  on public.financial_transactions(invoice_date);

create index if not exists idx_financial_transactions_month
  on public.financial_transactions(month);

create index if not exists idx_financial_transactions_project
  on public.financial_transactions(project);

create index if not exists idx_financial_transactions_vendor
  on public.financial_transactions(vendor);

create index if not exists idx_financial_transactions_category
  on public.financial_transactions(category_id);

-- =========================================================
-- 7. IMPORT ROW IDENTIFIER / DEDUPLICATION
-- =========================================================

alter table public.financial_transactions
add column if not exists row_fingerprint text;

create index if not exists idx_financial_transactions_fingerprint
  on public.financial_transactions(row_fingerprint);

-- =========================================================
-- 8. OPTIONAL PROJECT MASTER TABLE
-- =========================================================
-- This is intentionally not required for the first migration.
-- =========================================================

-- Do not create a project table yet unless the existing CRM
-- already has a project entity that should be connected here.

-- =========================================================
-- 9. INITIAL CANONICAL CATEGORIES
-- =========================================================

insert into public.financial_categories
  (name, slug, sort_order)
values
  ('Wood', 'wood', 1),
  ('Vehicle Parts', 'vehicle-parts', 2),
  ('Tools', 'tools', 3),
  ('Services', 'services', 4),
  ('Roof Accessories', 'roof-accessories', 5),
  ('Rental Equipment', 'rental-equipment', 6),
  ('Other', 'other', 7),
  ('Metals', 'metals', 8),
  ('Membranes & Sealants', 'membranes-sealants', 9),
  ('Gutters', 'gutters', 10),
  ('Fuel', 'fuel', 11),
  ('Fasteners', 'fasteners', 12),
  ('Equipment', 'equipment', 13),
  ('Consumables', 'consumables', 14),
  ('Wages', 'wages', 15)
on conflict (slug) do nothing;

-- =========================================================
-- 10. ROW LEVEL SECURITY
-- =========================================================

alter table public.financial_categories enable row level security;
alter table public.financial_category_aliases enable row level security;
alter table public.financial_category_rules enable row level security;
alter table public.financial_imports enable row level security;
alter table public.financial_dashboard_snapshots enable row level security;
alter table public.financial_transactions enable row level security;

-- =========================================================
-- 11. REMOVE EXISTING FINANCIAL POLICIES IF RE-RUNNING
-- =========================================================

drop policy if exists "superadmin_select_financial_categories"
  on public.financial_categories;

drop policy if exists "superadmin_insert_financial_categories"
  on public.financial_categories;

drop policy if exists "superadmin_update_financial_categories"
  on public.financial_categories;

drop policy if exists "superadmin_delete_financial_categories"
  on public.financial_categories;

drop policy if exists "superadmin_select_financial_category_aliases"
  on public.financial_category_aliases;

drop policy if exists "superadmin_insert_financial_category_aliases"
  on public.financial_category_aliases;

drop policy if exists "superadmin_update_financial_category_aliases"
  on public.financial_category_aliases;

drop policy if exists "superadmin_delete_financial_category_aliases"
  on public.financial_category_aliases;

drop policy if exists "superadmin_select_financial_category_rules"
  on public.financial_category_rules;

drop policy if exists "superadmin_insert_financial_category_rules"
  on public.financial_category_rules;

drop policy if exists "superadmin_update_financial_category_rules"
  on public.financial_category_rules;

drop policy if exists "superadmin_delete_financial_category_rules"
  on public.financial_category_rules;

drop policy if exists "superadmin_select_financial_imports"
  on public.financial_imports;

drop policy if exists "superadmin_insert_financial_imports"
  on public.financial_imports;

drop policy if exists "superadmin_update_financial_imports"
  on public.financial_imports;

drop policy if exists "superadmin_select_financial_snapshots"
  on public.financial_dashboard_snapshots;

drop policy if exists "superadmin_insert_financial_snapshots"
  on public.financial_dashboard_snapshots;

drop policy if exists "superadmin_select_financial_transactions"
  on public.financial_transactions;

drop policy if exists "superadmin_insert_financial_transactions"
  on public.financial_transactions;

-- =========================================================
-- 12. FINANCIAL RLS POLICIES
-- =========================================================

create policy "superadmin_select_financial_categories"
  on public.financial_categories
  for select
  using (public.is_superadmin_active());

create policy "superadmin_insert_financial_categories"
  on public.financial_categories
  for insert
  with check (public.is_superadmin_active());

create policy "superadmin_update_financial_categories"
  on public.financial_categories
  for update
  using (public.is_superadmin_active())
  with check (public.is_superadmin_active());

create policy "superadmin_delete_financial_categories"
  on public.financial_categories
  for delete
  using (public.is_superadmin_active());

create policy "superadmin_select_financial_category_aliases"
  on public.financial_category_aliases
  for select
  using (public.is_superadmin_active());

create policy "superadmin_insert_financial_category_aliases"
  on public.financial_category_aliases
  for insert
  with check (public.is_superadmin_active());

create policy "superadmin_update_financial_category_aliases"
  on public.financial_category_aliases
  for update
  using (public.is_superadmin_active())
  with check (public.is_superadmin_active());

create policy "superadmin_delete_financial_category_aliases"
  on public.financial_category_aliases
  for delete
  using (public.is_superadmin_active());

create policy "superadmin_select_financial_category_rules"
  on public.financial_category_rules
  for select
  using (public.is_superadmin_active());

create policy "superadmin_insert_financial_category_rules"
  on public.financial_category_rules
  for insert
  with check (public.is_superadmin_active());

create policy "superadmin_update_financial_category_rules"
  on public.financial_category_rules
  for update
  using (public.is_superadmin_active())
  with check (public.is_superadmin_active());

create policy "superadmin_delete_financial_category_rules"
  on public.financial_category_rules
  for delete
  using (public.is_superadmin_active());

create policy "superadmin_select_financial_imports"
  on public.financial_imports
  for select
  using (public.is_superadmin_active());

create policy "superadmin_insert_financial_imports"
  on public.financial_imports
  for insert
  with check (public.is_superadmin_active());

create policy "superadmin_update_financial_imports"
  on public.financial_imports
  for update
  using (public.is_superadmin_active())
  with check (public.is_superadmin_active());

create policy "superadmin_select_financial_snapshots"
  on public.financial_dashboard_snapshots
  for select
  using (public.is_superadmin_active());

create policy "superadmin_insert_financial_snapshots"
  on public.financial_dashboard_snapshots
  for insert
  with check (public.is_superadmin_active());

create policy "superadmin_select_financial_transactions"
  on public.financial_transactions
  for select
  using (public.is_superadmin_active());

create policy "superadmin_insert_financial_transactions"
  on public.financial_transactions
  for insert
  with check (public.is_superadmin_active());

-- =========================================================
-- 13. REPORTING VIEWS
-- =========================================================
-- These are query layers, NOT duplicate storage.
-- =========================================================

create or replace view public.financial_project_summary as
select
  project,

  sum(total_without_vat) as total_cost,

  sum(
    case
      when category_id is not null
       and exists (
         select 1
         from public.financial_categories c
         where c.id = financial_transactions.category_id
           and c.slug = 'wages'
       )
      then 0
      else total_without_vat
    end
  ) as materials_cost,

  sum(
    case
      when exists (
        select 1
        from public.financial_categories c
        where c.id = financial_transactions.category_id
          and c.slug = 'wages'
      )
      then total_without_vat
      else 0
    end
  ) as wages,

  sum(
    case
      when exists (
        select 1
        from public.financial_categories c
        where c.id = financial_transactions.category_id
          and c.slug = 'wages'
      )
      and lower(trim(coalesce(unit, ''))) = 'h'
      then coalesce(qty, 0)
      else 0
    end
  ) as man_hours,

  sum(
    case
      when not exists (
        select 1
        from public.financial_categories c
        where c.id = financial_transactions.category_id
          and c.slug = 'wages'
      )
      then coalesce(qty, 0)
      else 0
    end
  ) as material_quantity,

  count(distinct invoice_id) as invoice_count

from public.financial_transactions

group by project;

create or replace view public.financial_monthly_summary as
select
  month,

  sum(total_without_vat) as total_costs,

  sum(
    case
      when not exists (
        select 1
        from public.financial_categories c
        where c.id = financial_transactions.category_id
          and c.slug = 'wages'
      )
      then total_without_vat
      else 0
    end
  ) as materials_total,

  sum(
    case
      when exists (
        select 1
        from public.financial_categories c
        where c.id = financial_transactions.category_id
          and c.slug = 'wages'
      )
      then total_without_vat
      else 0
    end
  ) as wages

from public.financial_transactions

group by month;

create or replace view public.financial_company_summary as
select
  coalesce(sum(total_without_vat), 0) as total_spend,

  count(distinct project) as total_projects,

  count(distinct vendor) as total_vendors,

  coalesce(
    sum(
      case
        when not exists (
          select 1
          from public.financial_categories c
          where c.id = financial_transactions.category_id
            and c.slug = 'wages'
        )
        then coalesce(qty, 0)
        else 0
      end
    ),
    0
  ) as total_materials,

  coalesce(
    sum(
      case
        when exists (
          select 1
          from public.financial_categories c
          where c.id = financial_transactions.category_id
            and c.slug = 'wages'
        )
        then total_without_vat
        else 0
      end
    ),
    0
  ) as total_wages,

  count(distinct invoice_id) as total_invoice_count

from public.financial_transactions;
