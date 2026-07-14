import {createSupabaseAdminClient} from '@/lib/supabase/server';
import {isSupabaseConfigured} from '@/lib/supabase/config';

export type CrmStorageMode = 'supabase';

export function getCrmStorageMode(): CrmStorageMode {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials are required for CRM storage');
  }

  return 'supabase';
}

export function createCrmSupabaseClient() {
  getCrmStorageMode();

  const client = createSupabaseAdminClient();
  if (!client) {
    throw new Error('Supabase credentials are missing');
  }

  return client;
}
