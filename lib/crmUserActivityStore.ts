import {nowIso} from '@/lib/crmDb';
import {createCrmSupabaseClient as createSupabaseAdminClient} from '@/lib/crmStorage';

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

function buildNotification(action: string, actorEmail: string, detail: string, leadId: string) {
  const normalizedLeadId = leadId.trim();
  const actor = actorEmail.trim();

  switch (action) {
    case 'lead_create':
      return {
        title: 'New lead created',
        message: normalizedLeadId ? `Lead ${normalizedLeadId} was created by ${actor}.` : `A new lead was created by ${actor}.`,
        link: normalizedLeadId ? `/admin/crm/leads/${normalizedLeadId.toLowerCase()}` : '/admin/crm/leads',
      };
    case 'lead_update':
      return {
        title: 'Lead saved',
        message: normalizedLeadId ? `Lead ${normalizedLeadId} was saved by ${actor}.` : `A lead was saved by ${actor}.`,
        link: normalizedLeadId ? `/admin/crm/leads/${normalizedLeadId.toLowerCase()}` : '/admin/crm/leads',
      };
    case 'lead_delete':
      return {
        title: 'Lead deleted',
        message: normalizedLeadId ? `Lead ${normalizedLeadId} was deleted by ${actor}.` : `A lead was deleted by ${actor}.`,
        link: '/admin/crm/leads',
      };
    case 'lead_assign':
      return {
        title: 'Lead assigned',
        message: normalizedLeadId ? `Lead ${normalizedLeadId} was assigned by ${actor}.` : `A lead was assigned by ${actor}.`,
        link: normalizedLeadId ? `/admin/crm/leads/${normalizedLeadId.toLowerCase()}` : '/admin/crm/leads',
      };
    case 'lead_unassign':
      return {
        title: 'Lead unassigned',
        message: normalizedLeadId ? `Lead ${normalizedLeadId} was unassigned by ${actor}.` : `A lead was unassigned by ${actor}.`,
        link: normalizedLeadId ? `/admin/crm/leads/${normalizedLeadId.toLowerCase()}` : '/admin/crm/leads',
      };
    default:
      return detail
        ? {
            title: 'CRM activity',
            message: detail,
            link: normalizedLeadId ? `/admin/crm/leads/${normalizedLeadId.toLowerCase()}` : '/admin/crm/leads',
          }
        : null;
  }
}

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
    const activityResult = await supabase.from('crm_user_activity').insert({
      actor_email: record.actorEmail,
      actor_role: record.actorRole,
      action: record.action,
      detail: record.detail,
      ip: record.ip,
      created_at: record.createdAt,
    });

    if (!activityResult.error) {
      const notification = record.action.startsWith('lead_')
        ? buildNotification(record.action, record.actorEmail, record.detail, record.leadId)
        : null;

      if (notification) {
        await supabase.from('notifications').insert({
          recipient_email: record.actorEmail,
          title: notification.title,
          message: notification.message,
          link: notification.link,
          read_at: '',
          archived_at: '',
          created_at: record.createdAt,
        });
      }
    }
    return;
  }

  return;
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

  return [];
}
