/** Full calculation: settings snapshot + lead inputs + terms -> every output. */
import { Context, type InputValues } from './context';
import { buildF2 } from './aggregations/f2';
import { buildLines, buildMaterialsList, buildTools } from './aggregations/lines';
import { buildOffer } from './aggregations/offer';
import { buildProcurement } from './aggregations/procurement';
import { buildCashFlow, buildDayPlan, buildWorkPlan } from './aggregations/schedule';
import { summarize } from './aggregations/summary';
import { todayIso } from './aggregations/dates';
import { withOverrides, type SettingsOverrides, type SettingsSnapshot } from './settings';

export const ENGINE_VERSION = '2.0.0-compat';

export interface LeadTerms {
  client?: string; address?: string; discount?: number; vatRate?: number; startDate?: string | null;
  skipWeekends?: boolean; procurementIncludeLabor?: boolean;
}

/** Inputs the formulas divide by. The workbook shows #DIV/0! when they are empty; the API rejects them instead. */
export const REQUIRED_POSITIVE: Record<string, string> = {
  crew_size: 'Crew size must be at least 1',
  rafter_spacing_m: 'Rafter spacing must be greater than 0',
  cross_batten_width_m: 'Cross batten width must be greater than 0',
};

export class InputValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super(Object.entries(errors).map(([k, v]) => `${k}: ${v}`).join('; '));
  }
}

export function validateInputs(inputs: InputValues): void {
  const errors: Record<string, string> = {};
  for (const [k, msg] of Object.entries(REQUIRED_POSITIVE)) {
    const v = inputs[k];
    if (!(typeof v === 'number' && v > 0)) errors[k] = msg;
  }
  if (Object.keys(errors).length) throw new InputValidationError(errors);
}

/** Chimney areas (perimeter × height or length × width) and soffit area. */
export function deriveInputs(inputs: InputValues): InputValues {
  const out: InputValues = { ...inputs };
  const n = (k: string) => (typeof out[k] === 'number' ? (out[k] as number) : 0);
  const groups: [string, number, string, string][] = [['rebuild', 6, 'perimeter_m', 'height_m'], ['plaster', 5, 'perimeter_m', 'height_m'],
    ['cladding', 7, 'perimeter_m', 'height_m'], ['cap_plain', 4, 'length_m', 'width_m'], ['cap_screen', 3, 'length_m', 'width_m']];
  for (const [kind, count, a, b] of groups) {
    for (let i = 1; i <= count; i++) {
      const p = `chimney_${kind}_${i}`;
      out[`${p}_area_m2`] = n(`${p}_${a}`) * n(`${p}_${b}`);
    }
  }
  out.soffit_area_m2 = n('soffit_length_m') * n('soffit_width_m');
  return out;
}

export interface RunOptions { leadTimes?: Record<string, number>; overrides?: SettingsOverrides | null; today?: string }

export function runEstimate(settings: SettingsSnapshot, inputs: InputValues, terms: LeadTerms, opts: RunOptions = {}) {
  const effective = withOverrides(settings, opts.overrides);
  validateInputs(inputs);
  const values = deriveInputs(inputs);
  const c = new Context(effective, values);
  const summary = summarize(c);
  const f2 = buildF2(c);
  const offer = buildOffer(c, f2, summary, terms);
  const lines = buildLines(c);
  const workPlan = buildWorkPlan(c);
  const dayPlan = buildDayPlan(workPlan, terms.startDate || todayIso(), !!terms.skipWeekends);
  return {
    engineVersion: ENGINE_VERSION,
    settingsVersionId: effective.versionId,
    inputs: values,
    constants: { ...effective.constants },
    lines,
    summary,
    f2,
    offer,
    workPlan,
    dayPlan,
    cashFlow: buildCashFlow(c, offer.total, summary),
    materialsList: buildMaterialsList(c, lines),
    tools: buildTools(lines),
    procurement: buildProcurement(c, lines, dayPlan, opts.leadTimes ?? {}, terms.procurementIncludeLabor ?? true, opts.today ?? todayIso()),
  };
}
export type EstimateOutputs = ReturnType<typeof runEstimate>;
