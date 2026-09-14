import {createCrmSupabaseClient} from '@/lib/crmStorage';
import {createDefaultEstimatorSettings} from '@/lib/estimatorReferenceData';

const SETTINGS_ID = 'default';

export type EstimatorSettings = ReturnType<typeof createDefaultEstimatorSettings>;

export async function getEstimatorSettings(): Promise<EstimatorSettings> {
  const supabase = createCrmSupabaseClient();
  const {data, error} = await supabase.from('estimator_settings').select('settings').eq('id', SETTINGS_ID).maybeSingle();
  if (error) throw error;
  if (data?.settings) return {...createDefaultEstimatorSettings(), ...(data.settings as Partial<EstimatorSettings>)};
  const defaults = createDefaultEstimatorSettings();
  await supabase.from('estimator_settings').upsert({id: SETTINGS_ID, settings: defaults}, {onConflict: 'id'});
  return defaults;
}

export async function saveEstimatorSettings(settings: unknown): Promise<EstimatorSettings> {
  const supabase = createCrmSupabaseClient();
  const next = {...createDefaultEstimatorSettings(), ...(settings as Partial<EstimatorSettings>)};
  const {data, error} = await supabase.from('estimator_settings').upsert({id: SETTINGS_ID, settings: next}, {onConflict: 'id'}).select('settings').single();
  if (error) throw error;
  return data.settings as EstimatorSettings;
}