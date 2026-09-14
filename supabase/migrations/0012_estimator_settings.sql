create table if not exists public.estimator_settings (
  id text primary key,
  settings jsonb not null,
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.estimator_settings to service_role;