import {NextRequest, NextResponse} from 'next/server';
import {consumePasswordResetToken} from '@/lib/crmUsersStore';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword.trim() : '';

  if (!token || !newPassword) {
    return NextResponse.json({ok: false, error: 'Token and new password are required'}, {status: 400});
  }

  try {
    const user = await consumePasswordResetToken(token, newPassword);
    if (!user) {
      return NextResponse.json({ok: false, error: 'Reset link is invalid or expired'}, {status: 400});
    }

    return NextResponse.json({ok: true, user: {id: user.id, email: user.email}});
  } catch (error: any) {
    return NextResponse.json({ok: false, error: error?.message || 'Failed to reset password'}, {status: 500});
  }
}
