alter table public.crm_leads
  drop constraint if exists crm_leads_status_check;

update public.crm_leads
set status = case status
  when 'NEW' then 'NEW_LEAD'
  when 'CONTACTED' then 'WAITING_DATA'
  when 'INSPECTION_SCHEDULED' then 'WAITING_DATA'
  when 'INSPECTION_COMPLETED' then 'WAITING_DATA'
  when 'ESTIMATING' then 'ESTIMATING'
  when 'QUOTE_SENT' then 'ESTIMATE_SENT'
  when 'WON' then 'ACCEPTED'
  when 'LOST' then 'DENIED'
  when 'PROJECT_STARTED' then 'FROZEN'
  when 'COMPLETED' then 'FROZEN'
  when 'CANCELLED' then 'FROZEN'
  else status
end;

alter table public.crm_leads
  add constraint crm_leads_status_check
  check (status in ('NEW_LEAD', 'WAITING_DATA', 'ESTIMATING', 'ESTIMATE_DONE', 'ESTIMATE_SENT', 'ACCEPTED', 'DENIED', 'FROZEN'));