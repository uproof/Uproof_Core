-- UpRoof CRM security RLS hardening for reset and recovery token tables.

alter table public.crm_recovery_codes enable row level security;
alter table public.crm_password_reset_tokens enable row level security;

drop policy if exists "no_public_crm_recovery_codes_access" on public.crm_recovery_codes;
drop policy if exists "no_public_crm_password_reset_tokens_access" on public.crm_password_reset_tokens;

create policy "no_public_crm_recovery_codes_access"
  on public.crm_recovery_codes
  for all
  using (false)
  with check (false);

create policy "no_public_crm_password_reset_tokens_access"
  on public.crm_password_reset_tokens
  for all
  using (false)
  with check (false);
