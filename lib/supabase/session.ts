import type {AdminRole, AdminSession} from '@/lib/adminAuth';
import {createSupabaseAdminClient} from '@/lib/supabase/server';

export const SUPABASE_ACCESS_TOKEN_COOKIE = 'supabase-access-token';
export const SUPABASE_REFRESH_TOKEN_COOKIE = 'supabase-refresh-token';

export type SessionCookieReader = {
  get(name: string): {value: string} | undefined;
};

function normalizeRole(role: unknown): AdminRole | null {
  return role === 'superadmin' || role === 'sales' ? role : null;
}

export function getSupabaseAccessToken(cookieReader: SessionCookieReader): string | undefined {
  return cookieReader.get(SUPABASE_ACCESS_TOKEN_COOKIE)?.value;
}

export async function resolveSupabaseAdminSession(accessToken: string | undefined): Promise<AdminSession | null> {
  if (!accessToken) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const {data, error} = await supabase.auth.getUser(accessToken);
  const user = data?.user;
  if (error || !user?.email) {
    return null;
  }

  const profileResult = await supabase
    .from('user_profiles')
    .select('role,is_active')
    .eq('email', user.email)
    .maybeSingle();

  if (profileResult.error || !profileResult.data || !profileResult.data.is_active) {
    return null;
  }

  const role = normalizeRole(profileResult.data.role);
  if (!role) {
    return null;
  }

  return {
    sub: 'admin',
    email: user.email,
    role,
    sid: user.id,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
}
