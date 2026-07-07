import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {assignLeadToCrmUser} from '@/lib/crmUsersStore';
import {logCrmUserActivity} from '@/lib/crmUserActivityStore';
import {checkRateLimit, RATE_LIMITS} from '@/lib/rateLimit';
import {canPerform} from '@/lib/permissions';

export async function POST(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (!canPerform(session.role, 'assignLeads')) {
    return NextResponse.json({ok: false, error: 'Only superadmin can assign leads'}, {status: 403});
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limiter = await checkRateLimit(`crm-assign:${session.sid}:${ip}`, RATE_LIMITS.API_MUTATION);
  if (!limiter.allowed) {
    return NextResponse.json({ok: false, error: 'Too many requests'}, {status: 429});
  }

  const {id} = await params;
  const body = await req.json().catch(() => ({} as Record<string, string>));
  const salesUserId = String(body.salesUserId || '').trim();

  if (!salesUserId) {
    return NextResponse.json({ok: false, error: 'Missing salesUserId'}, {status: 400});
  }

  const result = await assignLeadToCrmUser({
    leadId: id,
    salesUserId,
    assignedBy: session.email,
  });

  if (!result.assigned) {
    return NextResponse.json({ok: false, error: 'Lead not found'}, {status: 404});
  }

  if (!result.duplicate) {
    await logCrmUserActivity({
      actorEmail: session.email,
      actorRole: session.role,
      action: 'lead_assign',
      leadId: id,
      detail: `assigned_to:${salesUserId}`,
      ip,
    });
  }

  return NextResponse.json({ok: true, duplicate: result.duplicate});
}
