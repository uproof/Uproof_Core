import {nowIso} from '@/lib/crmDb';
import {getCrmLeads} from '@/lib/crmLeadsStore';
import {createCrmSupabaseClient as createSupabaseAdminClient} from '@/lib/crmStorage';
import type {CrmLead} from '@/lib/crmMockData';
import {createEmptyCrmEstimatorData, normalizeCrmEstimatorData, stringifyEstimatorData, summarizeEstimatorData} from '@/lib/crmEstimator';

export type CrmProjectRecord = {
  id: string;
  leadId: string;
  title: string;
  location: string;
  owner: string;
  phase: string;
  budget: string;
  dueDate: string;
  estimatorData: CrmLead['estimatorData'];
};

type ProjectRow = {
  id: string;
  lead_id: string;
  title: string;
  location: string;
  owner: string;
  phase: string;
  budget: string;
  due_date: string;
  estimator_data_json: string;
};

type CrmProjectsOptions = {
  assignedSalesUserId?: string;
  limit?: number;
};

function mapRow(row: ProjectRow): CrmProjectRecord {
  let estimatorData = createEmptyCrmEstimatorData();
  try {
    estimatorData = normalizeCrmEstimatorData(JSON.parse(row.estimator_data_json || 'null'), estimatorData);
  } catch {
    estimatorData = createEmptyCrmEstimatorData();
  }

  return {
    id: row.id,
    leadId: row.lead_id,
    title: row.title,
    location: row.location,
    owner: row.owner,
    phase: row.phase,
    budget: row.budget,
    dueDate: row.due_date,
    estimatorData,
  };
}

export async function getCrmProjects(options: CrmProjectsOptions = {}): Promise<CrmProjectRecord[]> {
  const leads = await getCrmLeads({
    ...(options.assignedSalesUserId ? {assignedSalesUserId: options.assignedSalesUserId} : {}),
    ...(typeof options.limit === 'number' ? {limit: options.limit} : {}),
  });
  return leads.map((lead) => ({
    id: lead.id,
    leadId: lead.id,
    title: lead.projectAddress || lead.address || lead.customer,
    location: lead.projectAddress || lead.address || lead.customer,
    owner: lead.owner,
    phase: lead.status.replaceAll('_', ' '),
    budget: lead.value,
    dueDate: lead.nextAction,
    estimatorData: normalizeCrmEstimatorData(lead.estimatorData, createEmptyCrmEstimatorData()),
  }));
}

export async function upsertProjectFromLead(lead: CrmLead): Promise<void> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase is required for project storage');
  }

  const now = nowIso();
  const payload = {
    id: lead.id,
    lead_id: lead.id,
    title: lead.projectAddress || lead.address || lead.customer,
    location: lead.projectAddress || lead.address || lead.customer,
    owner: lead.owner,
    phase: lead.status.replaceAll('_', ' '),
    budget: lead.value,
    due_date: lead.nextAction,
    estimator_data_json: stringifyEstimatorData(normalizeCrmEstimatorData(lead.estimatorData, createEmptyCrmEstimatorData())),
    created_at: now,
    updated_at_utc: now,
  };

  const {error} = await supabase.from('projects').upsert(payload, {onConflict: 'lead_id'});
  if (error) {
    const message = error.message || 'Failed to upsert project';
    if (/public\.projects|schema cache|does not exist/i.test(message)) {
      console.warn('Skipping project sync because the projects table is unavailable:', message);
      return;
    }
    throw new Error(message);
  }
}

export async function deleteProjectByLeadId(leadId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase is required for project storage');
  }

  const {error} = await supabase.from('projects').delete().eq('lead_id', leadId);
  if (error) {
    const message = error.message || 'Failed to delete project';
    if (/public\.projects|schema cache|does not exist/i.test(message)) {
      console.warn('Skipping project delete because the projects table is unavailable:', message);
      return;
    }
    throw new Error(message);
  }
}
