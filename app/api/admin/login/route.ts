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
import {verifyTotpSecret} from '@/lib/mfa';
import {consumeRecoveryCode, getPlainMfaSecret} from '@/lib/crmUsersStore';
import {logCrmUserActivity} from '@/lib/crmUserActivityStore';
import {parseEmail, parsePassword} from '@/lib/authValidation';
import {createCrmSupabaseClient} from '@/lib/crmStorage';
import {SUPABASE_ACCESS_TOKEN_COOKIE, SUPABASE_REFRESH_TOKEN_COOKIE} from '@/lib/supabase/session';

function setSupabaseAuthCookies(response: NextResponse, session: {access_token: string; refresh_token: string; expires_at?: number | null}) {
  const maxAge = typeof session.expires_at === 'number' ? Math.max(60, session.expires_at - Math.floor(Date.now() / 1000)) : 60 * 60 * 24;
  response.cookies.set(SUPABASE_ACCESS_TOKEN_COOKIE, session.access_token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  });
  response.cookies.set(SUPABASE_REFRESH_TOKEN_COOKIE, session.refresh_token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function GET() {
  // Generate CSRF token for the login form
  const token = await generateCsrfToken();
  return NextResponse.json({ csrfToken: token });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limit = await checkRateLimit(`admin-login:ip:${ip}`, RATE_LIMITS.LOGIN);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const {email: loginEmail, password, role: requestedRole, mfaCode, recoveryCode} = await req.json().catch(() => ({email: '', password: '', role: '', mfaCode: '', recoveryCode: ''}));
  const email = parseEmail(loginEmail);
  const parsedPassword = parsePassword(password);
  const role: 'superadmin' | 'sales' = requestedRole === 'sales' ? 'sales' : 'superadmin';

  if (!email || !parsedPassword) {
    return NextResponse.json({ok: false, error: 'Email and password are required'}, {status: 400});
  }

  const identityLimit = await checkRateLimit(`admin-login:email:${email}`, RATE_LIMITS.LOGIN);
  if (!identityLimit.allowed) {
    return NextResponse.json({ok: false, error: 'Too many attempts. Try again later.'}, {status: 429});
  }

  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const isLocalDevHost = ['localhost', '127.0.0.1', '::1'].includes(host) || host.endsWith('.localhost');
  if (!isLocalDevHost && host !== 'crm.uproof.eu') {
    return NextResponse.json({ok: false, error: 'Login must use crm.uproof.eu'}, {status: 403});
  }

  if (role === 'superadmin' && !getApprovedSuperadminCredentials().some((entry) => entry.email === email)) {
    return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
  }

  const user = await getCrmUserByEmail(email);
  if (!user) {
    return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
  }

  if (role === 'sales' && (!user.isActive || user.role !== role)) {
    return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
  }

  if (user.role !== role) {
    return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
  }

  const supabase = createCrmSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ok: false, error: 'Authentication backend unavailable'}, {status: 503});
  }

  const {data: authData, error: authError} = await supabase.auth.signInWithPassword({
    email,
    password: parsedPassword,
  });

  if (authError || !authData.session || authData.user?.email?.toLowerCase() !== email) {
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
    setSupabaseAuthCookies(pending, authData.session);
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
  setSupabaseAuthCookies(res, authData.session);
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
