import {NextResponse} from 'next/server';
import {
  ADMIN_PENDING_SESSION_COOKIE,
  ADMIN_SESSION_COOKIE,
} from '@/lib/adminAuth';
import {
  SUPABASE_ACCESS_TOKEN_COOKIE,
  SUPABASE_REFRESH_TOKEN_COOKIE,
} from '@/lib/supabase/session';

export async function POST() {
  const res = NextResponse.json({ok: true});
  res.cookies.set(ADMIN_SESSION_COOKIE, '', {httpOnly: true, path: '/', maxAge: 0});
  res.cookies.set(ADMIN_PENDING_SESSION_COOKIE, '', {httpOnly: true, path: '/', maxAge: 0});
  res.cookies.set(SUPABASE_ACCESS_TOKEN_COOKIE, '', {httpOnly: true, path: '/', maxAge: 0});
  res.cookies.set(SUPABASE_REFRESH_TOKEN_COOKIE, '', {httpOnly: true, path: '/', maxAge: 0});
  return res;
}
