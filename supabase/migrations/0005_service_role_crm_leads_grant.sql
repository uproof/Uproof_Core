-- Ensure the Supabase service role can manage CRM leads in the live database.
grant select, insert, update, delete on public.crm_leads to service_role;
