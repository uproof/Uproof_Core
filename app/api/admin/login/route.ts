import {NextRequest, NextResponse} from 'next/server';
import {signToken} from '@/lib/adminAuth';
import {generateCsrfToken} from '@/lib/csrf';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {RATE_LIMITS, checkRateLimit} from '@/lib/rateLimit';
import {verifyPassword} from '@/lib/secretVault';
import {verifyTotpSecret} from '@/lib/mfa';
import {
  SUPABASE_ACCESS_TOKEN_COOKIE,
  SUPABASE_REFRESH_TOKEN_COOKIE,
} from '@/lib/supabase/session';

export async function GET() {
  // Generate CSRF token for the login form
  const token = await generateCsrfToken();
  return NextResponse.json({ csrfToken: token });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limit = await checkRateLimit(`admin-login:${ip}`, RATE_LIMITS.LOGIN);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const {email: loginEmail, password, role: requestedRole, mfaCode} = await req.json().catch(() => ({email: '', password: '', role: '', mfaCode: ''}));
  const email = String(loginEmail || '').trim().toLowerCase();
  const role: 'superadmin' | 'sales' = requestedRole === 'sales' ? 'sales' : 'superadmin';

  if (!email || !password) {
    return NextResponse.json({ok: false, error: 'Email and password are required'}, {status: 400});
  }

  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const isLocalDevHost = ['localhost', '127.0.0.1', '::1'].includes(host) || host.endsWith('.localhost');
  if (!isLocalDevHost) {
    if (role === 'sales' && host !== 'crm.uproof.eu') {
      return NextResponse.json({ok: false, error: 'Sales login must use crm.uproof.eu'}, {status: 403});
    }
    if (role === 'superadmin' && host !== 'admin.uproof.eu') {
      return NextResponse.json({ok: false, error: 'Admin login must use admin.uproof.eu'}, {status: 403});
    }
  }

  const user = await getCrmUserByEmail(email);
  if (!user || !user.isActive || user.role !== role || !user.password || !verifyPassword(password, user.password)) {
    return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
  }

  if (role === 'superadmin') {
    const mfaSecret = user.mfaSecret || '';
    if (process.env.NODE_ENV === 'production' && !mfaSecret) {
      return NextResponse.json({ok: false, error: 'MFA is required for superadmin accounts'}, {status: 403});
    }
    if (mfaSecret && !verifyTotpSecret(mfaSecret, String(mfaCode || ''))) {
      return NextResponse.json({ok: false, error: 'Invalid MFA code'}, {status: 401});
    }
  }

  const res = NextResponse.json({ok: true});
  const token = signToken({role, email});
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  return res;
}
