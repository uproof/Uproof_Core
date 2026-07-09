import {getDb, nowIso} from '@/lib/crmDb';
import {createSupabaseAdminClient} from '@/lib/supabase/server';

export type CrmUserActivity = {
  id: number;
  actorEmail: string;
  actorRole: string;
  action: string;
  leadId: string;
  detail: string;
  ip: string;
  createdAt: string;
};

type CrmUserActivityRow = {
  id: number;
  actor_email: string;
  actor_role: string;
  action: string;
  lead_id: string;
  detail: string;
  ip: string;
  created_at: string;
};

type LogCrmUserActivityInput = {
  actorEmail: string;
  actorRole: string;
  action: string;
  leadId?: string;
  detail?: string;
  ip?: string;
};

export async function logCrmUserActivity(input: LogCrmUserActivityInput) {
  const record = {
    actorEmail: input.actorEmail,
    actorRole: input.actorRole,
    action: input.action,
    leadId: input.leadId || '',
    detail: input.detail || '',
    ip: input.ip || 'unknown',
    createdAt: nowIso(),
  };

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from('crm_user_activity').insert({
      actor_email: record.actorEmail,
      actor_role: record.actorRole,
      action: record.action,
      detail: record.detail,
      ip: record.ip,
      created_at: record.createdAt,
    });
  }

  try {
    const db = getDb();
    db.prepare(
      `INSERT INTO crm_user_activity (
        actor_email, actor_role, action, lead_id, detail, ip, created_at
      ) VALUES (
        @actorEmail, @actorRole, @action, @leadId, @detail, @ip, @createdAt
      )`
    ).run(record);
  } catch {
    // Ignore local fallback failures when Supabase is available.
  }
}

export async function getRecentCrmUserActivity(limit = 100): Promise<CrmUserActivity[]> {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('crm_user_activity')
      .select('id,actor_email,actor_role,action,lead_id,detail,ip,created_at')
      .order('created_at', {ascending: false})
      .limit(limit);

    if (!error && Array.isArray(data)) {
      return data.map((row: CrmUserActivityRow) => ({
        id: row.id,
        actorEmail: row.actor_email,
        actorRole: row.actor_role,
        action: row.action,
        leadId: row.lead_id,
        detail: row.detail,
        ip: row.ip,
        createdAt: row.created_at,
      }));
    }
  }

  const db = getDb();
  const rows = db
    .prepare('SELECT * FROM crm_user_activity ORDER BY created_at DESC LIMIT ?')
    .all(limit) as CrmUserActivityRow[];

  return rows.map((row) => ({
    id: row.id,
    actorEmail: row.actor_email,
    actorRole: row.actor_role,
    action: row.action,
    leadId: row.lead_id,
    detail: row.detail,
    ip: row.ip,
    createdAt: row.created_at,
  }));
}
