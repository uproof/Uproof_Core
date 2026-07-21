import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {getRecentCrmUserActivity} from '@/lib/crmUserActivityStore';
import {canPerform} from '@/lib/permissions';
import {z} from 'zod';

const getActivitySchema = z.object({
  email: z.string().trim().email().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (!canPerform(session.role, 'viewAllActivity')) {
    return NextResponse.json({ok: false, error: 'Only superadmin can view CRM activity'}, {status: 403});
  }

  const query = Object.fromEntries(req.nextUrl.searchParams.entries());
  const validation = getActivitySchema.safeParse(query);
  const userEmail = validation.success ? validation.data.email : undefined;

  const activity = await getRecentCrmUserActivity(200);
  const filteredActivity = userEmail
    ? activity.filter((entry) => entry.actorEmail.toLowerCase() === userEmail)
    : activity;

  return NextResponse.json({ok: true, activity: filteredActivity});
}
