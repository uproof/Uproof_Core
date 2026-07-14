import {nowIso} from '@/lib/crmDb';
import {upsertProjectFromLead, deleteProjectByLeadId} from '@/lib/crmProjectsStore';
import {CrmLead} from '@/lib/crmMockData';
import {createEmptyCrmEstimatorData, normalizeCrmEstimatorData, stringifyEstimatorData} from '@/lib/crmEstimator';
import {createCrmSupabaseClient as createSupabaseAdminClient} from '@/lib/crmStorage';

function normalizeWorkLog(workLog: unknown, fallback: CrmLead['workLog']) {
  if (!Array.isArray(workLog)) return fallback;
  return workLog
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const candidate = entry as Partial<{time: string; title: string; detail: string}>;
      return {
        time: String(candidate.time || '').trim(),
        title: String(candidate.title || '').trim(),
        detail: String(candidate.detail || '').trim(),
      };
    })
    .filter((entry): entry is CrmLead['workLog'][number] => Boolean(entry && (entry.time || entry.title || entry.detail)));
}

function normalizeLead(lead: CrmLead): CrmLead {
  return {
    ...lead,
    assignedSalesUserId: lead.assignedSalesUserId || null,
    problem: lead.problem || '',
    projectAddress: lead.projectAddress || lead.address || '',
    clientCharacterNote: lead.clientCharacterNote || '',
    workLog: normalizeWorkLog(lead.workLog, []),
    estimatorData: normalizeCrmEstimatorData(lead.estimatorData, createEmptyCrmEstimatorData()),
  };
}

function parseJsonArray<T>(value: unknown, fallback: T[]): T[] {
  if (value == null || value === '') return fallback;
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

type LeadRow = {
  id: string;
  external_id: string | null;
  customer: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  problem: string;
  project_address: string;
  client_character_note: string;
  status: string;
  progress: string;
  activity_update: string;
  deal_progress: string;
  note: string;
  owner: string;
  value: string;
  updated_at: string;
  next_action: string;
  attachments_json: string;
  work_log_json?: unknown;
  estimator_data_json?: unknown;
  assigned_sales_user_id: string | null;
  assigned_by_user_id?: string | null;
  assigned_at?: string | null;
};

function rowToLead(row: LeadRow): CrmLead {
  return normalizeLead({
    id: row.external_id || row.id,
    customer: row.customer,
    company: row.company,
    phone: row.phone,
    email: row.email,
    address: row.address,
    problem: row.problem,
    projectAddress: row.project_address,
    clientCharacterNote: row.client_character_note,
    status: row.status,
    progress: row.progress,
    activityUpdate: row.activity_update,
    dealProgress: row.deal_progress,
    note: row.note,
    owner: row.owner,
    value: String(row.value || ''),
    updatedAt: String(row.updated_at || ''),
    updatedAtUtc: String(row.updated_at || ''),
    nextAction: String(row.next_action || ''),
    assignedSalesUserId: row.assigned_sales_user_id,
    attachments: parseJsonArray<string>(row.attachments_json, []),
    workLog: parseJsonArray(row.work_log_json, []),
    estimatorData: normalizeCrmEstimatorData(parseJsonArray(row.estimator_data_json, []), createEmptyCrmEstimatorData()),
  });
}

type GetCrmLeadsOptions = {
  assignedSalesUserId?: string;
  limit?: number;
};

export async function getCrmLeads(options: GetCrmLeadsOptions = {}): Promise<CrmLead[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return [];
  }

  const assignedSalesUserId = options.assignedSalesUserId?.trim();
  const limit = typeof options.limit === 'number' && Number.isFinite(options.limit) && options.limit > 0 ? Math.floor(options.limit) : 0;
  let query = supabase
    .from('crm_leads')
    .select('id,external_id,customer,company,phone,email,address,problem,project_address,client_character_note,status,progress,activity_update,deal_progress,note,owner,value,updated_at,next_action,attachments_json,work_log_json,estimator_data_json,assigned_sales_user_id,assigned_by_user_id,assigned_at')
    .order('updated_at', {ascending: false})
    .order('created_at', {ascending: false});

  if (assignedSalesUserId) {
    query = query.eq('assigned_sales_user_id', assignedSalesUserId);
  }

  if (limit > 0) {
    query = query.limit(limit);
  }

  const {data, error} = await query;
  if (error || !Array.isArray(data)) {
    return [];
  }

  return data.map((row) => rowToLead(row as LeadRow));
}

