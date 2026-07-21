import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {getNotificationsForEmail, markAllNotificationsRead} from '@/lib/notificationsStore';
import {z} from 'zod';

const getNotificationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  const query = Object.fromEntries(req.nextUrl.searchParams.entries());
  const validation = getNotificationsSchema.safeParse(query);
  const limit = validation.success ? validation.data.limit : 12;

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
