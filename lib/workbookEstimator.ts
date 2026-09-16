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
  const numeric = (value: unknown) => {
    const parsed = Number(String(value ?? '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const area = numeric(data.existingRoofArea);
  const pitch = numeric(data.roofPitch);
  const inputs: InputValues = {
    ...stored,
    seam_rukki_m2: stored.seam_rukki_m2 || area,
    batten_area_m2: stored.batten_area_m2 || area,
    membrane_area_m2: stored.membrane_area_m2 || area,
    roof_slope_deg: stored.roof_slope_deg || pitch,
    crew_size: stored.crew_size || 3,
    rafter_spacing_m: stored.rafter_spacing_m || 0.6,
    cross_batten_width_m: stored.cross_batten_width_m || 0.1,
  };
  const terms: LeadTerms = {
    client: lead.customer,
    address: lead.projectAddress || lead.address,
    discount: Number(data.offerDiscount || 2000),
    vatRate: Number(data.offerVatRate || 0),
    startDate: data.scheduleStartDate || null,
    skipWeekends: false,
    procurementIncludeLabor: true,
  };
  return {inputs, terms, overrides: data.engineOutputs?.workbookOverrides};
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

export function calculateWorkbookEstimate(lead: CrmLead, inputs: InputValues, terms: LeadTerms, overrides?: SettingsOverrides | null): EstimateOutputs & {leadId: string} {
  return {...runEstimate(workbookSettings, inputs, terms, {overrides}), leadId: lead.id};
}

export type WorkbookEstimate = ReturnType<typeof calculateWorkbookEstimate>;
