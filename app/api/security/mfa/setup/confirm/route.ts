import {randomUUID} from 'crypto';
import {NextRequest, NextResponse} from 'next/server';
import {getMfaSetupSession} from '@/lib/adminAuth';
import {verifyPendingMfaEnrollment, verifyTotpSecret} from '@/lib/mfa';
import {getDb} from '@/lib/crmDb';
import {createSupabaseAdminClient} from '@/lib/supabase/server';
import {replaceRecoveryCodes, setCrmUserMfaSecret, getCrmUserByEmail, getPlainMfaSecret} from '@/lib/crmUsersStore';

async function recordAuditLog(entry: {
  requestId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  detail: string;
  success: boolean;
}) {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from('audit_log').insert({
      request_id: entry.requestId,
      actor_email: entry.actorEmail,
      actor_role: entry.actorRole,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      detail: entry.detail,
      success: entry.success,
      created_at: new Date().toISOString(),
    });
  }

  try {
    const db = getDb();
    db.prepare(
      `INSERT INTO audit_log (
        request_id, actor_email, actor_role, action, entity_type, entity_id, detail, success, created_at
      ) VALUES (
        @requestId, @actorEmail, @actorRole, @action, @entityType, @entityId, @detail, @success, @createdAt
      )`
    ).run({
      ...entry,
      success: entry.success ? 1 : 0,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // noop
  }
}

export async function POST(req: NextRequest) {
  const session = await getMfaSetupSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const scope = String(body.scope || '').trim();
  const enrollmentToken = String(body.enrollmentToken || '').trim();
  const code = String(body.code || '').trim();

  if (!enrollmentToken || !code) {
    return NextResponse.json({ok: false, error: 'Enrollment token and code are required'}, {status: 400});
  }

  const pending = verifyPendingMfaEnrollment(enrollmentToken);
  if (!pending || pending.email !== session.email || pending.role !== session.role) {
    return NextResponse.json({ok: false, error: 'Enrollment token is invalid'}, {status: 400});
  }

  if (!verifyTotpSecret(pending.secret, code)) {
    return NextResponse.json({ok: false, error: 'Invalid authenticator code'}, {status: 400});
  }

  const user = await getCrmUserByEmail(session.email);
  if (!user) {
    return NextResponse.json({ok: false, error: 'Account not found'}, {status: 404});
  }

  const alreadyConfigured = getPlainMfaSecret(user);
  if (alreadyConfigured) {
    return NextResponse.json({ok: true, recoveryCodes: await replaceRecoveryCodes(user.id, 10)});
  }

  const updated = await setCrmUserMfaSecret(user.id, pending.secret);
  if (!updated) {
    return NextResponse.json({ok: false, error: 'Failed to save MFA secret'}, {status: 500});
  }

  const recoveryCodes = await replaceRecoveryCodes(user.id, 10);

  await recordAuditLog({
    requestId: randomUUID(),
    actorEmail: session.email,
    actorRole: session.role,
    action: scope === 'admin' ? 'admin_mfa_enrolled' : 'crm_mfa_enrolled',
    entityType: 'crm_user',
    entityId: user.id,
    detail: `Authenticator enrolled for ${session.role}`,
    success: true,
  });

  return NextResponse.json({ok: true, recoveryCodes});
}