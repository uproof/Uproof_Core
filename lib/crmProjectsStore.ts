import {getDb, nowIso} from '@/lib/crmDb';
import {getCrmLeads} from '@/lib/crmLeadsStore';
import type {CrmEstimatorRow, CrmLead} from '@/lib/crmMockData';

export type CrmProjectRecord = {
  id: string;
  leadId: string;
  title: string;
  location: string;
  owner: string;
  phase: string;
  budget: string;
  dueDate: string;
  estimatorData: CrmEstimatorRow[];
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
};

function parseEstimatorData(value: string | null | undefined): CrmEstimatorRow[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as CrmEstimatorRow[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((row) => row && typeof row === 'object');
  } catch {
    return [];
  }
}

function mapRow(row: ProjectRow): CrmProjectRecord {
  return {
    id: row.id,
    leadId: row.lead_id,
    title: row.title,
    location: row.location,
    owner: row.owner,
    phase: row.phase,
    budget: row.budget,
    dueDate: row.due_date,
    estimatorData: parseEstimatorData(row.estimator_data_json),
  };
}

export async function getCrmProjects(options: CrmProjectsOptions = {}): Promise<CrmProjectRecord[]> {
  const leads = await getCrmLeads(options.assignedSalesUserId ? {assignedSalesUserId: options.assignedSalesUserId} : {});
  return leads.map((lead) => ({
    id: lead.id,
    leadId: lead.id,
    title: lead.projectAddress || lead.address || lead.customer,
    location: lead.projectAddress || lead.address || lead.customer,
    owner: lead.owner,
    phase: lead.status.replaceAll('_', ' '),
    budget: lead.value,
    dueDate: lead.nextAction,
    estimatorData: lead.estimatorData,
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
    estimatorDataJson: JSON.stringify(lead.estimatorData),
    createdAt: now,
    updatedAtUtc: now,
  });
}

export async function deleteProjectByLeadId(leadId: string): Promise<void> {
  const db = getDb();
  db.prepare('DELETE FROM projects WHERE lead_id = ?').run(leadId);
}
