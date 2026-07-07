import {NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  return NextResponse.json({
    ok: true,
    email: session.email,
    role: session.role,
    sessionId: session.sid,
  });
}
