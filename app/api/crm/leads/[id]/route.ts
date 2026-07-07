import {NextRequest, NextResponse} from 'next/server';
import {deleteCrmLead, isLeadAssignedToSalesUser, updateCrmLead} from '@/lib/crmLeadsStore';
import {getAdminSession} from '@/lib/adminAuth';
import {logCrmAudit} from '@/lib/crmAudit';
import {logCrmUserActivity} from '@/lib/crmUserActivityStore';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {canPerform} from '@/lib/permissions';

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
  const deleted = await deleteCrmLead(id);
  if (!deleted) {
    return NextResponse.json({ok: false, error: 'Lead not found'}, {status: 404});
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  await logCrmAudit({
    action: 'lead_delete',
    userEmail: session.email,
    role: session.role,
    sessionId: session.sid,
    ip,
    resource: `lead:${id}`,
    detail: 'lead_deleted_manual',
  });

  await logCrmUserActivity({
    actorEmail: session.email,
    actorRole: session.role,
    action: 'lead_delete',
    leadId: id,
    detail: 'lead_deleted_manual',
    ip,
  });

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

  const updated = await updateCrmLead(id, {
    customer: canEditProfileFields && typeof body.customer === 'string' ? body.customer : undefined,
    address: canEditProfileFields && typeof body.address === 'string' ? body.address : undefined,
    problem: typeof body.problem === 'string' ? body.problem : undefined,
    projectAddress: typeof body.projectAddress === 'string' ? body.projectAddress : undefined,
    clientCharacterNote: typeof body.clientCharacterNote === 'string' ? body.clientCharacterNote : undefined,
    note: typeof body.note === 'string' ? body.note : undefined,
    status: typeof body.status === 'string' ? body.status : undefined,
    progress: typeof body.progress === 'string' ? body.progress : undefined,
    activityUpdate: typeof body.activityUpdate === 'string' ? body.activityUpdate : undefined,
    dealProgress: typeof body.dealProgress === 'string' ? body.dealProgress : undefined,
    owner: canEditProfileFields && typeof body.owner === 'string' ? body.owner : undefined,
    value: canEditProfileFields && typeof body.value === 'string' ? body.value : undefined,
    nextAction: typeof body.nextAction === 'string' ? body.nextAction : undefined,
    workLog: canEditProfileFields && Array.isArray(body.workLog) ? body.workLog as never : undefined,
    estimatorData: canEditProfileFields && Array.isArray(body.estimatorData) ? body.estimatorData as never : undefined,
  });

  if (!updated) {
    return NextResponse.json({ok: false, error: 'Lead not found'}, {status: 404});
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  await logCrmAudit({
    action: 'lead_update',
    userEmail: session.email,
    role: session.role,
    sessionId: session.sid,
    ip,
    resource: `lead:${id}`,
    detail: 'lead_updated_manual',
  });

  await logCrmUserActivity({
    actorEmail: session.email,
    actorRole: session.role,
    action: 'lead_update',
    leadId: id,
    detail: 'lead_updated_manual',
    ip,
  });

  return NextResponse.json({ok: true, lead: updated});
}
