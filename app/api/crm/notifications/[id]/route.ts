import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {markNotificationRead} from '@/lib/notificationsStore';

export async function PATCH(_req: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  const {id} = await params;
  const ok = await markNotificationRead(id, session.email);
  return NextResponse.json({ok});
}