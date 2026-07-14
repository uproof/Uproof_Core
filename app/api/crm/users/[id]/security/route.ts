import {randomUUID} from 'crypto';
import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {canPerform} from '@/lib/permissions';
import {createSupabaseAdminClient} from '@/lib/supabase/server';
import {
  getCrmLeadStatusSnapshot,
  getCrmUserActivitySnapshot,
  changeCrmUserPassword,
  disableCrmUser,
  deleteCrmUser,
  getCrmUserById,
  getCrmUserByEmail,
  issuePasswordResetToken,
  revokeCrmUserSessions,
} from '@/lib/crmUsersStore';
import {validatePasswordPolicy} from '@/lib/secretVault';

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

export async function POST(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (!canPerform(session.role, 'createCrmUsers')) {
    return NextResponse.json({ok: false, error: 'Only superadmin can manage CRM security'}, {status: 403});
  }

  const {id} = await params;
  const target = await getCrmUserById(id);
  if (!target) {
    return NextResponse.json({ok: false, error: 'CRM user not found'}, {status: 404});
  }

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const action = String(body.action || '').trim();
  const reason = String(body.reason || '').trim();
  const adminPassword = String(body.adminPassword || '').trim();

  if (adminPassword) {
    const supabase = createSupabaseAdminClient();
    const {error} = await supabase?.auth.signInWithPassword({email: session.email, password: adminPassword}) || {error: new Error('Supabase unavailable')};
    if (error) {
      return NextResponse.json({ok: false, error: 'Super admin re-authentication failed'}, {status: 401});
    }
  }

  const requestId = randomUUID();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  switch (action) {
    case 'export-user-data': {
      const [activity, leads] = await Promise.all([
        getCrmUserActivitySnapshot(target.email),
        getCrmLeadStatusSnapshot(target.id),
      ]);
      const payload = {
        exportedAt: new Date().toISOString(),
        user: {
          id: target.id,
          email: target.email,
          name: target.name,
          role: target.role,
          isActive: target.isActive,
          hasPassword: false,
          sessionValidAfter: target.sessionValidAfter || '',
          archivedAt: target.archivedAt || '',
          createdAt: target.createdAt,
          updatedAtUtc: target.updatedAtUtc,
        },
        leadSnapshot: leads,
        activity,
      };

      await recordAuditLog({
        requestId,
        actorEmail: session.email,
        actorRole: session.role,
        action: 'crm_user_export_data',
        entityType: 'crm_user',
        entityId: target.id,
        detail: reason || 'Exported CRM user data snapshot',
        success: true,
      });

      return NextResponse.json({ok: true, payload});
    }
    case 'delete-user': {
      const [activity, leads] = await Promise.all([
        getCrmUserActivitySnapshot(target.email),
        getCrmLeadStatusSnapshot(target.id),
      ]);

      const userDeleted = await deleteCrmUser(target.id);
      if (!userDeleted) {
        return NextResponse.json({ok: false, error: 'CRM user not found'}, {status: 404});
      }

      await recordAuditLog({
        requestId,
        actorEmail: session.email,
        actorRole: session.role,
        action: 'crm_user_delete',
        entityType: 'crm_user',
        entityId: target.id,
        detail: reason || `Deleted CRM user and unassigned ${leads.length} leads`,
        success: true,
      });

        return NextResponse.json({
          ok: true,
          deleted: true,
          snapshot: {
            user: {
              id: target.id,
              email: target.email,
              name: target.name,
              role: target.role,
              isActive: target.isActive,
              createdAt: target.createdAt,
              updatedAtUtc: target.updatedAtUtc,
            },
            leadSnapshot: leads,
            activity,
          },
        });
    }
    case 'reset-password': {
      const reset = await issuePasswordResetToken(target.id, session.email);
      await recordAuditLog({
        requestId,
        actorEmail: session.email,
        actorRole: session.role,
        action: 'crm_user_reset_password',
        entityType: 'crm_user',
        entityId: target.id,
        detail: reason || 'Password reset link issued',
        success: true,
      });
      return NextResponse.json({ok: true, expiresAt: reset.expiresAt});
    }
    case 'revoke-sessions': {
      const user = await revokeCrmUserSessions(target.id);
      if (!user) {
        return NextResponse.json({ok: false, error: 'CRM user not found'}, {status: 404});
      }
      await recordAuditLog({
        requestId,
        actorEmail: session.email,
        actorRole: session.role,
        action: 'crm_user_revoke_sessions',
        entityType: 'crm_user',
        entityId: target.id,
        detail: reason || 'Sessions invalidated',
        success: true,
      });
      return NextResponse.json({ok: true, user: {id: user.id, sessionValidAfter: user.sessionValidAfter}});
    }
    case 'disable-account': {
      const user = await disableCrmUser(target.id);
      if (!user) {
        return NextResponse.json({ok: false, error: 'CRM user not found'}, {status: 404});
      }
      await recordAuditLog({
        requestId,
        actorEmail: session.email,
        actorRole: session.role,
        action: 'crm_user_disable',
        entityType: 'crm_user',
        entityId: target.id,
        detail: reason || 'Account disabled',
        success: true,
      });
      return NextResponse.json({ok: true, user: {id: user.id, isActive: user.isActive}});
    }
    case 'archive-account': {
      const deleted = await deleteCrmUser(target.id);
      if (!deleted) {
        return NextResponse.json({ok: false, error: 'CRM user not found'}, {status: 404});
      }
      await recordAuditLog({
        requestId,
        actorEmail: session.email,
        actorRole: session.role,
        action: 'crm_user_archive',
        entityType: 'crm_user',
        entityId: target.id,
        detail: reason || 'Account deleted',
        success: true,
      });
      return NextResponse.json({ok: true, deleted: true});
    }
    case 'set-password': {
      const newPassword = String(body.newPassword || '').trim();
      if (!newPassword) {
        return NextResponse.json({ok: false, error: 'New password is required'}, {status: 400});
      }

      const passwordPolicyError = validatePasswordPolicy(newPassword);
      if (passwordPolicyError) {
        return NextResponse.json({ok: false, error: passwordPolicyError}, {status: 400});
      }

      const user = await changeCrmUserPassword(target.id, newPassword);
      if (!user) {
        return NextResponse.json({ok: false, error: 'CRM user not found'}, {status: 404});
      }

      await recordAuditLog({
        requestId,
        actorEmail: session.email,
        actorRole: session.role,
        action: 'crm_user_set_password',
        entityType: 'crm_user',
        entityId: target.id,
        detail: reason || 'Password updated by superadmin',
        success: true,
      });
      return NextResponse.json({ok: true, user: {id: user.id, email: user.email}});
    }
    default:
      return NextResponse.json({ok: false, error: 'Unsupported action'}, {status: 400});
  }
}