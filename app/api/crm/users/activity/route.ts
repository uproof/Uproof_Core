import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {getRecentCrmUserActivity} from '@/lib/crmUserActivityStore';
import {canPerform} from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (!canPerform(session.role, 'viewAllActivity')) {
    return NextResponse.json({ok: false, error: 'Only superadmin can view CRM activity'}, {status: 403});
  }

  const activity = await getRecentCrmUserActivity(200);
  const userEmail = req.nextUrl.searchParams.get('email')?.trim().toLowerCase();
  const filteredActivity = userEmail
    ? activity.filter((entry) => entry.actorEmail.toLowerCase() === userEmail)
    : activity;

  return NextResponse.json({ok: true, activity: filteredActivity});
}
