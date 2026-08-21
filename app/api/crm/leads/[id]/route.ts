import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {canPerform} from '@/lib/permissions';
import {createCrmSupabaseClient as createSupabaseAdminClient} from '@/lib/crmStorage';
import {deleteLead} from '@/lib/crmLeadService';
import {findCrmLeadRowById, getCrmLeadById, isLeadAssignedToSalesUser} from '@/lib/crmLeadsStore';
import {logCrmUserActivity} from '@/lib/crmUserActivityStore';
import {upsertProjectFromLead} from '@/lib/crmProjectsStore';
import {createEmptyCrmEstimatorData, normalizeCrmEstimatorData, stringifyEstimatorData} from '@/lib/crmEstimator';
import {mapCrmApiError} from '@/lib/crmApiErrors';
import {z} from 'zod';

const QUOTE_OPTION_TYPES = ['eco', 'optimal', 'lux'] as const;
const CRM_LEAD_STATUSES = ['NEW', 'CONTACTED', 'INSPECTION_SCHEDULED', 'INSPECTION_COMPLETED', 'ESTIMATING', 'QUOTE_SENT', 'WON', 'LOST', 'PROJECT_STARTED', 'COMPLETED', 'CANCELLED'] as const;

function extractQuoteOptions(estimatorData: {legacyRows?: Array<{label?: string; measurement?: string; notes?: string}>}) {
  const legacyRows = Array.isArray(estimatorData?.legacyRows) ? estimatorData.legacyRows : [];

  return QUOTE_OPTION_TYPES.map((optionType) => {
    const row = legacyRows.find((entry) => entry?.label === `quote:${optionType}`);
    let liked = false;
    let quoteFileName = '';
    if (row?.notes) {
      try {
        const parsed = JSON.parse(String(row.notes)) as {liked?: boolean; fileName?: string};
        liked = !!parsed.liked;
        quoteFileName = typeof parsed.fileName === 'string' ? parsed.fileName : '';
      } catch {
        liked = false;
        quoteFileName = '';
      }
    }

    return {
      option_type: optionType,
      amount: String(row?.measurement || ''),
      liked,
      quote_file_name: quoteFileName,
    };
  });
}

const updateLeadSchema = z.object({
  customer: z.string().trim().min(1).optional(),
  title: z.string().trim().optional(),
  address: z.string().trim().min(1).optional(),
  problem: z.string().trim().optional(),
  projectAddress: z.string().trim().optional(),
  clientCharacterNote: z.string().trim().optional(),
  note: z.string().trim().optional(),
  status: z.enum(CRM_LEAD_STATUSES).optional(),
  progress: z.string().trim().optional(),
  activityUpdate: z.string().trim().optional(),
  dealProgress: z.string().trim().optional(),
  owner: z.string().trim().min(1).optional(),
  value: z.string().trim().min(1).optional(),
  nextAction: z.string().trim().optional(),
  updatedAtUtc: z.string().trim().min(1, 'Missing updatedAtUtc version'),
  workLog: z.array(z.any()).optional(),
  estimatorData: z.record(z.string(), z.any()).optional(),
});

export async function DELETE(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (!canPerform(session.role, 'deleteLeads')) {
    return NextResponse.json({ok: false, error: 'Only superadmin can delete leads'}, {status: 403});
  }

  const {id} = await params;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const serviceResult = await deleteLead({
    leadId: id,
    actorEmail: session.email,
    actorRole: session.role,
    sessionId: session.sid,
    ip,
  });

  if (!serviceResult.ok) {
    return NextResponse.json({ok: false, error: serviceResult.error}, {status: serviceResult.status});
  }

  return NextResponse.json({ok: true});
}

