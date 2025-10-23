import {cookies} from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE = 'admin_session';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h

type TokenPayload = {
  sub: 'admin';
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

export function signToken(ttlMs: number = DEFAULT_TTL_MS) {
  const payload: TokenPayload = {
    sub: 'admin',
    iat: Date.now(),
    exp: Date.now() + ttlMs
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
  return `${payloadB64}.${sig}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;
  const expected = crypto.createHmac('sha256', getSecret()).update(payloadB64).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString()) as TokenPayload;
    return payload.sub === 'admin' && Date.now() < payload.exp;
  } catch {
    return false;
  }
}

export function setAdminCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 // 1 day
  });
}

export function clearAdminCookie() {
  cookies().set(SESSION_COOKIE, '', {httpOnly: true, path: '/', maxAge: 0});
}

export function isAdminAuthenticated(): boolean {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifyToken(token);
}
