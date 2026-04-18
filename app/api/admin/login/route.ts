import {NextRequest, NextResponse} from 'next/server';
import {signToken} from '@/lib/adminAuth';
import {generateCsrfToken} from '@/lib/csrf';

// Simple in-memory rate limiter (per IP). Note: resets on serverless cold start.
const attempts: Map<string, { count: number; resetAt: number }> = new Map();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 10; // allow 10 attempts per window

export async function GET() {
  // Generate CSRF token for the login form
  const token = await generateCsrfToken();
  return NextResponse.json({ csrfToken: token });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now > rec.resetAt) {
    attempts.set(ip, { count: 0, resetAt: now + WINDOW_MS });
  }
  const entry = attempts.get(ip)!;
  if (entry.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const {password} = await req.json().catch(() => ({password: ''}));
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ok: false, error: 'Server not configured: ADMIN_PASSWORD missing'}, {status: 500});
  }

  if (!password || password !== adminPassword) {
    entry.count += 1;
    return NextResponse.json({ok: false, error: 'Invalid credentials'}, {status: 401});
  }

  const token = signToken();
  const res = NextResponse.json({ok: true});
  // Set cookie via headers (app router server response)
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24
  });
  return res;
}
