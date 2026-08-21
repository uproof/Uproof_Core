-- Pipeline categories are derived from crm_leads.status in the application.
-- Keep the database normalized and index the status used by the CRM board.
create index if not exists idx_crm_leads_status on public.crm_leads(status);