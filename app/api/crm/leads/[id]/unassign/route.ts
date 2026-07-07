import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {unassignLeadFromCrmUser} from '@/lib/crmUsersStore';
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

  if (!canPerform(session.role, 'unassignLeads')) {
    return NextResponse.json({ok: false, error: 'Only superadmin can unassign leads'}, {status: 403});
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limiter = await checkRateLimit(`crm-unassign:${session.sid}:${ip}`, RATE_LIMITS.API_MUTATION);
  if (!limiter.allowed) {
    return NextResponse.json({ok: false, error: 'Too many requests'}, {status: 429});
  }

  const {id} = await params;
  const result = await unassignLeadFromCrmUser({
    leadId: id,
    unassignedBy: session.email,
  });

  if (!result.unassigned) {
    return NextResponse.json({ok: false, error: 'Lead not found'}, {status: 404});
  }

  if (!result.duplicate) {
    await logCrmUserActivity({
      actorEmail: session.email,
      actorRole: session.role,
      action: 'lead_unassign',
      leadId: id,
      detail: 'unassigned_from_sales_user',
      ip,
    });
  }

  return NextResponse.json({ok: true, duplicate: result.duplicate});
}