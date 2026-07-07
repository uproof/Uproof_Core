import {NextRequest, NextResponse} from 'next/server';
import {signToken} from '@/lib/adminAuth';
import {generateCsrfToken} from '@/lib/csrf';
import {isMfaConfigured, verifyTotp, verifyTotpSecret} from '@/lib/mfa';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import {
  SUPABASE_ACCESS_TOKEN_COOKIE,
  SUPABASE_REFRESH_TOKEN_COOKIE,
} from '@/lib/supabase/session';

// Simple in-memory rate limiter (per IP). Note: resets on serverless cold start.
const attempts: Map<string, { count: number; resetAt: number }> = new Map();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 10; // allow 10 attempts per window

export async function GET() {
  // Generate CSRF token for the login form
  const token = await generateCsrfToken();
  return NextResponse.json({ csrfToken: token });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now > rec.resetAt) {
    attempts.set(ip, { count: 0, resetAt: now + WINDOW_MS });
  }
  const entry = attempts.get(ip)!;
  if (entry.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const {email: loginEmail, password, otp, role: requestedRole} = await req.json().catch(() => ({email: '', password: '', otp: '', role: ''}));
  const email = String(loginEmail || '').trim().toLowerCase();
  const role: 'superadmin' | 'sales' = requestedRole === 'sales' ? 'sales' : 'superadmin';

  if (!email || !password) {
    return NextResponse.json({ok: false, error: 'Email and password are required'}, {status: 400});
  }

  if (!isMfaConfigured(role)) {
    return NextResponse.json({ok: false, error: 'MFA is not configured for this role'}, {status: 500});
  }

  const res = NextResponse.json({ok: true});
  const cookieDomain = process.env.SESSION_COOKIE_DOMAIN?.trim() || undefined;

  const supabase = createSupabaseServerClient();
  if (supabase) {
    const {data, error} = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.session?.access_token && data.session.refresh_token) {
      const profile = await createSupabaseServerClient()!
        .from('user_profiles')
        .select('role,is_active,crm_mfa_secret')
        .eq('email', email)
        .maybeSingle();
      if (profile.error || !profile.data || !profile.data.is_active || profile.data.role !== role) {
        entry.count += 1;
        return NextResponse.json({ok: false, error: 'Account is not allowed for this portal'}, {status: 403});
      }
      if (role === 'sales' && !verifyTotpSecret(profile.data.crm_mfa_secret || process.env.SALES_MFA_SECRET || '', String(otp || ''))) {
        entry.count += 1;
        return NextResponse.json({ok: false, error: 'Invalid MFA code'}, {status: 401});
      }
      if (role === 'superadmin' && !verifyTotp('superadmin', String(otp || ''))) {
        entry.count += 1;
        return NextResponse.json({ok: false, error: 'Invalid MFA code'}, {status: 401});
      }
      res.cookies.set(SUPABASE_ACCESS_TOKEN_COOKIE, data.session.access_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        domain: cookieDomain,
        path: '/',
        maxAge: data.session.expires_in ?? 60 * 60,
      });
      res.cookies.set(SUPABASE_REFRESH_TOKEN_COOKIE, data.session.refresh_token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        domain: cookieDomain,
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    } else if (process.env.NODE_ENV === 'production') {
      entry.count += 1;
      return NextResponse.json({ok: false, error: 'Supabase authentication failed'}, {status: 401});
    }
  } else {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const salesPassword = process.env.SALES_PASSWORD;
    const superadminPassword = process.env.SUPERADMIN_PASSWORD || adminPassword;
    const superadminEmail = (process.env.SUPERADMIN_EMAIL || process.env.ADMIN_EMAIL || 'superadmin@uproof.local').trim().toLowerCase();
    const salesEmail = (process.env.SALES_EMAIL || 'sales@uproof.local').trim().toLowerCase();
    const expectedEmail = role === 'sales' ? salesEmail : superadminEmail;
    if (role === 'sales') {
      const crmUser = await getCrmUserByEmail(email);
      if (crmUser && crmUser.role === 'sales' && crmUser.isActive && crmUser.password && password === crmUser.password) {
        const mfaOk = verifyTotpSecret(crmUser.mfaSecret || process.env.SALES_MFA_SECRET || '', String(otp || ''));
        if (!mfaOk) {
          entry.count += 1;
          return NextResponse.json({ok: false, error: 'Invalid MFA code'}, {status: 401});
        }
      } else if (!crmUser && salesPassword && email === expectedEmail && password === salesPassword) {
        if (!verifyTotp('sales', String(otp || ''))) {
          entry.count += 1;
          return NextResponse.json({ok: false, error: 'Invalid MFA code'}, {status: 401});
        }
      } else {
        entry.count += 1;
        return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
      }
    } else {
      const expectedPassword = superadminPassword;
      if (!expectedPassword || password !== expectedPassword || email !== expectedEmail) {
        entry.count += 1;
        return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
      }
      if (!verifyTotp('superadmin', String(otp || ''))) {
        entry.count += 1;
        return NextResponse.json({ok: false, error: 'Invalid MFA code'}, {status: 401});
      }
    }
  }

  const token = signToken({role, email});
  // Transitional fallback cookie; Supabase session is now the primary credential.
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    domain: cookieDomain,
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  return res;
}
