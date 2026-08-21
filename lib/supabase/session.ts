import type {AdminRole, AdminSession} from '@/lib/adminAuth';
import {normalizeCrmRole} from '@/lib/crmRoles';

export const SUPABASE_ACCESS_TOKEN_COOKIE = 'supabase-access-token';
export const SUPABASE_REFRESH_TOKEN_COOKIE = 'supabase-refresh-token';

export type SessionCookieReader = {
  get(name: string): {value: string} | undefined;
};

function decodeJwtIssuedAt(accessToken: string): number | null {
  const parts = accessToken.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as {iat?: unknown};
    const issuedAt = Number(payload.iat || 0);
    return Number.isFinite(issuedAt) ? issuedAt * 1000 : null;
  } catch {
    return null;
  }
}

function decodeJwtPayload(accessToken: string): Record<string, unknown> | null {
  const parts = accessToken.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getSupabaseAccessToken(cookieReader: SessionCookieReader): string | undefined {
  return cookieReader.get(SUPABASE_ACCESS_TOKEN_COOKIE)?.value;
}

export async function resolveSupabaseAdminSession(accessToken: string | undefined): Promise<AdminSession | null> {
  if (!accessToken) {
    return null;
  }

  const payload = decodeJwtPayload(accessToken);
  if (!payload) {
    return null;
  }

  const email = typeof payload.email === 'string' ? payload.email.trim() : '';
  if (!email) {
    return null;
  }

  const role = normalizeCrmRole(
    payload.user_metadata && typeof payload.user_metadata === 'object'
      ? (payload.user_metadata as Record<string, unknown>).role
      : payload.app_metadata && typeof payload.app_metadata === 'object'
        ? (payload.app_metadata as Record<string, unknown>).role
        : undefined
  );
  if (!role) {
    return null;
  }

  const issuedAtMs = decodeJwtIssuedAt(accessToken) ?? Date.now();
  const sessionId = typeof payload.sub === 'string' && payload.sub ? payload.sub : 'supabase';

  return {
    sub: 'admin',
    email,
    role,
    sid: sessionId,
    iat: issuedAtMs,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
}
