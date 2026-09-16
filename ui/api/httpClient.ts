import type { ApiError, EstimatorApi } from './types';

async function request<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(base + path, { headers: { 'Content-Type': 'application/json' }, ...init });
  if (!res.ok) {
    let message = `${init?.method ?? 'GET'} ${path} failed with ${res.status}`;
    let fields: Record<string, string> | undefined;
    try {
      const body = await res.json();
      const detail = body?.detail;
      if (typeof detail === 'string') message = detail;
      else if (detail?.message) { message = detail.message; fields = detail.fields; }
    } catch { /* not JSON */ }
    throw { status: res.status, message, fields } satisfies ApiError;
  }
  return (await res.json()) as T;
}

const enc = encodeURIComponent;

/** FastAPI backend client. Endpoints: see uproof-estimator-api/app/api/routes.py. */
export function createHttpApi(baseUrl: string): EstimatorApi {
  const get = <T,>(p: string) => request<T>(baseUrl, p);
  const send = <T,>(method: string, p: string, body?: unknown) => request<T>(baseUrl, p, { method, body: body === undefined ? undefined : JSON.stringify(body) });
  return {
    getActiveSettings: () => get('/settings/active'),
    listSettingsVersions: () => get('/settings/versions'),
    createSettingsVersion: (change) => send('POST', '/settings/versions', change),
    getInputSchema: () => get('/inputs/schema'),
    getOfferTemplate: () => get('/templates/offer'),
    getF2Layout: () => get('/templates/f2-layout'),
    getLead: (id) => get(`/leads/${enc(id)}`),
    saveLead: (lead) => send('PUT', `/leads/${enc(lead.id)}`, lead),
    previewEstimate: (id, req) => send('POST', `/leads/${enc(id)}/estimates/preview`, req),
    saveEstimate: (id) => send('POST', `/leads/${enc(id)}/estimates`),
    listEstimates: (id) => get(`/leads/${enc(id)}/estimates`),
  };
}
