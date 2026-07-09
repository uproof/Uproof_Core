import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {getNotificationsForEmail, markAllNotificationsRead} from '@/lib/notificationsStore';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  const limit = Math.max(1, Math.min(Number(req.nextUrl.searchParams.get('limit') || '12') || 12, 50));
  const notifications = await getNotificationsForEmail(session.email, limit);
  const unreadCount = notifications.filter((item) => !item.readAt).length;

  return NextResponse.json({ok: true, notifications, unreadCount});
}

export async function PATCH() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  await markAllNotificationsRead(session.email);
  return NextResponse.json({ok: true});
}