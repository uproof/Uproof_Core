import bundleJson from './workbook-engine/engineBundle.json';
import {runEstimate, type EngineBundle, type EngineSettings, type InputValues, type LeadTerms} from './workbook-engine';
import type {CrmLead} from './crmMockData';

export const workbookBundle = bundleJson as unknown as EngineBundle;

export type WorkbookSettingsOverrides = {
  materials?: Record<string, number | null>;
  norms?: Record<string, number | null>;
  coil?: Record<string, number>;
  constants?: Record<string, number>;
};

export function defaultWorkbookInputs(): InputValues {
  return Object.fromEntries(workbookBundle.inputs.map((input) => [input.k, input.v]));
}

export function workbookInputSchema() {
  return workbookBundle.inputs;
}

function applyOverrides(base: EngineSettings, overrides: WorkbookSettingsOverrides = {}): EngineSettings {
  const settings: EngineSettings = JSON.parse(JSON.stringify(base));
  const materials = overrides.materials || {};
  const norms = overrides.norms || {};
  for (const material of settings.materials) {
    if (Object.prototype.hasOwnProperty.call(materials, material.id)) material.price = materials[material.id];
  }
  for (const norm of settings.norms) {
    if (Object.prototype.hasOwnProperty.call(norms, norm.id)) norm.hours = norms[norm.id];
  }
  settings.coil = {...settings.coil, ...(overrides.coil || {})};
  settings.k = {...settings.k, ...(overrides.constants || {})};
  return settings;
}

export function leadToWorkbook(lead: CrmLead) {
  const data = lead.estimatorData || {};
  const storedInputs = data.workbookInputs && typeof data.workbookInputs === 'object' ? data.workbookInputs : {};
  const inputs = {...defaultWorkbookInputs(), ...storedInputs} as InputValues;
  const terms: LeadTerms = {
    client: lead.customer,
    address: lead.projectAddress || lead.address,
    discount: Number(data.offerDiscount || 2000),
    vatRate: Number(data.offerVatRate || 0),
    startDate: data.scheduleStartDate || '',
  };
  return {inputs, terms};
}

export function calculateWorkbookEstimate(lead: CrmLead, inputs: InputValues, terms: LeadTerms, overrides?: WorkbookSettingsOverrides) {
  const result = runEstimate(workbookBundle, applyOverrides(workbookBundle.settings, overrides), inputs, terms);
  const materialLines = result.lines.filter((line) => line.materials > 0);
  const materialsList = [{
    supplier: 'Workbook materials',
    kind: 'supplier' as const,
    total: materialLines.reduce((sum, line) => sum + line.materials, 0),
    items: materialLines.map((line) => ({name: line.name, unit: line.unit, qty: line.qtyRes, cost: line.materials, usedIn: [line.block]})),
  }];
  const toolMap = new Map<string, {key: string; name: string; usedIn: string[]}>();
  result.lines.forEach((line) => line.tools.forEach((name) => {
    const key = name.trim();
    if (!key) return;
    const item = toolMap.get(key) || {key, name: key, usedIn: []};
    if (!item.usedIn.includes(line.name)) item.usedIn.push(line.name);
    toolMap.set(key, item);
  }));
  return {...result, materialsList, tools: [...toolMap.values()], leadId: lead.id};
}

export type WorkbookEstimate = ReturnType<typeof calculateWorkbookEstimate>;
