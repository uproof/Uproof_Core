import {NextResponse} from 'next/server';
import {ADMIN_SESSION_COOKIE, getApprovedSuperadminCredentials, signToken} from '@/lib/adminAuth';
import {ADMIN_ACTIVITY_COOKIE, SESSION_IDLE_TIMEOUT_SECONDS} from '@/lib/sessionConfig';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ok: false, error: 'Unavailable'}, {status: 404});
  }

  const approvedSuperadmin = getApprovedSuperadminCredentials()[0];
  if (!approvedSuperadmin) {
    return NextResponse.json({ok: false, error: 'No approved superadmin is configured'}, {status: 500});
  }

  const response = NextResponse.json({ok: true, email: approvedSuperadmin.email});
  response.cookies.set(ADMIN_SESSION_COOKIE, signToken({email: approvedSuperadmin.email, role: 'superadmin'}), {
    httpOnly: true,
    sameSite: 'strict',
    secure: String(process.env.NODE_ENV) === 'production',
    path: '/',
    maxAge: SESSION_IDLE_TIMEOUT_SECONDS,
  });
  response.cookies.set(ADMIN_ACTIVITY_COOKIE, 'active', {
    httpOnly: true,
    sameSite: 'strict',
    secure: String(process.env.NODE_ENV) === 'production',
    path: '/',
    maxAge: SESSION_IDLE_TIMEOUT_SECONDS,
  });

  return response;
}