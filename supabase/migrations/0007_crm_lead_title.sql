alter table public.crm_leads
  add column if not exists title text not null default '';