export async function getCrmLeadById(leadId: string): Promise<CrmLead | null> {
  const normalizedLeadId = leadId.trim();
  if (!normalizedLeadId) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const {data, error} = await supabase
    .from('crm_leads')
    .select('id,external_id,customer,company,phone,email,address,problem,project_address,client_character_note,status,progress,activity_update,deal_progress,note,owner,value,updated_at,next_action,attachments_json,work_log_json,estimator_data_json,assigned_sales_user_id,assigned_by_user_id,assigned_at')
    .or(`external_id.eq.${normalizedLeadId},id.eq.${normalizedLeadId}`)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return rowToLead(data as LeadRow);
}

export async function isLeadAssignedToSalesUser(leadId: string, salesUserId: string): Promise<boolean> {
  const lead = await getCrmLeadById(leadId);
  return !!lead && lead.assignedSalesUserId === salesUserId;
}

type NewLeadInput = {
  customer: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  problem?: string;
  projectAddress?: string;
  clientCharacterNote?: string;
  owner: string;
  value: string;
  nextAction: string;
  note?: string;
  workLog?: CrmLead['workLog'];
  estimatorData?: CrmLead['estimatorData'];
};

function nextLeadId(leads: CrmLead[]) {
  const max = leads.reduce((acc, lead) => {
    const num = Number(lead.id.replace(/[^\d]/g, ''));
    if (Number.isNaN(num)) return acc;
    return Math.max(acc, num);
  }, 1040);
  return `L-${max + 1}`;
}

export async function addCrmLead(input: NewLeadInput): Promise<CrmLead> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase is required for lead storage');
  }

  const leads = await getCrmLeads();
  const now = nowIso();
  const lead: CrmLead = normalizeLead({
    id: nextLeadId(leads),
    customer: input.customer.trim(),
    company: input.company.trim(),
    phone: input.phone.trim(),
    email: input.email.trim(),
    address: input.address.trim(),
    problem: (input.problem || '').trim(),
    projectAddress: (input.projectAddress || input.address || '').trim(),
    clientCharacterNote: (input.clientCharacterNote || '').trim(),
    status: 'NEW',
    progress: 'new',
    activityUpdate: 'First call',
    dealProgress: 'Negotiation',
    note: (input.note || '').trim() || 'New lead added manually.',
    owner: input.owner.trim(),
    value: input.value.trim(),
    updatedAt: now,
    updatedAtUtc: now,
    nextAction: input.nextAction.trim(),
    attachments: [],
    workLog: normalizeWorkLog(input.workLog, []),
    estimatorData: normalizeCrmEstimatorData(input.estimatorData, createEmptyCrmEstimatorData()),
    assignedSalesUserId: null,
  });

  const {error} = await supabase.from('crm_leads').upsert({
    external_id: lead.id,
    customer: lead.customer,
    company: lead.company,
    phone: lead.phone,
    email: lead.email,
    address: lead.address,
    problem: lead.problem,
    project_address: lead.projectAddress,
    client_character_note: lead.clientCharacterNote,
    status: lead.status,
    progress: lead.progress,
    activity_update: lead.activityUpdate,
    deal_progress: lead.dealProgress,
    note: lead.note,
    owner: lead.owner,
    value: Number(String(lead.value).replace(/[^0-9.-]/g, '')) || 0,
    updated_at: lead.updatedAt,
    next_action: lead.nextAction,
    attachments_json: JSON.stringify(lead.attachments),
    estimator_data_json: stringifyEstimatorData(lead.estimatorData),
    assigned_sales_user_id: null,
    assigned_by_user_id: null,
    assigned_at: null,
  }, {onConflict: 'external_id'});

  if (error) {
    throw new Error(error.message || 'Failed to create CRM lead');
  }

  await upsertProjectFromLead(lead);
  return lead;
}

