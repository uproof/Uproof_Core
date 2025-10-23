import {NextRequest, NextResponse} from 'next/server';
import {signToken} from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  const {password} = await req.json().catch(() => ({password: ''}));
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ok: false, error: 'Server not configured: ADMIN_PASSWORD missing'}, {status: 500});
  }

  if (!password || password !== adminPassword) {
    return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
  }

  const token = signToken();
  const res = NextResponse.json({ok: true});
  // Set cookie via headers (app router server response)
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24
  });
  return res;
}
