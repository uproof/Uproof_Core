import {NextRequest, NextResponse} from 'next/server';
import {
  ADMIN_PENDING_SESSION_COOKIE,
  ADMIN_SESSION_COOKIE,
  getApprovedSuperadminCredentials,
  signToken,
} from '@/lib/adminAuth';
import {generateCsrfToken} from '@/lib/csrf';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {RATE_LIMITS, checkRateLimit} from '@/lib/rateLimit';
import {verifyPassword} from '@/lib/secretVault';
import {verifyTotpSecret} from '@/lib/mfa';
import {consumeRecoveryCode, getPlainMfaSecret} from '@/lib/crmUsersStore';
import {logCrmUserActivity} from '@/lib/crmUserActivityStore';

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

  const {email: loginEmail, password, role: requestedRole, mfaCode, recoveryCode} = await req.json().catch(() => ({email: '', password: '', role: '', mfaCode: '', recoveryCode: ''}));
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

  if (role === 'superadmin') {
    const allowedCredentials = getApprovedSuperadminCredentials();
    const allowedEmails = allowedCredentials.map((entry) => entry.email);

    if (!allowedEmails.includes(email)) {
      return NextResponse.json({ok: false, error: 'Superadmin login is restricted to approved email addresses'}, {status: 403});
    }
  }

  const user = await getCrmUserByEmail(email);
  if (!user) {
    return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
  }

  if (role === 'sales' && (!user.isActive || user.role !== role)) {
    return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
  }

  if (role === 'superadmin') {
    const allowedCredentials = getApprovedSuperadminCredentials();
    const credential = allowedCredentials.find((entry) => entry.email === email);
    if (!credential || credential.password !== password) {
      return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
    }
    if (user.role !== 'superadmin') {
      return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
    }
  } else if (!user.password || !verifyPassword(password, user.password)) {
    return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
  }

  const mfaSecret = getPlainMfaSecret(user);
  if (!mfaSecret) {
    await logCrmUserActivity({
      actorEmail: user.email,
      actorRole: role,
      action: 'login_success',
      detail: 'MFA not configured',
      ip,
    });

    const pending = NextResponse.json({ok: true, nextStep: 'mfa-setup'});
    pending.cookies.set(ADMIN_SESSION_COOKIE, '', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    });
    pending.cookies.set(ADMIN_PENDING_SESSION_COOKIE, signToken({role, email}), {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    return pending;
  }

  const totpAccepted = verifyTotpSecret(mfaSecret, String(mfaCode || ''));
  const recoveryAccepted = !totpAccepted && String(recoveryCode || '').trim() ? await consumeRecoveryCode(user.id, String(recoveryCode || '')) : false;
  if (!totpAccepted && !recoveryAccepted) {
    return NextResponse.json({ok: false, error: 'Invalid MFA or recovery code'}, {status: 401});
  }

  await logCrmUserActivity({
    actorEmail: user.email,
    actorRole: role,
    action: recoveryAccepted ? 'login_recovery_code' : 'login_success',
    detail: recoveryAccepted ? 'Used one-time recovery code' : 'TOTP verified',
    ip,
  });

  const res = NextResponse.json({ok: true, nextStep: 'dashboard'});
  res.cookies.set(ADMIN_PENDING_SESSION_COOKIE, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  res.cookies.set(ADMIN_SESSION_COOKIE, signToken({role, email}), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  return res;
}