export async function deleteCrmLead(leadId: string): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return false;
  }

  const {error} = await supabase.from('crm_leads').delete().or(`external_id.eq.${leadId},id.eq.${leadId}`);
  if (error) {
    throw new Error(error.message || 'Failed to delete CRM lead');
  }

  const current = await getCrmLeadById(leadId);
  if (current) {
    return false;
  }
  await deleteProjectByLeadId(leadId);
  return true;
}

export async function updateCrmLead(leadId: string, updates: Partial<CrmLead>): Promise<CrmLead | null> {
  const current = await getCrmLeads();
  const existing = current.find((lead) => lead.id.toLowerCase() === leadId.toLowerCase());
  if (!existing) {
    return null;
  }

  const nextLead: CrmLead = normalizeLead({
    ...existing,
    ...updates,
    customer: updates.customer?.trim() || existing.customer,
    company: updates.company?.trim() || existing.company,
    phone: updates.phone?.trim() || existing.phone,
    email: updates.email?.trim() || existing.email,
    address: updates.address?.trim() || existing.address,
    problem: updates.problem?.trim() ?? existing.problem,
    projectAddress: updates.projectAddress?.trim() || updates.address?.trim() || existing.projectAddress || existing.address,
    clientCharacterNote: updates.clientCharacterNote?.trim() ?? existing.clientCharacterNote,
    note: updates.note?.trim() ?? existing.note,
    owner: updates.owner?.trim() || existing.owner,
    value: updates.value?.trim() || existing.value,
    nextAction: updates.nextAction?.trim() || existing.nextAction,
    workLog: updates.workLog ? normalizeWorkLog(updates.workLog, existing.workLog) : existing.workLog,
    estimatorData: updates.estimatorData ? normalizeCrmEstimatorData(updates.estimatorData, existing.estimatorData) : existing.estimatorData,
    attachments: updates.attachments || existing.attachments,
    updatedAt: new Date().toLocaleString('en-GB', {hour12: false}),
    updatedAtUtc: nowIso(),
    assignedSalesUserId: existing.assignedSalesUserId || null,
  });

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const {data, error} = await supabase
    .from('crm_leads')
    .update({
      customer: nextLead.customer,
      company: nextLead.company,
      phone: nextLead.phone,
      email: nextLead.email,
      address: nextLead.address,
      problem: nextLead.problem,
      project_address: nextLead.projectAddress,
      client_character_note: nextLead.clientCharacterNote,
      status: nextLead.status,
      progress: nextLead.progress,
      activity_update: nextLead.activityUpdate,
      deal_progress: nextLead.dealProgress,
      note: nextLead.note,
      owner: nextLead.owner,
      value: Number(String(nextLead.value).replace(/[^0-9.-]/g, '')) || 0,
      updated_at: nextLead.updatedAt,
      next_action: nextLead.nextAction,
      attachments_json: nextLead.attachments,
      estimator_data_json: nextLead.estimatorData,
    })
    .or(`external_id.eq.${leadId},id.eq.${leadId}`)
    .select('id,external_id,customer,company,phone,email,address,problem,project_address,client_character_note,status,progress,activity_update,deal_progress,note,owner,value,updated_at,next_action,attachments_json,work_log_json,estimator_data_json,assigned_sales_user_id,assigned_by_user_id,assigned_at')
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const updatedLead = rowToLead(data as LeadRow);
  await upsertProjectFromLead(updatedLead);
  return updatedLead;
}
