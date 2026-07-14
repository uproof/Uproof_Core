import {getApprovedSuperadminCredentials} from '@/lib/adminAuth';
import {getDb, nowIso} from '@/lib/crmDb';
import {createCrmSupabaseClient as createSupabaseAdminClient} from '@/lib/crmStorage';
import type {CrmLead} from '@/lib/crmMockData';
import {createEmptyCrmEstimatorData, normalizeCrmEstimatorData, stringifyEstimatorData} from '@/lib/crmEstimator';

type SqliteDatabase = {
  prepare: (sql: string) => {
    all: (...args: unknown[]) => unknown[];
    get: (...args: unknown[]) => unknown;
    run: (...args: unknown[]) => {changes: number};
  };
};

declare namespace Database {
  export type Database = SqliteDatabase;
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
  updated_at_utc: string;
  next_action: string;
  attachments_json: string;
  work_log_json: string;
  estimator_data_json: string;
  assigned_sales_user_id: string | null;
  assigned_by: string;
  assigned_at: string;
};

type AuditLogInput = {
  requestId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  detail: string;
  success: boolean;
};

type NotificationInput = {
  recipientEmail: string;
  title: string;
  message: string;
  link: string;
};

type EventInput = {
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
};

type VersionInput = {
  expectedUpdatedAtUtc?: string;
};

