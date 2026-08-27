import type {AdminRole, AdminSession} from '@/lib/adminAuth';
import {normalizeCrmRole} from '@/lib/crmRoles';
import {createSupabaseServerClient} from '@/lib/supabase/server';

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

export function getSupabaseAccessToken(cookieReader: SessionCookieReader): string | undefined {
  return cookieReader.get(SUPABASE_ACCESS_TOKEN_COOKIE)?.value;
}

export async function resolveSupabaseAdminSession(accessToken: string | undefined): Promise<AdminSession | null> {
  if (!accessToken) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const {data, error} = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    return null;
  }

  const user = data.user;
  const email = user.email?.trim() || '';
  if (!email) {
    return null;
  }

  const role = normalizeCrmRole(
    user.user_metadata && typeof user.user_metadata === 'object'
      ? (user.user_metadata as Record<string, unknown>).role
      : user.app_metadata && typeof user.app_metadata === 'object'
        ? (user.app_metadata as Record<string, unknown>).role
        : undefined
  );
  if (!role) {
    return null;
  }

  const issuedAtMs = decodeJwtIssuedAt(accessToken) ?? Date.now();
  const sessionId = user.id || 'supabase';

  return {
    sub: 'admin',
    email,
    role,
    sid: sessionId,
    iat: issuedAtMs,
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
}
