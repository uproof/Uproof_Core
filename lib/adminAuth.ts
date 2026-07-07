import {cookies} from 'next/headers';
import crypto from 'crypto';
import {createSupabaseAdminClient} from '@/lib/supabase/server';
import {getSupabaseAccessToken, resolveSupabaseAdminSession} from '@/lib/supabase/session';

const SESSION_COOKIE = 'admin_session';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export type AdminRole = 'superadmin' | 'sales';

export type AdminSession = {
  sub: 'admin';
  email: string;
  role: AdminRole;
  sid: string;
  iat: number;
  exp: number;
};

function getSecret() {
  const secret = process.env.ADMIN_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || '';
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_TOKEN_SECRET is required in production');
    }
    // Dev fallback only
    return 'dev-secret-change-me';
  }
  return secret;
}

function getCookieDomain() {
  const domain = process.env.SESSION_COOKIE_DOMAIN?.trim();
  return domain ? domain : undefined;
}

type SignTokenOptions = {
  ttlMs?: number;
  email?: string;
  role?: AdminRole;
  sid?: string;
};

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

export function signToken(options: SignTokenOptions = {}) {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const payload: AdminSession = {
    sub: 'admin',
    email: options.email || process.env.ADMIN_EMAIL || 'admin@uproof.local',
    role: options.role || (process.env.ADMIN_ROLE === 'sales' ? 'sales' : 'superadmin'),
    sid: options.sid || crypto.randomUUID(),
    iat: Date.now(),
    exp: Date.now() + ttlMs
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
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    domain: getCookieDomain(),
    path: '/',
    maxAge: 60 * 60 * 24 // 1 day
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    domain: getCookieDomain(),
    path: '/',
    maxAge: 0,
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifyToken(token);
}

export async function isSuperadminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession();
  return !!session && session.role === 'superadmin';
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const supabaseAccessToken = getSupabaseAccessToken(cookieStore);
  if (supabaseAccessToken) {
    return await resolveSupabaseAdminSession(supabaseAccessToken);
  }

  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = decodeToken(token);
  if (!session) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return session;
  }

  const {data, error} = await supabase
    .from('user_profiles')
    .select('role,is_active')
    .eq('email', session.email)
    .maybeSingle();

  if (error || !data || !data.is_active) {
    return null;
  }

  const role = data.role === 'superadmin' ? 'superadmin' : data.role === 'sales' ? 'sales' : null;
  if (!role) {
    return null;
  }

  return {
    ...session,
    role,
  };
}
