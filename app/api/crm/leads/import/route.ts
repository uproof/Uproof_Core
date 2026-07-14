import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {checkRateLimit, RATE_LIMITS} from '@/lib/rateLimit';
import {canPerform} from '@/lib/permissions';
import {parseCsv} from '@/lib/csv';
import {nowIso} from '@/lib/crmDb';
import {upsertProjectFromLead} from '@/lib/crmProjectsStore';
import {CrmLead} from '@/lib/crmMockData';
import {createSupabaseAdminClient} from '@/lib/supabase/server';
import {createEmptyCrmEstimatorData, normalizeCrmEstimatorData, stringifyEstimatorData} from '@/lib/crmEstimator';

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
    estimatorData: normalizeCrmEstimatorData(parseJsonArray(getRowValue(row, 'estimatorData', 'estimator data', 'estimator_data'), []), createEmptyCrmEstimatorData()),
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

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ok: false, error: 'CSV file is too large'}, {status: 413});
  }

  const fileName = file.name.toLowerCase();
  const allowedTypes = new Set(['', 'text/csv', 'application/csv', 'text/plain', 'application/vnd.ms-excel']);
  if (!fileName.endsWith('.csv')) {
    return NextResponse.json({ok: false, error: 'CSV file extension is required'}, {status: 400});
  }

  if (file.type && !allowedTypes.has(file.type.toLowerCase())) {
    return NextResponse.json({ok: false, error: 'Unsupported file type'}, {status: 400});
  }

  const csvText = await file.text();
  const rows = parseCsv(csvText);
  if (rows.length === 0) {
    return NextResponse.json({ok: false, error: 'CSV file is empty'}, {status: 400});
  }

  if (rows.length > 5000) {
    return NextResponse.json({ok: false, error: 'CSV file has too many rows'}, {status: 413});
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ok: false, error: 'Supabase is required for lead import'}, {status: 503});
  }

  const imported: string[] = [];
  const skipped: string[] = [];

  for (const [index, row] of rows.entries()) {
    const fallbackId = `L-${100000 + index}`;
    const lead = rowToLead(row, fallbackId);

    if (!lead.customer || !lead.company || !lead.phone || !lead.email || !lead.address || !lead.owner || !lead.value || !lead.nextAction) {
      skipped.push(lead.id || fallbackId);
      continue;
    }

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
      value: lead.value,
      updated_at: lead.updatedAt,
      next_action: lead.nextAction,
      attachments_json: JSON.stringify(lead.attachments),
      work_log_json: JSON.stringify(lead.workLog),
      estimator_data_json: stringifyEstimatorData(lead.estimatorData),
      assigned_sales_user_id: lead.assignedSalesUserId || null,
      assigned_by_user_id: '',
      assigned_at: '',
      created_at: nowIso(),
      updated_at_utc: nowIso(),
    }, {onConflict: 'external_id'});

    if (error) {
      skipped.push(lead.id);
      continue;
    }

    await upsertProjectFromLead(lead);
    imported.push(lead.id);
  }

  return NextResponse.json({
    ok: true,
    importedCount: imported.length,
    skippedCount: skipped.length,
    processedCount: imported.length,
    imported,
    skipped,
  });
}
