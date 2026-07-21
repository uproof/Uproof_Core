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
import {z} from 'zod';

const importLeadRowSchema = z.object({
  customer: z.string().trim().min(1, 'Customer name is required'),
  company: z.string().trim().min(1, 'Company name is required'),
  phone: z.string().trim().min(1, 'Phone number is required'),
  email: z.string().trim().email('Invalid email address'),
  address: z.string().trim().min(1, 'Address is required'),
});

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

function parseMoneyValue(value: string) {
  const numeric = Number(String(value || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : 0;
}

function rowToLead(row: Record<string, string>, fallbackId: string): CrmLead {
  return {
    id: getRowValue(row, 'id', 'lead id', 'lead_id') || fallbackId,
    assignedSalesUserId: getRowValue(row, 'assignedSalesUserId', 'assigned sales user id', 'assigned_sales_user_id') || null,
    customer: getRowValue(row, 'customer', 'customer name', 'client', 'lead', 'name', 'full name'),
    company: getRowValue(row, 'company', 'company name', 'business', 'organization', 'organization name'),
    phone: getRowValue(row, 'phone', 'phone number', 'mobile', 'telephone', 'tel'),
    email: getRowValue(row, 'email', 'e-mail', 'mail', 'email address'),
    address: getRowValue(row, 'address', 'project address', 'project_address', 'street', 'site address'),
    problem: getRowValue(row, 'problem', 'issue', 'description'),
    projectAddress: getRowValue(row, 'projectAddress', 'project address', 'project_address', 'address'),
    clientCharacterNote: getRowValue(row, 'clientCharacterNote', 'client character note', 'client_character_note'),
    status: getRowValue(row, 'status') || 'NEW',
    progress: getRowValue(row, 'progress') || 'new',
    activityUpdate: getRowValue(row, 'activityUpdate', 'activity update', 'activity_update'),
    dealProgress: getRowValue(row, 'dealProgress', 'deal progress', 'deal_progress') || 'Negotiation',
    note: getRowValue(row, 'note', 'notes'),
    owner: getRowValue(row, 'owner', 'sales owner', 'assigned to', 'responsible', 'sales rep'),
    value: getRowValue(row, 'value', 'deal value', 'amount', 'price', 'lead value'),
    updatedAt: getRowValue(row, 'updatedAt', 'updated at', 'updated_at') || 'Imported',
    nextAction: getRowValue(row, 'nextAction', 'next action', 'next_action', 'next step', 'follow up', 'follow-up'),
    attachments: parseJsonArray<string>(getRowValue(row, 'attachments'), []),
    workLog: parseJsonArray<CrmLead['workLog'][number]>(getRowValue(row, 'workLog', 'work log', 'work_log'), []),
    estimatorData: normalizeCrmEstimatorData(parseJsonArray(getRowValue(row, 'estimatorData', 'estimator data', 'estimator_data'), []), createEmptyCrmEstimatorData()),
  };
}

export async function POST(req: NextRequest) {
  try {
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
    const skipped: Array<{id: string; reason: string}> = [];

    for (const [index, row] of rows.entries()) {
      const fallbackId = `L-${100000 + index}`;
      const lead = rowToLead(row, fallbackId);
      
      const validation = importLeadRowSchema.safeParse(lead);
      if (!validation.success) {
        skipped.push({id: lead.id || fallbackId, reason: validation.error.issues[0]?.message || 'Invalid row data'});
        continue;
      }

      const updatedAt = lead.updatedAt && lead.updatedAt !== 'Imported' ? lead.updatedAt : nowIso();
      const normalizedOwner = lead.owner || session.email || 'Unassigned';
      const normalizedValue = lead.value || '0';
      const normalizedNextAction = lead.nextAction || 'Follow up';

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
        owner: normalizedOwner,
        value: parseMoneyValue(normalizedValue),
        updated_at: updatedAt,
        next_action: normalizedNextAction,
        attachments_json: JSON.stringify(lead.attachments),
        estimator_data_json: stringifyEstimatorData(lead.estimatorData),
        assigned_sales_user_id: null,
        assigned_by_user_id: null,
        assigned_at: null,
      }, {onConflict: 'external_id'});

      if (error) {
        skipped.push({id: lead.id, reason: error.message || 'Database error'});
        continue;
      }

      await upsertProjectFromLead(lead);
      imported.push(lead.id);
    }

    return NextResponse.json({
      ok: true,
      importedCount: imported.length,
      updatedCount: 0,
      skippedCount: skipped.length,
      processedCount: rows.length,
      imported,
      skipped,
    });
  } catch (error: any) {
    return NextResponse.json({ok: false, error: error?.message || 'Failed to import leads'}, {status: 500});
  }
}
