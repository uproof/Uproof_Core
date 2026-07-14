import {getDb, nowIso} from '@/lib/crmDb';
import {getCrmLeads} from '@/lib/crmLeadsStore';
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
  const db = getDb();
  const now = nowIso();

  db.prepare(`
    INSERT INTO projects (
      id, lead_id, title, location, owner, phase, budget, due_date, estimator_data_json, created_at, updated_at_utc
    ) VALUES (
      @id, @leadId, @title, @location, @owner, @phase, @budget, @dueDate, @estimatorDataJson, @createdAt, @updatedAtUtc
    )
    ON CONFLICT(lead_id) DO UPDATE SET
      title = excluded.title,
      location = excluded.location,
      owner = excluded.owner,
      phase = excluded.phase,
      budget = excluded.budget,
      due_date = excluded.due_date,
      estimator_data_json = excluded.estimator_data_json,
      updated_at_utc = excluded.updated_at_utc
  `).run({
    id: lead.id,
    leadId: lead.id,
    title: lead.projectAddress || lead.address || lead.customer,
    location: lead.projectAddress || lead.address || lead.customer,
    owner: lead.owner,
    phase: lead.status.replaceAll('_', ' '),
    budget: lead.value,
    dueDate: lead.nextAction,
    estimatorDataJson: stringifyEstimatorData(normalizeCrmEstimatorData(lead.estimatorData, createEmptyCrmEstimatorData())),
    createdAt: now,
    updatedAtUtc: now,
  });
}

export async function deleteProjectByLeadId(leadId: string): Promise<void> {
  const db = getDb();
  db.prepare('DELETE FROM projects WHERE lead_id = ?').run(leadId);
}
