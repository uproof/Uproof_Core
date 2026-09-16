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
  const inputs = {...defaultWorkbookInputs(), ...(data.workbookInputs || {})} as InputValues;
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

export function calculateWorkbookEstimate(lead: CrmLead, inputs: InputValues, terms: LeadTerms, overrides?: SettingsOverrides | null): EstimateOutputs & {leadId: string} {
  return {...runEstimate(workbookSettings, inputs, terms, {overrides}), leadId: lead.id};
}

export type WorkbookEstimate = ReturnType<typeof calculateWorkbookEstimate>;
