import settingsSeed from './workbook-seed/settings_v1.json';
import {runEstimate, type EstimateOutputs, type LeadTerms} from './workbook-engine/pipeline';
import type {InputValues} from './workbook-engine/context';
import {snapshotFromSeed, type SettingsOverrides, type SettingsSnapshot} from './workbook-engine/settings';
import {INPUT_FIELDS} from './workbook-engine/rules/inputs';
import type {CrmLead} from './crmMockData';

export const workbookSettings: SettingsSnapshot = snapshotFromSeed(settingsSeed as never, 1);

export function defaultWorkbookInputs(): InputValues {
  return Object.fromEntries(INPUT_FIELDS.map((input) => [input.key, null]));
}

export function workbookInputSchema() {
  return INPUT_FIELDS.map((input) => ({k: input.key, s: input.section, l: input.label, u: input.unit, d: input.derived, v: null}));
}

export function leadToWorkbook(lead: CrmLead) {
  const data = lead.estimatorData || {};
  const stored = {...defaultWorkbookInputs(), ...(data.workbookInputs || {})} as InputValues;
  const inputs: InputValues = {
    ...stored,
    crew_size: stored.crew_size,
    rafter_spacing_m: stored.rafter_spacing_m,
    cross_batten_width_m: stored.cross_batten_width_m,
  };
  const terms: LeadTerms = {
    client: lead.customer,
    address: lead.projectAddress || lead.address,
    discount: Number(data.offerDiscount || 0),
    vatRate: data.offerVatRate ? Number(data.offerVatRate) / 100 : 0.21,
    startDate: data.scheduleStartDate || null,
    skipWeekends: data.scheduleSkipWeekends === true,
    procurementIncludeLabor: data.procurementIncludeLabor !== false,
  };
  return {inputs, terms, leadTimes: data.engineOutputs?.leadTimes || {}, overrides: data.engineOutputs?.workbookOverrides};
}

export function workbookSettingsResponse() {
  return {
    version: {id: workbookSettings.versionId, importedAt: '2026-09-16', note: 'Workbook parity engine'},
    values: {
      materials: Object.values(workbookSettings.materials).map((m) => ({id: m.key, name: m.name, price: m.price, vat: m.vatFactor, supplier: m.supplier, isService: m.isService, leadTimeDays: m.leadTimeDays})),
      norms: Object.values(workbookSettings.laborNorms).map((n) => ({id: n.key, cat: n.category, name: n.name, op: n.operation, unit: n.unit, hours: n.hoursPerUnit})),
      sd: Object.values(workbookSettings.sheetMetal).map((d) => ({
        id: d.key,
        grp: d.group,
        name: d.name,
        w: d.blankWidthM,
        folds: d.folds,
        has: Object.fromEntries(Object.keys(workbookSettings.coilPrices).map((variant) => [variant, d.variants.includes(variant)])),
      })),
      coil: workbookSettings.coilPrices,
      fold_cost: workbookSettings.foldCostPerM,
      slope: workbookSettings.slopeAreaFactors,
      gaps: workbookSettings.battenGapRules,
      k: workbookSettings.constants,
    },
  };
}

export function calculateWorkbookEstimate(lead: CrmLead, inputs: InputValues, terms: LeadTerms, overrides?: SettingsOverrides | null, leadTimes?: Record<string, number>): EstimateOutputs & {leadId: string} {
  return {...runEstimate(workbookSettings, inputs, terms, {overrides, leadTimes}), leadId: lead.id};
}

export type WorkbookEstimate = ReturnType<typeof calculateWorkbookEstimate>;
