import { EngineCore } from './core';
import { buildSummary } from './aggregations/summary';
import { buildF2 } from './aggregations/f2';
import { buildOffer } from './aggregations/offer';
import { buildWorkPlan, buildCashFlow } from './aggregations/schedule';
import type { EngineBundle, EngineSettings, InputValues, LeadTerms } from './types';

export * from './types';
export { EngineCore } from './core';
export { OFFER_MATERIAL_LINES } from './aggregations/offer';

/** Inputs that are computed from other inputs (chimney areas, soffit area). */
export function deriveInputs(inputs: InputValues): InputValues {
  const out = { ...inputs };
  const num = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);
  for (const key of Object.keys(out)) {
    let m = key.match(/^(chimney_(?:rebuild|plaster|cladding)_\d)_area_m2$/);
    if (m) out[key] = num(out[`${m[1]}_perimeter_m`]) * num(out[`${m[1]}_height_m`]);
    m = key.match(/^(chimney_cap_(?:plain|screen)_\d)_area_m2$/);
    if (m) out[key] = num(out[`${m[1]}_length_m`]) * num(out[`${m[1]}_width_m`]);
  }
  out.soffit_area_m2 = num(out.soffit_length_m) * num(out.soffit_width_m);
  return out;
}

/** Full pipeline: settings snapshot + lead inputs + terms -> all outputs. */
export function runEstimate(bundle: EngineBundle, settings: EngineSettings, rawInputs: InputValues, terms: LeadTerms, core = new EngineCore(bundle)) {
  const inputs = deriveInputs(rawInputs);
  core.setData(settings, inputs);
  const summary = buildSummary(core);
  const f2 = buildF2(core);
  const offer = buildOffer(core, f2, summary, terms);
  const workPlan = buildWorkPlan(core);
  const cashFlow = buildCashFlow(core, offer.total, summary);
  return { inputs, lines: core.lines(), summary, f2, offer, workPlan, cashFlow };
}
export type EngineRun = ReturnType<typeof runEstimate>;
