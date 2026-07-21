import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {checkRateLimit, RATE_LIMITS} from '@/lib/rateLimit';
import {canPerform} from '@/lib/permissions';
import {deleteCrmUser, getCrmUserById, updateCrmUser} from '@/lib/crmUsersStore';
import {validatePasswordPolicy} from '@/lib/secretVault';
import {clearAdminCookie} from '@/lib/adminAuth';
import {SUPABASE_ACCESS_TOKEN_COOKIE, SUPABASE_REFRESH_TOKEN_COOKIE} from '@/lib/supabase/session';
import {z} from 'zod';

const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  isActive: z.boolean().optional(),
  password: z.string().trim().optional(),
});

function clearCurrentBrowserSession(response: NextResponse) {
  response.cookies.set(SUPABASE_ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  response.cookies.set(SUPABASE_REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export async function PATCH(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (!canPerform(session.role, 'createCrmUsers')) {
    return NextResponse.json({ok: false, error: 'Only superadmin can update CRM users'}, {status: 403});
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limiter = await checkRateLimit(`crm-user-update:${session.sid}:${ip}`, RATE_LIMITS.API_MUTATION);
  if (!limiter.allowed) {
    return NextResponse.json({ok: false, error: 'Too many requests'}, {status: 429});
  }

  const {id} = await params;
  const json = await req.json().catch(() => ({}));
  const validation = updateUserSchema.safeParse(json);

  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message || 'Invalid input';
    return NextResponse.json({ok: false, error: firstError}, {status: 400});
  }

  const {name, isActive, password} = validation.data;

  const current = await getCrmUserById(id);
  if (!current) {
    return NextResponse.json({ok: false, error: 'Sales user not found'}, {status: 404});
  }

  const isSelfPasswordChange = !!password && session.email.toLowerCase() === current.email.toLowerCase();

  if (typeof password === 'string' && password.trim()) {
    const passwordPolicyError = validatePasswordPolicy(password.trim());
    if (passwordPolicyError) {
      return NextResponse.json({ok: false, error: passwordPolicyError}, {status: 400});
    }
  }

  const user = await updateCrmUser({id, name, isActive, password});
  if (!user) {
    return NextResponse.json({ok: false, error: 'Sales user not found'}, {status: 404});
  }

  const response = NextResponse.json({
    ok: true,
    logoutRequired: isSelfPasswordChange,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      hasPassword: false,
      createdAt: user.createdAt,
      updatedAtUtc: user.updatedAtUtc,
    },
  });

  if (isSelfPasswordChange) {
    await clearAdminCookie();
    clearCurrentBrowserSession(response);
  }

  return response;
}

export async function DELETE(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (!canPerform(session.role, 'createCrmUsers')) {
    return NextResponse.json({ok: false, error: 'Only superadmin can delete CRM users'}, {status: 403});
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limiter = await checkRateLimit(`crm-user-delete:${session.sid}:${ip}`, RATE_LIMITS.API_MUTATION);
  if (!limiter.allowed) {
    return NextResponse.json({ok: false, error: 'Too many requests'}, {status: 429});
  }

  const {id} = await params;
  const deleted = await deleteCrmUser(id);
  if (!deleted) {
    return NextResponse.json({ok: false, error: 'Sales user not found'}, {status: 404});
  }

  return NextResponse.json({ok: true});
}
