import {randomUUID} from 'crypto';
import {NextRequest, NextResponse} from 'next/server';
import {createSupabaseAdminClient} from '@/lib/supabase/server';
import {consumePasswordResetToken} from '@/lib/crmUsersStore';
import {validatePasswordPolicy} from '@/lib/secretVault';
import {z} from 'zod';

const confirmResetSchema = z.object({
  token: z.string().trim().min(32, 'Invalid token'),
  newPassword: z.string().trim().min(8, 'Password must be at least 8 characters'),
});

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
}

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => ({}));
  const validation = confirmResetSchema.safeParse(json);

  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message || 'Invalid input';
    return NextResponse.json({ok: false, error: firstError}, {status: 400});
  }

  const {token, newPassword} = validation.data;

  const passwordPolicyError = validatePasswordPolicy(newPassword);
  if (passwordPolicyError) {
    return NextResponse.json({ok: false, error: passwordPolicyError}, {status: 400});
  }

  const user = await consumePasswordResetToken(token, newPassword);
  if (!user) {
    return NextResponse.json({ok: false, error: 'Invalid or expired reset token'}, {status: 400});
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
