import {cookies} from 'next/headers';
import {headers} from 'next/headers';
import crypto from 'crypto';
import {createSupabaseAdminClient} from '@/lib/supabase/server';
import {getSupabaseAccessToken, resolveSupabaseAdminSession} from '@/lib/supabase/session';

export const ADMIN_SESSION_COOKIE = 'admin_session';
export const ADMIN_PENDING_SESSION_COOKIE = 'admin_pending_session';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

export type AdminRole = 'superadmin' | 'sales';

export type AdminSession = {
  sub: 'admin';
  email: string;
  role: AdminRole;
  sid: string;
  iat: number;
  exp: number;
  ip?: string;
};

type SignTokenOptions = {
  ttlMs?: number;
  email?: string;
  role?: AdminRole;
  sid?: string;
  ip?: string;
};

export type ApprovedSuperadminCredential = {
  email: string;
  password: string;
};

function getSecret() {
  const secret = process.env.ADMIN_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || '';
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_TOKEN_SECRET is required in production');
    }
    return 'dev-secret-change-me';
  }
  return secret;
}

export function getApprovedSuperadminCredentials(): ApprovedSuperadminCredential[] {
  return [
    {
      email: (process.env.SUPERADMIN_EMAIL_1 || '').trim().toLowerCase(),
      password: (process.env.SUPERADMIN_PASSWORD_1 || '').trim(),
    },
    {
      email: (process.env.SUPERADMIN_EMAIL_2 || '').trim().toLowerCase(),
      password: (process.env.SUPERADMIN_PASSWORD_2 || '').trim(),
    },
  ].filter((entry) => entry.email && entry.password);
}

export function isApprovedSuperadminEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return getApprovedSuperadminCredentials().some((entry) => entry.email === normalizedEmail);
}

function decodeToken(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, sig] = parts;
  const expected = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString()) as AdminSession;
    if (payload.sub !== 'admin') return null;
    if (!payload.email || !payload.sid) return null;
    if (payload.role !== 'superadmin' && payload.role !== 'sales') return null;
    if (Date.now() >= payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

async function getSessionFromCookie(cookieName: string): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return decodeToken(cookieStore.get(cookieName)?.value);
}

function isSessionStillValid(session: AdminSession, validAfter: string | null | undefined) {
  if (!validAfter) {
    return true;
  }

  const validAfterMs = Date.parse(validAfter);
  if (Number.isNaN(validAfterMs)) {
    return true;
  }

  return session.iat >= validAfterMs;
}

export function signToken(options: SignTokenOptions = {}) {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const payload: AdminSession = {
    sub: 'admin',
    email: options.email || process.env.ADMIN_EMAIL || 'admin@uproof.local',
    role: options.role || (process.env.ADMIN_ROLE === 'sales' ? 'sales' : 'superadmin'),
    sid: options.sid || crypto.randomUUID(),
    iat: Date.now(),
    exp: Date.now() + ttlMs,
    ip: options.ip,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

export function verifyToken(token: string | undefined): boolean {
  return !!decodeToken(token);
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
}

export async function setPendingAdminCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_PENDING_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
}

export async function clearPendingAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_PENDING_SESSION_COOKIE, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyToken(token);
}

export async function getPendingAdminSession(): Promise<AdminSession | null> {
  return await getSessionFromCookie(ADMIN_PENDING_SESSION_COOKIE);
}

export async function getMfaSetupSession(): Promise<AdminSession | null> {
  const pendingSession = await getPendingAdminSession();
  if (pendingSession) {
    return pendingSession;
  }

  return await getAdminSession();
}

export async function isSuperadminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return !!session && session.role === 'superadmin';
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const currentIp = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const supabaseAccessToken = getSupabaseAccessToken(cookieStore);
  if (supabaseAccessToken) {
    return await resolveSupabaseAdminSession(supabaseAccessToken);
  }

  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = decodeToken(token);
  if (!session) {
    return null;
  }

  if (session.ip && session.ip !== currentIp) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return session;
  }

  const {data, error} = await supabase
    .from('user_profiles')
    .select('role,is_active,session_valid_after')
    .eq('email', session.email)
    .maybeSingle();

  if (error || !data || !data.is_active) {
    if (session.role === 'superadmin' && isApprovedSuperadminEmail(session.email)) {
      return session;
    }
    return null;
  }

  if (!isSessionStillValid(session, data.session_valid_after)) {
    return null;
  }

  const role = data.role === 'superadmin' ? 'superadmin' : data.role === 'sales' ? 'sales' : null;
  if (!role) {
    if (session.role === 'superadmin' && isApprovedSuperadminEmail(session.email)) {
      return session;
    }
    return null;
  }

  return {
    ...session,
    role,
  };
}
