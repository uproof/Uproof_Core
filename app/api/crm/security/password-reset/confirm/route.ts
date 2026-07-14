import {randomUUID} from 'crypto';
import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/crmDb';
import {createSupabaseAdminClient} from '@/lib/supabase/server';
import {consumePasswordResetToken} from '@/lib/crmUsersStore';
import {validatePasswordPolicy} from '@/lib/secretVault';
import {parsePassword, parseResetToken} from '@/lib/authValidation';

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
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const token = parseResetToken(body.token);
  const newPassword = parsePassword(body.newPassword);

  if (!token || !newPassword) {
    return NextResponse.json({ok: false, error: 'Token and new password are required'}, {status: 400});
  }

  const passwordPolicyError = validatePasswordPolicy(newPassword);
  if (passwordPolicyError) {
    return NextResponse.json({ok: false, error: passwordPolicyError}, {status: 400});
  }

  const user = await consumePasswordResetToken(token, newPassword);
  if (!user) {
    return NextResponse.json({ok: false, error: 'Unable to reset password'}, {status: 400});
  }

  await recordAuditLog({
    requestId: randomUUID(),
    actorEmail: user.email,
    actorRole: user.role,
    action: 'crm_password_reset_confirmed',
    entityType: 'crm_user',
    entityId: user.id,
    detail: 'Password reset token consumed',
    success: true,
  });

  return NextResponse.json({ok: true});
}