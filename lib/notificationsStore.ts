import {nowIso} from '@/lib/crmDb';
import {createSupabaseAdminClient} from '@/lib/supabase/server';

export type NotificationItem = {
  id: string;
  recipientEmail: string;
  title: string;
  message: string;
  link: string;
  readAt: string;
  archivedAt: string;
  createdAt: string;
};

type NotificationRow = {
  id: number;
  recipient_email: string;
  title: string;
  message: string;
  link: string;
  read_at: string;
  archived_at: string;
  created_at: string;
};

function rowToNotification(row: NotificationRow): NotificationItem {
  return {
    id: String(row.id),
    recipientEmail: row.recipient_email,
    title: row.title,
    message: row.message,
    link: row.link || '',
    readAt: row.read_at || '',
    archivedAt: row.archived_at || '',
    createdAt: row.created_at,
  };
}

export async function getNotificationsForEmail(email: string, limit = 20): Promise<NotificationItem[]> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('notifications')
      .select('id,recipient_email,title,message,link,read_at,archived_at,created_at')
      .eq('recipient_email', normalizedEmail)
      .is('archived_at', null)
      .order('created_at', {ascending: false})
      .limit(limit);

    if (!error && Array.isArray(data)) {
      return data.map((entry: NotificationRow) => rowToNotification(entry));
    }
  }

  return [];
}

export async function markNotificationRead(notificationId: string, recipientEmail: string) {
  const normalizedEmail = recipientEmail.trim().toLowerCase();
  if (!notificationId || !normalizedEmail) {
    return false;
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {error} = await supabase
      .from('notifications')
      .update({read_at: nowIso()})
      .eq('id', notificationId)
      .eq('recipient_email', normalizedEmail);

    return !error;
  }

  return false;
}

export async function markAllNotificationsRead(recipientEmail: string) {
  const normalizedEmail = recipientEmail.trim().toLowerCase();
  if (!normalizedEmail) {
    return false;
  }

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {error} = await supabase
      .from('notifications')
      .update({read_at: nowIso()})
      .eq('recipient_email', normalizedEmail)
      .is('read_at', null);

    return !error;
  }

  return false;
}