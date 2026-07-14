import {createSupabaseAdminClient} from '@/lib/supabase/server';
import {isSupabaseConfigured} from '@/lib/supabase/config';

export type CrmStorageMode = 'sqlite' | 'supabase';

export function getCrmStorageMode(): CrmStorageMode {
  const configuredMode = process.env.CRM_STORAGE_BACKEND?.trim().toLowerCase();
  if (configuredMode === 'supabase' || configuredMode === 'sqlite') {
    return configuredMode;
  }

  return isSupabaseConfigured() ? 'supabase' : 'sqlite';
}

export function createCrmSupabaseClient() {
  if (getCrmStorageMode() !== 'supabase') {
    return null;
  }

  const client = createSupabaseAdminClient();
  if (!client) {
    throw new Error('CRM_STORAGE_BACKEND is set to supabase, but Supabase credentials are missing');
  }

  return client;
}
