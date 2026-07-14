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

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const canEditProfileFields = session.role === 'superadmin';
  const currentLeadRow = await findCrmLeadRowById(id);

  if (!currentLeadRow) {
    return NextResponse.json({ok: false, error: 'Lead not found'}, {status: 404});
  }

  if (typeof body.updatedAtUtc !== 'string' || !body.updatedAtUtc.trim()) {
    return NextResponse.json({ok: false, error: 'Missing updatedAtUtc version'}, {status: 400});
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
    customer: canEditProfileFields && typeof body.customer === 'string' ? String(body.customer) : currentLead.customer,
    address: canEditProfileFields && typeof body.address === 'string' ? String(body.address) : currentLead.address,
    problem: typeof body.problem === 'string' ? String(body.problem) : currentLead.problem,
    projectAddress: typeof body.projectAddress === 'string' ? String(body.projectAddress) : currentLead.projectAddress || currentLead.address,
    clientCharacterNote: typeof body.clientCharacterNote === 'string' ? String(body.clientCharacterNote) : currentLead.clientCharacterNote,
    note: typeof body.note === 'string' ? String(body.note) : currentLead.note,
    status: typeof body.status === 'string' ? String(body.status) : currentLead.status,
    progress: typeof body.progress === 'string' ? String(body.progress) : currentLead.progress,
    activityUpdate: typeof body.activityUpdate === 'string' ? String(body.activityUpdate) : currentLead.activityUpdate,
    dealProgress: typeof body.dealProgress === 'string' ? String(body.dealProgress) : currentLead.dealProgress,
    owner: canEditProfileFields && typeof body.owner === 'string' ? String(body.owner) : currentLead.owner,
    value: canEditProfileFields && typeof body.value === 'string' ? String(body.value) : currentLead.value,
    nextAction: typeof body.nextAction === 'string' ? String(body.nextAction) : currentLead.nextAction,
    workLog: canEditProfileFields && Array.isArray(body.workLog) ? body.workLog as never : currentLead.workLog,
    estimatorData: canEditProfileFields && body.estimatorData && typeof body.estimatorData === 'object'
      ? normalizeCrmEstimatorData(body.estimatorData as never, createEmptyCrmEstimatorData())
      : currentLead.estimatorData,
    updatedAt,
    updatedAtUtc: updatedAt,
  };

  const {error} = await supabase
    .from('crm_leads')
    .update({
      customer: updatedLead.customer,
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
    return NextResponse.json({ok: false, error: error.message || 'Failed to save lead'}, {status: 500});
  }

  await upsertProjectFromLead(updatedLead);

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
