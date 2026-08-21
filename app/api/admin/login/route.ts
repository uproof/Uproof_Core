import {NextRequest, NextResponse} from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  getApprovedSuperadminCredentials,
  signToken,
} from '@/lib/adminAuth';
import {normalizeCrmRole, isSuperadminRole} from '@/lib/crmRoles';
import {generateCsrfToken} from '@/lib/csrf';
import {RATE_LIMITS, checkRateLimit, clearRateLimit} from '@/lib/rateLimit';
import {logCrmUserActivity} from '@/lib/crmUserActivityStore';
import {parseEmail, parsePassword} from '@/lib/authValidation';
import {createSupabaseServerClient, createSupabaseAdminClient} from '@/lib/supabase/server';
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
  const token = await generateCsrfToken();
  return NextResponse.json({csrfToken: token});
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const {email: loginEmail, password, role: requestedRole} = await req.json().catch(() => ({email: '', password: '', role: ''}));
  const email = parseEmail(loginEmail);
  const parsedPassword = parsePassword(password);
  const roleInput = typeof requestedRole === 'string' ? requestedRole.trim() : '';
  if (roleInput && !normalizeCrmRole(roleInput)) {
    return NextResponse.json({ok: false, error: 'Invalid role'}, {status: 400});
  }

  const requestedCrmRole = normalizeCrmRole(roleInput);

  if (!email || !parsedPassword) {
    return NextResponse.json({ok: false, error: 'Email and password are required'}, {status: 400});
  }

  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const isLocalDevHost = ['localhost', '127.0.0.1', '::1'].includes(host) || host.endsWith('.localhost');
  if (!isLocalDevHost && host !== 'crm.uproof.eu') {
    return NextResponse.json({ok: false, error: 'Login must use crm.uproof.eu'}, {status: 403});
  }

  if (!isLocalDevHost) {
    const ipLimit = await checkRateLimit(`admin-login:ip:${ip}`, RATE_LIMITS.LOGIN);
    if (!ipLimit.allowed) {
      return NextResponse.json({ok: false, error: 'Too many attempts. Try again later.'}, {status: 429});
    }

    const emailLimit = await checkRateLimit(`admin-login:email:${email}`, RATE_LIMITS.LOGIN);
    if (!emailLimit.allowed) {
      return NextResponse.json({ok: false, error: 'Too many attempts. Try again later.'}, {status: 429});
    }
  }

  const approvedSuperadmin = getApprovedSuperadminCredentials().find((entry) => entry.email === email);
  if (!requestedCrmRole || isSuperadminRole(requestedCrmRole)) {
    if (!approvedSuperadmin || approvedSuperadmin.password !== parsedPassword) {
      return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
    }
  }

  const supabase = createSupabaseServerClient();
  const adminSupabase = createSupabaseAdminClient();
  if (requestedCrmRole && !isSuperadminRole(requestedCrmRole)) {
    if (!supabase || !adminSupabase) {
      return NextResponse.json({ok: false, error: 'CRM authentication is unavailable'}, {status: 503});
    }

    const {data, error} = await supabase.auth.signInWithPassword({email, password: parsedPassword});
    if (error || !data.session) {
      return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
    }

    const profileResult = await adminSupabase
      .from('user_profiles')
      .select('id,role,is_active,session_valid_after')
      .eq('email', email)
      .maybeSingle();

    if (profileResult.error || !profileResult.data || !profileResult.data.is_active) {
      return NextResponse.json({ok: false, error: 'CRM user is inactive or missing'}, {status: 403});
    }

    const userRole = normalizeCrmRole(profileResult.data.role);
    if (!userRole) {
      return NextResponse.json({ok: false, error: 'CRM user role is not configured'}, {status: 403});
    }

    const sessionRotationAt = new Date(Date.now() - 5000).toISOString();
    await adminSupabase.from('user_profiles').update({session_valid_after: sessionRotationAt}).eq('id', profileResult.data.id);

    await logCrmUserActivity({
      actorEmail: email,
      actorRole: userRole,
      action: 'login_success',
      detail: 'Password verified',
      ip,
    });

    const response = NextResponse.json({ok: true, nextStep: 'dashboard'});
    setSupabaseAuthCookies(response, data.session);
    response.cookies.set(ADMIN_SESSION_COOKIE, signToken({role: userRole, email, ip}), {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    if (!isLocalDevHost) {
      await clearRateLimit(`admin-login:ip:${ip}`);
      await clearRateLimit(`admin-login:email:${email}`);
    }

    return response;
  }

  await logCrmUserActivity({
    actorEmail: email,
    actorRole: 'superadmin',
    action: 'login_success',
    detail: 'Password verified',
    ip,
  });

  const response = NextResponse.json({ok: true, nextStep: 'dashboard'});
  response.cookies.set(ADMIN_SESSION_COOKIE, signToken({role: 'superadmin', email, ip}), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  if (!isLocalDevHost) {
    await clearRateLimit(`admin-login:ip:${ip}`);
    await clearRateLimit(`admin-login:email:${email}`);
  }

  return response;
}
