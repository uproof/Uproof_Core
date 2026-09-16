import type { EstimatorApi, EstimateOutputs, Lead, PreviewRequest, SettingsSnapshot } from './types';
import type { InputDef } from '@/workbook-ui/engine';

async function request<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(base + path, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...init });
  if (!res.ok) throw new Error(`${init?.method ?? 'GET'} ${path} failed with ${res.status}`);
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

/** Real backend. Endpoints follow ENGINE_SPEC.md section 11.4. */
export function createHttpApi(baseUrl: string): EstimatorApi {
  return {
    getActiveSettings: () => request<SettingsSnapshot>(baseUrl, '/settings/active'),
    getInputSchema: () => request<InputDef[]>(baseUrl, '/inputs/schema'),
    getLead: (id) => request<Lead>(baseUrl, `/leads/${encodeURIComponent(id)}`),
    saveLead: (lead) => request<void>(baseUrl, `/leads/${encodeURIComponent(lead.id)}`, { method: 'PUT', body: JSON.stringify(lead) }),
    previewEstimate: (req: PreviewRequest) =>
      request<EstimateOutputs>(baseUrl, `/leads/${encodeURIComponent(req.leadId)}/estimates/preview`, { method: 'POST', body: JSON.stringify(req) }),
  };
}
