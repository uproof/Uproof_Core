create table if not exists public.project_documents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  category text not null check (category in ('contract', 'invoice', 'estimate', 'certificate', 'other')),
  file_name text not null,
  mime_type text not null default 'application/octet-stream',
  file_size integer not null default 0 check (file_size >= 0 and file_size <= 10485760),
  content_base64 text not null,
  uploaded_by_email text not null,
  uploaded_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_project_documents_lead_id on public.project_documents(lead_id, uploaded_at desc);

alter table public.project_documents enable row level security;

create policy "service_role_project_documents" on public.project_documents
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
