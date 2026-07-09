-- UpRoof CRM security controls

alter table public.user_profiles
  add column if not exists crm_mfa_secret text not null default '';

alter table public.user_profiles
  add column if not exists session_valid_after timestamptz not null default timezone('utc', now());

alter table public.user_profiles
  add column if not exists archived_at timestamptz;

create table if not exists public.crm_recovery_codes (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  code_hash text not null,
  used_at text not null default '',
  created_at text not null default timezone('utc', now())
);

create index if not exists idx_crm_recovery_codes_user_id on public.crm_recovery_codes(user_id);

create table if not exists public.crm_password_reset_tokens (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  token_hash text not null,
  requested_by text not null default '',
  expires_at text not null,
  used_at text not null default '',
  created_at text not null default timezone('utc', now())
);

create index if not exists idx_crm_password_reset_tokens_user_id on public.crm_password_reset_tokens(user_id);
create index if not exists idx_crm_password_reset_tokens_token_hash on public.crm_password_reset_tokens(token_hash);
