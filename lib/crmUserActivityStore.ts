import {nowIso} from '@/lib/crmDb';
import {getApprovedSuperadminCredentials} from '@/lib/adminAuth';
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

function getOptionalSupabaseClient() {
  try {
    return createSupabaseAdminClient();
  } catch {
    return null;
  }
}

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

function getNotificationRecipients(actorEmail: string) {
  const approvedRecipients = getApprovedSuperadminCredentials().map((entry) => entry.email.trim().toLowerCase()).filter(Boolean);
  if (approvedRecipients.length > 0) {
    return approvedRecipients;
  }

  const normalizedActor = actorEmail.trim().toLowerCase();
  return normalizedActor ? [normalizedActor] : [];
}

export async function logCrmUserActivity(input: LogCrmUserActivityInput) {
  const actorEmail = input.actorEmail.trim().toLowerCase();
  const record = {
    actorEmail,
    actorRole: input.actorRole,
    action: input.action,
    leadId: input.leadId || '',
    detail: input.detail || '',
    ip: input.ip || 'unknown',
    createdAt: nowIso(),
  };

  const supabase = getOptionalSupabaseClient();
  if (supabase) {
    const activityResult = await supabase.from('crm_user_activity').insert({
      actor_email: record.actorEmail,
      actor_role: record.actorRole,
      action: record.action,
      detail: record.detail,
      ip: record.ip,
      created_at: record.createdAt,
    });

    const notification = record.action.startsWith('lead_')
      ? buildNotification(record.action, record.actorEmail, record.detail, record.leadId)
      : null;

    if (notification) {
      for (const recipientEmail of getNotificationRecipients(record.actorEmail)) {
        await supabase.from('notifications').insert({
          recipient_email: recipientEmail,
          title: notification.title,
          message: notification.message,
          link: notification.link,
          read_at: null,
          archived_at: null,
          created_at: record.createdAt,
        });
      }
    }

    if (activityResult.error) {
      console.warn('CRM activity insert failed:', activityResult.error);
    }
    return;
  }

  return;
}

export async function getRecentCrmUserActivity(limit = 100): Promise<CrmUserActivity[]> {
  const supabase = getOptionalSupabaseClient();
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

export async function clearCrmUserActivityByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return false;
  }

  const supabase = getOptionalSupabaseClient();
  if (supabase) {
    const {error} = await supabase
      .from('crm_user_activity')
      .delete()
      .ilike('actor_email', normalizedEmail);

    return !error;
  }

  return false;
}
