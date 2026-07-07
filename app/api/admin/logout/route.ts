import {NextResponse} from 'next/server';
import {
  SUPABASE_ACCESS_TOKEN_COOKIE,
  SUPABASE_REFRESH_TOKEN_COOKIE,
} from '@/lib/supabase/session';

export async function POST() {
  const res = NextResponse.json({ok: true});
  const cookieDomain = process.env.SESSION_COOKIE_DOMAIN?.trim() || undefined;
  res.cookies.set('admin_session', '', {httpOnly: true, domain: cookieDomain, path: '/', maxAge: 0});
  res.cookies.set(SUPABASE_ACCESS_TOKEN_COOKIE, '', {httpOnly: true, domain: cookieDomain, path: '/', maxAge: 0});
  res.cookies.set(SUPABASE_REFRESH_TOKEN_COOKIE, '', {httpOnly: true, domain: cookieDomain, path: '/', maxAge: 0});
  return res;
}
