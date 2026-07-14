-- Allow the Supabase service role to manage CRM auth/profile data.
grant select, insert, update, delete on public.user_profiles to service_role;
grant select, insert, update, delete on public.crm_recovery_codes to service_role;
grant select, insert, update, delete on public.crm_password_reset_tokens to service_role;
grant select, insert, update, delete on public.crm_user_activity to service_role;
grant select, insert, update, delete on public.notifications to service_role;
grant select, insert, update, delete on public.audit_log to service_role;
grant select, insert, update, delete on public.crm_events to service_role;
grant select, insert, update, delete on public.crm_leads to service_role;
grant select, insert, update, delete on public.rate_limits to service_role;