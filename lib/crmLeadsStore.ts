import {getDb, nowIso} from '@/lib/crmDb';
import {upsertProjectFromLead, deleteProjectByLeadId} from '@/lib/crmProjectsStore';
import {CrmLead} from '@/lib/crmMockData';

function normalizeEstimatorData(estimatorData: unknown, fallback: CrmLead['estimatorData']) {
  if (!Array.isArray(estimatorData)) return fallback;
  return estimatorData
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const candidate = row as Partial<{label: string; measurement: string; notes: string}>;
      return {
        label: String(candidate.label || '').trim(),
        measurement: String(candidate.measurement || '').trim(),
        notes: String(candidate.notes || '').trim(),
      };
    })
    .filter((row): row is CrmLead['estimatorData'][number] => Boolean(row && (row.label || row.measurement || row.notes)));
}

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
    estimatorData: normalizeEstimatorData(lead.estimatorData, []),
  };
}

type LeadRow = {
  id: string;
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
  work_log_json: string;
  estimator_data_json: string;
  assigned_sales_user_id: string | null;
  assigned_by: string;
  assigned_at: string;
  updated_at_utc: string;
};

function rowToLead(row: LeadRow): CrmLead {
  return normalizeLead({
    id: row.id,
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
    value: row.value,
    updatedAt: row.updated_at,
    updatedAtUtc: row.updated_at_utc,
    nextAction: row.next_action,
    assignedSalesUserId: row.assigned_sales_user_id,
    attachments: JSON.parse(row.attachments_json || '[]'),
    workLog: JSON.parse(row.work_log_json || '[]'),
    estimatorData: JSON.parse(row.estimator_data_json || '[]'),
  });
}

type GetCrmLeadsOptions = {
  assignedSalesUserId?: string;
};

export async function getCrmLeads(options: GetCrmLeadsOptions = {}): Promise<CrmLead[]> {
  const db = getDb();
  const assignedSalesUserId = options.assignedSalesUserId?.trim();
  const rows = assignedSalesUserId
    ? db
        .prepare('SELECT * FROM leads WHERE assigned_sales_user_id = ? ORDER BY updated_at_utc DESC, created_at DESC')
        .all(assignedSalesUserId) as LeadRow[]
    : db.prepare('SELECT * FROM leads ORDER BY updated_at_utc DESC, created_at DESC').all() as LeadRow[];

  return rows.map(rowToLead);
}

export async function getCrmLeadById(leadId: string): Promise<CrmLead | null> {
  const db = getDb();
  const row = db.prepare('SELECT * FROM leads WHERE lower(id) = lower(?) LIMIT 1').get(leadId) as LeadRow | undefined;
  if (!row) {
    return null;
  }
  return rowToLead(row);
}

export async function isLeadAssignedToSalesUser(leadId: string, salesUserId: string): Promise<boolean> {
  const db = getDb();
  const row = db
    .prepare('SELECT id FROM leads WHERE lower(id) = lower(?) AND assigned_sales_user_id = ? LIMIT 1')
    .get(leadId, salesUserId) as {id: string} | undefined;
  return !!row;
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
  const db = getDb();
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
    updatedAt: 'Just now',
    updatedAtUtc: now,
    nextAction: input.nextAction.trim(),
    attachments: [],
    workLog: normalizeWorkLog(input.workLog, []),
    estimatorData: normalizeEstimatorData(input.estimatorData, []),
    assignedSalesUserId: null,
  });

  db.prepare(`
    INSERT INTO leads (
      id, customer, company, phone, email, address, problem, project_address, client_character_note,
      status, progress, activity_update, deal_progress, note, owner, value, updated_at, next_action,
      attachments_json, work_log_json, estimator_data_json, created_at, updated_at_utc
    ) VALUES (
      @id, @customer, @company, @phone, @email, @address, @problem, @projectAddress, @clientCharacterNote,
      @status, @progress, @activityUpdate, @dealProgress, @note, @owner, @value, @updatedAt, @nextAction,
      @attachmentsJson, @workLogJson, @estimatorDataJson, @createdAt, @updatedAtUtc
    )
  `).run({
    ...lead,
    projectAddress: lead.projectAddress,
    clientCharacterNote: lead.clientCharacterNote,
    activityUpdate: lead.activityUpdate,
    dealProgress: lead.dealProgress,
    attachmentsJson: JSON.stringify(lead.attachments),
    workLogJson: JSON.stringify(lead.workLog),
    estimatorDataJson: JSON.stringify(lead.estimatorData),
    createdAt: now,
    updatedAtUtc: now,
  });

  await upsertProjectFromLead(lead);
  return lead;
}

export async function deleteCrmLead(leadId: string): Promise<boolean> {
  const db = getDb();
  const result = db.prepare('DELETE FROM leads WHERE id = ?').run(leadId);
  if (result.changes === 0) {
    return false;
  }
  await deleteProjectByLeadId(leadId);
  return true;
}

export async function updateCrmLead(leadId: string, updates: Partial<CrmLead>): Promise<CrmLead | null> {
  const db = getDb();
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
    estimatorData: updates.estimatorData ? normalizeEstimatorData(updates.estimatorData, existing.estimatorData) : existing.estimatorData,
    attachments: updates.attachments || existing.attachments,
    updatedAt: new Date().toLocaleString('en-GB', {hour12: false}),
    updatedAtUtc: nowIso(),
    assignedSalesUserId: existing.assignedSalesUserId || null,
  });

  db.prepare(`
    UPDATE leads SET
      customer = @customer,
      company = @company,
      phone = @phone,
      email = @email,
      address = @address,
      problem = @problem,
      project_address = @projectAddress,
      client_character_note = @clientCharacterNote,
      status = @status,
      progress = @progress,
      activity_update = @activityUpdate,
      deal_progress = @dealProgress,
      note = @note,
      owner = @owner,
      value = @value,
      updated_at = @updatedAt,
      next_action = @nextAction,
      attachments_json = @attachmentsJson,
      work_log_json = @workLogJson,
      estimator_data_json = @estimatorDataJson,
      updated_at_utc = @updatedAtUtc
    WHERE id = @id
  `).run({
    ...nextLead,
    projectAddress: nextLead.projectAddress,
    clientCharacterNote: nextLead.clientCharacterNote,
    activityUpdate: nextLead.activityUpdate,
    dealProgress: nextLead.dealProgress,
    attachmentsJson: JSON.stringify(nextLead.attachments),
    workLogJson: JSON.stringify(nextLead.workLog),
    estimatorDataJson: JSON.stringify(nextLead.estimatorData),
    updatedAtUtc: nowIso(),
  });

  await upsertProjectFromLead(nextLead);
  return nextLead;
}
