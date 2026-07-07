import {NextRequest, NextResponse} from 'next/server';
import crypto from 'crypto';
import {getAdminSession} from '@/lib/adminAuth';
import {createCrmUser, getCrmUsers} from '@/lib/crmUsersStore';
import {checkRateLimit, RATE_LIMITS} from '@/lib/rateLimit';
import {canPerform} from '@/lib/permissions';
import {isSupabaseConfigured} from '@/lib/supabase/config';

function publicCrmUser(user: Awaited<ReturnType<typeof getCrmUsers>>[number]) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    hasPassword: !!user.password,
    hasMfaSecret: !!user.mfaSecret,
    createdAt: user.createdAt,
    updatedAtUtc: user.updatedAtUtc,
  };
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (!canPerform(session.role, 'viewCrmUsers')) {
    return NextResponse.json({ok: false, error: 'Only superadmin can list CRM users'}, {status: 403});
  }

  const users = await getCrmUsers();
  return NextResponse.json({ok: true, users: users.map(publicCrmUser)});
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (!canPerform(session.role, 'createCrmUsers')) {
    return NextResponse.json({ok: false, error: 'Only superadmin can create CRM users'}, {status: 403});
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limiter = await checkRateLimit(`crm-user-create:${session.sid}:${ip}`, RATE_LIMITS.API_MUTATION);
  if (!limiter.allowed) {
    return NextResponse.json({ok: false, error: 'Too many requests'}, {status: 429});
  }

  const body = await req.json().catch(() => ({} as Record<string, string>));
  const email = String(body.email || '').trim();
  const name = String(body.name || '').trim();
  const providedPassword = String(body.password || '').trim();

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ok: false, error: 'Invalid email'}, {status: 400});
  }

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ok: false, error: 'Invalid name'}, {status: 400});
  }

  if (!email || !name) {
    return NextResponse.json({ok: false, error: 'Missing email or name'}, {status: 400});
  }

  const password = providedPassword || `${crypto.randomBytes(6).toString('base64url')}#A1`;

  if (password.length < 10) {
    return NextResponse.json({ok: false, error: 'Password must be at least 10 characters'}, {status: 400});
  }

  if (isSupabaseConfigured() && !/[A-Z]/.test(password)) {
    return NextResponse.json({ok: false, error: 'Password must include an uppercase letter'}, {status: 400});
  }

  const user = await createCrmUser({
    email,
    name,
    role: 'sales',
    password,
  });

  return NextResponse.json({
    ok: true,
    user: publicCrmUser(user),
    temporaryPassword: providedPassword ? undefined : password,
  });
}