function parseJsonArray<T>(value: string, fallback: T[]): T[] {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function mapLead(row: LeadRow): CrmLead {
  let estimatorData = createEmptyCrmEstimatorData();
  try {
    estimatorData = normalizeCrmEstimatorData(JSON.parse(row.estimator_data_json || 'null'), estimatorData);
  } catch {
    estimatorData = createEmptyCrmEstimatorData();
  }

  return {
    id: row.id,
    assignedSalesUserId: row.assigned_sales_user_id,
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
    attachments: parseJsonArray<string>(row.attachments_json, []),
    workLog: parseJsonArray(row.work_log_json, []),
    estimatorData,
  };
}

export function getLeadRowById(db: Database.Database, leadId: string): LeadRow | null {
  const row = db.prepare('SELECT * FROM leads WHERE lower(id) = lower(?) LIMIT 1').get(leadId) as LeadRow | undefined;
  return row || null;
}

export function getLeadById(leadId: string): CrmLead | null {
  const db = getDb();
  const row = getLeadRowById(db, leadId);
  return row ? mapLead(row) : null;
}

export function insertUserActivity(db: Database.Database, input: {
  actorEmail: string;
  actorRole: string;
  action: string;
  leadId: string;
  detail: string;
  ip: string;
}) {
  const createdAt = nowIso();
  db.prepare(`
    INSERT INTO crm_user_activity (
      actor_email, actor_role, action, lead_id, detail, ip, created_at
    ) VALUES (
      @actorEmail, @actorRole, @action, @leadId, @detail, @ip, @createdAt
    )
  `).run({
    ...input,
    createdAt,
  });

  if (input.action.startsWith('lead_')) {
    const notification = buildActivityNotification(input.action, input.leadId, input.actorEmail, input.detail);
    if (notification) {
      const recipients = getApprovedSuperadminCredentials().map((entry) => entry.email).filter(Boolean);
      const supabase = createSupabaseAdminClient();
      if (recipients.length > 0) {
        for (const recipientEmail of recipients) {
          if (supabase) {
            void supabase.from('notifications').insert({
              recipient_email: recipientEmail.trim().toLowerCase(),
              title: notification.title,
              message: notification.message,
              link: notification.link,
              read_at: null,
              archived_at: null,
              created_at: createdAt,
            });
            } else {
              insertNotification(db, {
                recipientEmail,
                ...notification,
              });
            }
        }
      }
    }
  }
}

function buildActivityNotification(action: string, leadId: string, actorEmail: string, detail: string) {
  const normalizedLeadId = leadId.trim();
  const actor = actorEmail.trim();

  switch (action) {
    case 'lead_assign':
      return {
        title: 'Lead assigned',
        message: normalizedLeadId ? `Lead ${normalizedLeadId} was assigned by ${actor}.` : `A lead was assigned by ${actor}.`,
        link: normalizedLeadId ? `/admin/crm/leads/${normalizedLeadId.toLowerCase()}` : '/admin/crm/leads',
      };
    case 'lead_unassign':
      return {
        title: 'Lead unassigned',
        message: normalizedLeadId ? `Lead ${normalizedLeadId} was unassigned by ${actor}.` : `A lead was unassigned by ${actor}.`,
        link: normalizedLeadId ? `/admin/crm/leads/${normalizedLeadId.toLowerCase()}` : '/admin/crm/leads',
      };
    case 'lead_delete':
      return {
        title: 'Lead deleted',
        message: normalizedLeadId ? `Lead ${normalizedLeadId} was deleted by ${actor}.` : `A lead was deleted by ${actor}.`,
        link: '/admin/crm/leads',
      };
    case 'lead_update':
      return {
        title: 'Lead saved',
        message: normalizedLeadId ? `Lead ${normalizedLeadId} was saved by ${actor}.` : `A lead was saved by ${actor}.`,
        link: normalizedLeadId ? `/admin/crm/leads/${normalizedLeadId.toLowerCase()}` : '/admin/crm/leads',
      };
    case 'lead_create':
      return {
        title: 'New lead created',
        message: normalizedLeadId ? `Lead ${normalizedLeadId} was created by ${actor}.` : `A new lead was created by ${actor}.`,
        link: normalizedLeadId ? `/admin/crm/leads/${normalizedLeadId.toLowerCase()}` : '/admin/crm/leads',
      };
    default:
      return detail
        ? {
            title: 'CRM activity',
            message: detail,
            link: normalizedLeadId ? `/admin/crm/leads/${normalizedLeadId.toLowerCase()}` : '/admin/crm/leads',
          }
        : null;
  }
}

export function insertAuditLog(db: Database.Database, input: AuditLogInput) {
  db.prepare(`
    INSERT INTO audit_log (
      request_id, actor_email, actor_role, action, entity_type, entity_id, detail, success, created_at
    ) VALUES (
      @requestId, @actorEmail, @actorRole, @action, @entityType, @entityId, @detail, @success, @createdAt
    )
  `).run({
    ...input,
    success: input.success ? 1 : 0,
    createdAt: nowIso(),
  });
}

export function insertNotification(db: Database.Database, input: NotificationInput) {
  db.prepare(`
    INSERT INTO notifications (
      recipient_email, title, message, link, read_at, archived_at, created_at
    ) VALUES (
      @recipientEmail, @title, @message, @link, NULL, NULL, @createdAt
    )
  `).run({
    recipientEmail: input.recipientEmail.trim().toLowerCase(),
    title: input.title,
    message: input.message,
    link: input.link,
    createdAt: nowIso(),
  });
}

export function insertEvent(db: Database.Database, input: EventInput) {
  db.prepare(`
    INSERT INTO crm_events (
      event_type, aggregate_type, aggregate_id, payload_json, created_at
    ) VALUES (
      @eventType, @aggregateType, @aggregateId, @payloadJson, @createdAt
    )
  `).run({
    eventType: input.eventType,
    aggregateType: input.aggregateType,
    aggregateId: input.aggregateId,
    payloadJson: JSON.stringify(input.payload),
    createdAt: nowIso(),
  });
}

export function updateLeadRow(
  db: Database.Database,
  leadId: string,
  updates: Partial<CrmLead>,
  version: VersionInput = {}
) {
  const current = getLeadRowById(db, leadId);
  if (!current) {
    return {found: false as const, conflict: false as const, lead: null};
  }

  if (version.expectedUpdatedAtUtc && current.updated_at_utc !== version.expectedUpdatedAtUtc) {
    return {found: true as const, conflict: true as const, lead: mapLead(current)};
  }

  const next = mapLead(current);
  const merged: CrmLead = {
    ...next,
    ...updates,
    customer: updates.customer?.trim() || next.customer,
    company: updates.company?.trim() || next.company,
    phone: updates.phone?.trim() || next.phone,
    email: updates.email?.trim() || next.email,
    address: updates.address?.trim() || next.address,
    problem: updates.problem?.trim() ?? next.problem,
    projectAddress: updates.projectAddress?.trim() || updates.address?.trim() || next.projectAddress || next.address,
    clientCharacterNote: updates.clientCharacterNote?.trim() ?? next.clientCharacterNote,
    note: updates.note?.trim() ?? next.note,
    owner: updates.owner?.trim() || next.owner,
    value: updates.value?.trim() || next.value,
    nextAction: updates.nextAction?.trim() || next.nextAction,
    workLog: updates.workLog || next.workLog,
    estimatorData: updates.estimatorData ? normalizeCrmEstimatorData(updates.estimatorData, next.estimatorData) : next.estimatorData,
    attachments: updates.attachments || next.attachments,
    assignedSalesUserId: next.assignedSalesUserId || null,
    updatedAt: new Date().toLocaleString('en-GB', {hour12: false}),
    updatedAtUtc: nowIso(),
  };

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
    id: leadId,
    customer: merged.customer,
    company: merged.company,
    phone: merged.phone,
    email: merged.email,
    address: merged.address,
    problem: merged.problem,
    projectAddress: merged.projectAddress,
    clientCharacterNote: merged.clientCharacterNote,
    status: merged.status,
    progress: merged.progress,
    activityUpdate: merged.activityUpdate,
    dealProgress: merged.dealProgress,
    note: merged.note,
    owner: merged.owner,
    value: merged.value,
    updatedAt: merged.updatedAt,
    nextAction: merged.nextAction,
    attachmentsJson: JSON.stringify(merged.attachments),
    workLogJson: JSON.stringify(merged.workLog),
    estimatorDataJson: stringifyEstimatorData(merged.estimatorData),
    updatedAtUtc: merged.updatedAtUtc,
  });

  return {found: true as const, conflict: false as const, lead: merged};
}