export async function PATCH(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (!canPerform(session.role, 'updateAssignedLeads')) {
    return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
  }

  const {id} = await params;

  if (session.role === 'sales') {
    const salesUser = await getCrmUserByEmail(session.email);
    if (!salesUser || !(await isLeadAssignedToSalesUser(id, salesUser.id))) {
      return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
    }
  }

  const json = await req.json().catch(() => ({}));
  const validation = updateLeadSchema.safeParse(json);

  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message || 'Invalid input';
    return NextResponse.json({ok: false, error: firstError}, {status: 400});
  }

  const body = validation.data;
  const canEditProfileFields = session.role === 'superadmin';
  const currentLeadRow = await findCrmLeadRowById(id);

  if (!currentLeadRow) {
    return NextResponse.json({ok: false, error: 'Lead not found'}, {status: 404});
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ok: false, error: 'Supabase is required'}, {status: 503});
  }

  const currentLead = await getCrmLeadById(id);
  if (!currentLead) {
    return NextResponse.json({ok: false, error: 'Lead not found'}, {status: 404});
  }

  const updatedAt = new Date().toISOString();
  const updatedLead = {
    ...currentLead,
    customer: canEditProfileFields && body.customer ? body.customer : currentLead.customer,
    title: body.title ?? currentLead.title ?? '',
    address: canEditProfileFields && body.address ? body.address : currentLead.address,
    problem: body.problem ?? currentLead.problem,
    projectAddress: body.projectAddress || currentLead.projectAddress || currentLead.address,
    clientCharacterNote: body.clientCharacterNote ?? currentLead.clientCharacterNote,
    note: body.note ?? currentLead.note,
    status: body.status ?? currentLead.status,
    progress: body.progress ?? currentLead.progress,
    activityUpdate: body.activityUpdate ?? currentLead.activityUpdate,
    dealProgress: body.dealProgress ?? currentLead.dealProgress,
    owner: canEditProfileFields && body.owner ? body.owner : currentLead.owner,
    value: canEditProfileFields && body.value ? body.value : currentLead.value,
    nextAction: body.nextAction ?? currentLead.nextAction,
    workLog: canEditProfileFields && Array.isArray(body.workLog) ? body.workLog : currentLead.workLog,
    estimatorData: body.estimatorData
      ? normalizeCrmEstimatorData(body.estimatorData as never, createEmptyCrmEstimatorData())
      : currentLead.estimatorData,
    updatedAt,
    updatedAtUtc: updatedAt,
  };

  const {error} = await supabase
    .from('crm_leads')
    .update({
      customer: updatedLead.customer,
      title: updatedLead.title,
      company: updatedLead.company,
      phone: updatedLead.phone,
      email: updatedLead.email,
      address: updatedLead.address,
      problem: updatedLead.problem,
      project_address: updatedLead.projectAddress,
      client_character_note: updatedLead.clientCharacterNote,
      status: updatedLead.status,
      progress: updatedLead.progress,
      activity_update: updatedLead.activityUpdate,
      deal_progress: updatedLead.dealProgress,
      note: updatedLead.note,
      owner: updatedLead.owner,
      value: Number(String(updatedLead.value).replace(/[^0-9.-]/g, '')) || 0,
      updated_at: updatedAt,
      next_action: updatedLead.nextAction,
      attachments_json: JSON.stringify(updatedLead.attachments),
      estimator_data_json: stringifyEstimatorData(updatedLead.estimatorData),
    })
    .eq('id', currentLeadRow.id);

  if (error) {
    const mapped = mapCrmApiError(error, 'Failed to save lead');
    return NextResponse.json({ok: false, error: mapped.message}, {status: mapped.status});
  }

  try {
    const quoteOptions = extractQuoteOptions(updatedLead.estimatorData as {legacyRows?: Array<{label?: string; measurement?: string; notes?: string}>});
    const rows = quoteOptions.map((option) => ({
      lead_id: currentLeadRow.id,
      option_type: option.option_type,
      amount: option.amount,
      liked: option.liked,
      quote_file_name: option.quote_file_name,
    }));

    const quoteOptionsResult = await supabase
      .from('crm_lead_quote_options')
      .upsert(rows, {onConflict: 'lead_id,option_type'});

    if (quoteOptionsResult.error) {
      console.warn('crm lead quote options sync failed', quoteOptionsResult.error);
    }
  } catch (quoteOptionsError) {
    console.warn('crm lead quote options processing failed', quoteOptionsError);
  }

  try {
    await upsertProjectFromLead(updatedLead);
  } catch (projectSyncError) {
    // Project mirroring should not block lead updates in CRM.
    console.warn('crm lead project sync failed', projectSyncError);
  }

  try {
    await logCrmUserActivity({
      actorEmail: session.email,
      actorRole: session.role,
      action: 'lead_update',
      leadId: id,
      detail: 'lead_updated_manual',
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown',
    });
  } catch (activityError) {
    console.warn('Lead activity logging failed:', activityError);
  }

  return NextResponse.json({ok: true, lead: updatedLead});
}
