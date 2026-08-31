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

let projectsTableAvailable: boolean | null = null;

function getSupabaseErrorText(error: unknown) {
  if (!error || typeof error !== 'object') {
    return '';
  }

  const candidate = error as {
    message?: unknown;
    details?: unknown;
    hint?: unknown;
    code?: unknown;
  };

  return [
    typeof candidate.message === 'string' ? candidate.message : '',
    typeof candidate.details === 'string' ? candidate.details : '',
    typeof candidate.hint === 'string' ? candidate.hint : '',
    typeof candidate.code === 'string' ? candidate.code : '',
  ].filter(Boolean).join(' ');
}

function isProjectsTableMissingError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const text = getSupabaseErrorText(error);
  if (/public\.projects|schema cache|does not exist|pgrst205|relation .*projects/i.test(text)) {
    return true;
  }

  const status = Number((error as {status?: unknown})?.status);
  return Number.isFinite(status) && status === 404;
}

async function isProjectsTableAvailable(supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>): Promise<boolean> {
  if (projectsTableAvailable !== null) {
    return projectsTableAvailable;
  }

  const {error} = await supabase.from('projects').select('lead_id').limit(1);
  if (error) {
    if (isProjectsTableMissingError(error)) {
      projectsTableAvailable = false;
      return false;
    }

    throw new Error(getSupabaseErrorText(error) || 'Failed to check project storage availability');
  }

  projectsTableAvailable = true;
  return true;
}

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

  return leads
    .filter((lead) => String(lead.status || '').trim().toUpperCase() === 'ACCEPTED')
    .map((lead) => ({
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
  const normalizedStatus = String(lead.status || '').trim().toUpperCase();
  if (normalizedStatus !== 'ACCEPTED') {
    return;
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase is required for project storage');
  }

  if (!(await isProjectsTableAvailable(supabase))) {
    return;
  }

  const now = nowIso();
  const payload = {
    id: lead.id,
    lead_id: lead.id,
    title: lead.projectAddress || lead.address || lead.customer,
    location: lead.projectAddress || lead.address || lead.customer,
    owner: lead.owner,
    phase: String(lead.status || 'NEW').replaceAll('_', ' '),
    budget: lead.value,
    due_date: lead.nextAction,
    estimator_data_json: stringifyEstimatorData(normalizeCrmEstimatorData(lead.estimatorData, createEmptyCrmEstimatorData())),
    created_at: now,
    updated_at_utc: now,
  };

  const {error} = await supabase.from('projects').upsert(payload, {onConflict: 'lead_id'});
  if (error) {
    if (isProjectsTableMissingError(error)) {
      projectsTableAvailable = false;
      return;
    }
    throw new Error(getSupabaseErrorText(error) || 'Failed to upsert project');
  }
}

export async function deleteProjectByLeadId(leadId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase is required for project storage');
  }

  if (!(await isProjectsTableAvailable(supabase))) {
    return;
  }

  const {error} = await supabase.from('projects').delete().eq('lead_id', leadId);
  if (error) {
    if (isProjectsTableMissingError(error)) {
      projectsTableAvailable = false;
      return;
    }
    throw new Error(getSupabaseErrorText(error) || 'Failed to delete project');
  }
}