export function assignLeadRow(
  db: Database.Database,
  leadId: string,
  salesUserId: string,
  assignedBy: string,
  version: VersionInput = {}
) {
  const current = getLeadRowById(db, leadId);
  if (!current) {
    return {found: false as const, duplicate: false as const, conflict: false as const, lead: null};
  }

  if (version.expectedUpdatedAtUtc && current.updated_at_utc !== version.expectedUpdatedAtUtc) {
    return {found: true as const, duplicate: false as const, conflict: true as const, lead: mapLead(current)};
  }

  if (current.assigned_sales_user_id === salesUserId) {
    return {found: true as const, duplicate: true as const, conflict: false as const, lead: mapLead(current)};
  }

  const updatedAtUtc = nowIso();
  db.prepare(`
    UPDATE leads SET
      assigned_sales_user_id = @assignedSalesUserId,
      assigned_by = @assignedBy,
      assigned_at = @assignedAt,
      updated_at_utc = @updatedAtUtc
    WHERE id = @id
  `).run({
    id: leadId,
    assignedSalesUserId: salesUserId,
    assignedBy,
    assignedAt: updatedAtUtc,
    updatedAtUtc,
  });

  return {found: true as const, duplicate: false as const, conflict: false as const, lead: getLeadById(leadId)};
}

export function unassignLeadRow(
  db: Database.Database,
  leadId: string,
  unassignedBy: string,
  version: VersionInput = {}
) {
  const current = getLeadRowById(db, leadId);
  if (!current) {
    return {found: false as const, duplicate: false as const, conflict: false as const, lead: null};
  }

  if (version.expectedUpdatedAtUtc && current.updated_at_utc !== version.expectedUpdatedAtUtc) {
    return {found: true as const, duplicate: false as const, conflict: true as const, lead: mapLead(current)};
  }

  if (!current.assigned_sales_user_id) {
    return {found: true as const, duplicate: true as const, conflict: false as const, lead: mapLead(current)};
  }

  const updatedAtUtc = nowIso();
  db.prepare(`
    UPDATE leads SET
      assigned_sales_user_id = NULL,
      assigned_by = @assignedBy,
      assigned_at = '',
      updated_at_utc = @updatedAtUtc
    WHERE id = @id
  `).run({
    id: leadId,
    assignedBy: unassignedBy,
    updatedAtUtc,
  });

  return {found: true as const, duplicate: false as const, conflict: false as const, lead: getLeadById(leadId)};
}
