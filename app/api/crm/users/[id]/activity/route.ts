import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {canPerform} from '@/lib/permissions';
import {getCrmUserById} from '@/lib/crmUsersStore';
import {clearCrmUserActivityByEmail} from '@/lib/crmUserActivityStore';
import {z} from 'zod';

const paramsSchema = z.object({
  id: z.string().trim().min(1),
});

export async function DELETE(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (!canPerform(session.role, 'viewAllActivity')) {
    return NextResponse.json({ok: false, error: 'Only superadmin can clear work logs'}, {status: 403});
  }

  const rawParams = await params;
  const validation = paramsSchema.safeParse(rawParams);
  if (!validation.success) {
    return NextResponse.json({ok: false, error: 'Invalid user ID'}, {status: 400});
  }
  const {id} = validation.data;

  const target = await getCrmUserById(id);
  if (!target) {
    return NextResponse.json({ok: false, error: 'CRM user not found'}, {status: 404});
  }

  const cleared = await clearCrmUserActivityByEmail(target.email);
  if (!cleared) {
    return NextResponse.json({ok: false, error: 'Failed to clear work logs'}, {status: 500});
  }

  return NextResponse.json({ok: true});
}
