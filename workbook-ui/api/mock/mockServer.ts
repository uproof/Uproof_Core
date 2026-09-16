import bundleJson from '@/workbook-ui/data/engineBundle.json';
import { EngineCore, runEstimate, type EngineBundle, type EngineSettings, type InputValues } from '@/workbook-ui/engine';
import type { EstimatorApi, Lead, SettingsOverrides } from '../types';
import { buildMaterialsList } from './buildMaterialsList';
import { buildToolList } from './buildToolList';
import { storage } from '@/workbook-ui/lib/storage';
import { resolveName } from './names';

const bundle = bundleJson as unknown as EngineBundle;
const core = new EngineCore(bundle);
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

/** What the backend does before running the engine: apply per-estimate overrides to the settings version. */
export function applyOverrides(base: EngineSettings, o: SettingsOverrides): EngineSettings {
  const s = clone(base);
  s.materials.forEach((m) => { if (m.id in o.materials) m.price = o.materials[m.id]; });
  s.norms.forEach((n) => { if (n.id in o.norms) n.hours = o.norms[n.id]; });
  Object.assign(s.coil, o.coil);
  Object.assign(s.k, o.constants);
  return s;
}

const demoLead = (id: string): Lead => ({
  id,
  terms: { client: 'Privātpersona', address: 'Jāņupītes iela 3, Dimzukalns', discount: 2000, vatRate: 0, startDate: '2026-09-08' },
  inputs: Object.fromEntries(bundle.inputs.map((i) => [i.k, i.v])) as InputValues,
});

/** In-browser stand-in for the FastAPI backend. Swap with createHttpApi() via VITE_API_URL. */
export const mockApi: EstimatorApi = {
  async getActiveSettings() {
    return { version: { id: 1, importedAt: '2026-09-15', note: 'Imported from workbook' }, values: bundle.settings };
  },
  async getInputSchema() {
    return bundle.inputs.filter((i) => !i.k.startsWith('bug_'));
  },
  async getLead(id) {
    return storage.get<Lead>(`lead:${id}`) ?? demoLead(id);
  },
  async saveLead(lead) {
    storage.set(`lead:${lead.id}`, lead);
  },
  async previewEstimate(req) {
    const settings = applyOverrides(bundle.settings, req.overrides);
    const run = runEstimate(bundle, settings, req.inputs, req.terms, core);
    const nameCtx = { bundle, inputs: run.inputs };
    const name = (v: string | null | undefined) => resolveName(v, nameCtx);
    // The backend returns display-ready names; catalog references are resolved here.
    const lines = run.lines.map((l) => ({ ...l, name: name(l.name), block: name(l.block) }));
    return {
      ...run,
      constants: settings.k,
      lines,
      f2: { ...run.f2, rows: run.f2.rows.map((r) => (r.name ? { ...r, name: name(r.name) } : r)) },
      workPlan: run.workPlan.map((w) => ({ ...w, task: name(w.task) })),
      materialsList: buildMaterialsList(lines, settings),
      tools: buildToolList(lines),
    };
  },
};
