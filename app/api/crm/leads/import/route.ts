import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {checkRateLimit, RATE_LIMITS} from '@/lib/rateLimit';
import {canPerform} from '@/lib/permissions';
import {parseCsv} from '@/lib/csv';
import {getDb, nowIso} from '@/lib/crmDb';
import {upsertProjectFromLead} from '@/lib/crmProjectsStore';
import {CrmLead} from '@/lib/crmMockData';

function normalizeText(value: unknown) {
  return String(value || '').trim();
}

function normalizeHeaderKey(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function getRowValue(row: Record<string, string>, ...keys: string[]) {
  for (const key of keys) {
    const normalized = normalizeHeaderKey(key);
    const direct = row[key];
    if (direct !== undefined && String(direct).trim()) {
      return String(direct).trim();
    }

    for (const [rowKey, rowValue] of Object.entries(row)) {
      if (normalizeHeaderKey(rowKey) === normalized && String(rowValue || '').trim()) {
        return String(rowValue).trim();
      }
    }
  }

  return '';
}

function parseJsonArray<T>(value: string, fallback: T[]) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function rowToLead(row: Record<string, string>, fallbackId: string): CrmLead {
  return {
    id: getRowValue(row, 'id', 'lead id', 'lead_id') || fallbackId,
    assignedSalesUserId: getRowValue(row, 'assignedSalesUserId', 'assigned sales user id', 'assigned_sales_user_id') || null,
    customer: getRowValue(row, 'customer', 'customer name', 'client', 'lead') ,
    company: getRowValue(row, 'company', 'company name', 'business', 'organization'),
    phone: getRowValue(row, 'phone', 'phone number', 'mobile'),
    email: getRowValue(row, 'email', 'e-mail', 'mail'),
    address: getRowValue(row, 'address', 'project address', 'project_address'),
    problem: getRowValue(row, 'problem', 'issue', 'description'),
    projectAddress: getRowValue(row, 'projectAddress', 'project address', 'project_address', 'address'),
    clientCharacterNote: getRowValue(row, 'clientCharacterNote', 'client character note', 'client_character_note'),
    status: getRowValue(row, 'status') || 'NEW',
    progress: getRowValue(row, 'progress') || 'new',
    activityUpdate: getRowValue(row, 'activityUpdate', 'activity update', 'activity_update'),
    dealProgress: getRowValue(row, 'dealProgress', 'deal progress', 'deal_progress') || 'Negotiation',
    note: getRowValue(row, 'note', 'notes'),
    owner: getRowValue(row, 'owner', 'sales owner', 'assigned to'),
    value: getRowValue(row, 'value', 'deal value', 'amount', 'price'),
    updatedAt: getRowValue(row, 'updatedAt', 'updated at', 'updated_at') || 'Imported',
    nextAction: getRowValue(row, 'nextAction', 'next action', 'next_action'),
    attachments: parseJsonArray<string>(getRowValue(row, 'attachments'), []),
    workLog: parseJsonArray<CrmLead['workLog'][number]>(getRowValue(row, 'workLog', 'work log', 'work_log'), []),
    estimatorData: parseJsonArray<CrmLead['estimatorData'][number]>(getRowValue(row, 'estimatorData', 'estimator data', 'estimator_data'), []),
  };
}

function leadToSqlParams(lead: CrmLead, now: string) {
  return {
    id: lead.id,
    customer: lead.customer,
    company: lead.company,
    phone: lead.phone,
    email: lead.email,
    address: lead.address,
    problem: lead.problem,
    projectAddress: lead.projectAddress,
    clientCharacterNote: lead.clientCharacterNote,
    status: lead.status,
    progress: lead.progress,
    activityUpdate: lead.activityUpdate,
    dealProgress: lead.dealProgress,
    note: lead.note,
    owner: lead.owner,
    value: lead.value,
    updatedAt: lead.updatedAt,
    nextAction: lead.nextAction,
    attachmentsJson: JSON.stringify(lead.attachments),
    workLogJson: JSON.stringify(lead.workLog),
    estimatorDataJson: JSON.stringify(lead.estimatorData),
    assignedSalesUserId: lead.assignedSalesUserId || null,
    assignedBy: '',
    assignedAt: '',
    createdAt: now,
    updatedAtUtc: now,
  };
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (!canPerform(session.role, 'createLeads')) {
    return NextResponse.json({ok: false, error: 'Only superadmin can import leads'}, {status: 403});
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limiter = await checkRateLimit(`crm-lead-import:${session.sid}:${ip}`, RATE_LIMITS.API_MUTATION);
  if (!limiter.allowed) {
    return NextResponse.json({ok: false, error: 'Too many requests'}, {status: 429});
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ok: false, error: 'CSV file is required'}, {status: 400});
  }

  const csvText = await file.text();
  const rows = parseCsv(csvText);
  if (rows.length === 0) {
    return NextResponse.json({ok: false, error: 'CSV file is empty'}, {status: 400});
  }

  const db = getDb();
  const now = nowIso();
  const statements = db.prepare(`
    INSERT INTO leads (
      id, customer, company, phone, email, address, problem, project_address, client_character_note,
      status, progress, activity_update, deal_progress, note, owner, value, updated_at, next_action,
      attachments_json, work_log_json, estimator_data_json, assigned_sales_user_id, assigned_by,
      assigned_at, created_at, updated_at_utc
    ) VALUES (
      @id, @customer, @company, @phone, @email, @address, @problem, @projectAddress, @clientCharacterNote,
      @status, @progress, @activityUpdate, @dealProgress, @note, @owner, @value, @updatedAt, @nextAction,
      @attachmentsJson, @workLogJson, @estimatorDataJson, @assignedSalesUserId, @assignedBy,
      @assignedAt, @createdAt, @updatedAtUtc
    )
    ON CONFLICT(id) DO UPDATE SET
      customer = excluded.customer,
      company = excluded.company,
      phone = excluded.phone,
      email = excluded.email,
      address = excluded.address,
      problem = excluded.problem,
      project_address = excluded.project_address,
      client_character_note = excluded.client_character_note,
      status = excluded.status,
      progress = excluded.progress,
      activity_update = excluded.activity_update,
      deal_progress = excluded.deal_progress,
      note = excluded.note,
      owner = excluded.owner,
      value = excluded.value,
      updated_at = excluded.updated_at,
      next_action = excluded.next_action,
      attachments_json = excluded.attachments_json,
      work_log_json = excluded.work_log_json,
      estimator_data_json = excluded.estimator_data_json,
      assigned_sales_user_id = excluded.assigned_sales_user_id,
      assigned_by = excluded.assigned_by,
      assigned_at = excluded.assigned_at,
      updated_at_utc = excluded.updated_at_utc
  `);

  const inserted: string[] = [];
  const updated: string[] = [];
  const skipped: string[] = [];

  const runImport = db.transaction(() => {
    for (const [index, row] of rows.entries()) {
      const fallbackId = `L-${100000 + index}`;
      const lead = rowToLead(row, fallbackId);

      if (!lead.customer || !lead.company || !lead.phone || !lead.email || !lead.address || !lead.owner || !lead.value || !lead.nextAction) {
        skipped.push(lead.id || fallbackId);
        continue;
      }

      const existing = db.prepare('SELECT id FROM leads WHERE id = ? LIMIT 1').get(lead.id) as {id: string} | undefined;
      statements.run(leadToSqlParams(lead, now));
      if (existing) {
        updated.push(lead.id);
      } else {
        inserted.push(lead.id);
      }

      void upsertProjectFromLead(lead);
    }
  });

  runImport();

  return NextResponse.json({
    ok: true,
    insertedCount: inserted.length,
    updatedCount: updated.length,
    skippedCount: skipped.length,
    processedCount: inserted.length + updated.length,
    inserted,
    updated,
    skipped,
  });
}
