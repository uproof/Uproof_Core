import {createSupabaseAdminClient} from '@/lib/supabase/server';

export type CrmStorageMode = 'sqlite' | 'supabase';

export function getCrmStorageMode(): CrmStorageMode {
  return process.env.CRM_STORAGE_BACKEND?.trim().toLowerCase() === 'supabase' ? 'supabase' : 'sqlite';
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
