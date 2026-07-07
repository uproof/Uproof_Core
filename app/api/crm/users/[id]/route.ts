import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {checkRateLimit, RATE_LIMITS} from '@/lib/rateLimit';
import {canPerform} from '@/lib/permissions';
import {deleteCrmUser, getCrmUserById, updateCrmUser} from '@/lib/crmUsersStore';
import {verifyTotp} from '@/lib/mfa';

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
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const name = typeof body.name === 'string' ? body.name : undefined;
  const isActive = typeof body.isActive === 'boolean' ? body.isActive : undefined;
  const password = typeof body.password === 'string' ? body.password : undefined;
  const mfaSecret = typeof body.mfaSecret === 'string' ? body.mfaSecret : undefined;
  const authCode = typeof body.authCode === 'string' ? body.authCode.trim() : '';

  const current = await getCrmUserById(id);
  if (!current) {
    return NextResponse.json({ok: false, error: 'Sales user not found'}, {status: 404});
  }

  const passwordChanged = typeof password === 'string' && password.trim() && password.trim() !== (current.password || '');
  const mfaChanged = typeof mfaSecret === 'string' && mfaSecret.trim() && mfaSecret.trim() !== (current.mfaSecret || '');

  if ((passwordChanged && current.password) || (mfaChanged && current.mfaSecret)) {
    if (!verifyTotp('superadmin', authCode)) {
      return NextResponse.json({ok: false, error: 'MFA code required to update saved credentials'}, {status: 401});
    }
  }

  const user = await updateCrmUser({id, name, isActive, password, mfaSecret});
  if (!user) {
    return NextResponse.json({ok: false, error: 'Sales user not found'}, {status: 404});
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password,
      hasMfaSecret: !!user.mfaSecret,
      createdAt: user.createdAt,
      updatedAtUtc: user.updatedAtUtc,
    },
  });
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
