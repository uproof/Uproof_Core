import {NextRequest, NextResponse} from 'next/server';
import {consumePasswordResetToken} from '@/lib/crmUsersStore';
import {isCmsHost} from '@/lib/internalRouting';
import {checkRateLimit, RATE_LIMITS} from '@/lib/rateLimit';
import {validatePasswordPolicy} from '@/lib/secretVault';

export async function POST(req: NextRequest) {
  if (!isCmsHost(req.nextUrl.hostname)) {
    return NextResponse.json({ok: false, error: 'Password reset must use the CMS host'}, {status: 403});
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limiter = await checkRateLimit(`admin-password-reset:${ip}`, RATE_LIMITS.LOGIN);
  if (!limiter.allowed) {
    return NextResponse.json({ok: false, error: 'Too many password reset attempts'}, {status: 429});
  }

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const token = typeof body.token === 'string' ? body.token.trim() : '';
  const newPassword = typeof body.newPassword === 'string' ? body.newPassword.trim() : '';

  if (!token || !newPassword) {
    return NextResponse.json({ok: false, error: 'Token and new password are required'}, {status: 400});
  }

  const passwordPolicyError = validatePasswordPolicy(newPassword);
  if (passwordPolicyError) {
    return NextResponse.json({ok: false, error: passwordPolicyError}, {status: 400});
  }

  try {
    const user = await consumePasswordResetToken(token, newPassword);
    if (!user) {
      return NextResponse.json({ok: false, error: 'Reset link is invalid or expired'}, {status: 400});
    }

    return NextResponse.json({ok: true});
  } catch (error: any) {
    return NextResponse.json({ok: false, error: error?.message || 'Failed to reset password'}, {status: 500});
  }
}
