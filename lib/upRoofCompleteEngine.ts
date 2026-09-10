import {createEngine, inputSchema} from '../uproof-complete-engine/src/index.mjs';
import type {CrmLead} from '@/lib/crmMockData';
import type {CrmEstimatorFormData} from '@/lib/crmEstimator';

type WorkbookInputValue = string | number | boolean | null;

export type WorkbookInputDefinition = {
  key: string;
  cell: string;
  label: string;
  group: string;
  section: string;
  field: string;
  unit?: string;
  type?: string;
  default?: WorkbookInputValue;
  advanced?: boolean;
  description?: string;
  validation?: {min?: number; integer?: boolean};
};

export type WorkbookProcessingData = {
  materialPrices: unknown[][];
  laborPositions: unknown[][];
  sheetMetalDetails: unknown[][];
};

export const CRM_TO_WORKBOOK_KEYS = new Set([
  'latojumaPlatiba',
  'jumtaSlipums',
  'jumtaLogs1Count',
  'skurstenaPieslegumuSkaits',
  'gutterSystem',
  'teknesM',
  'notecesGb',
  'notecesM',
  'sniegaBarjerasApalasM',
  'jumtaLaipas3m',
  'drosibasTroseM',
  'attalumsLidzObjektamKm',
  'cilvekuSkaitsObjektaCount',
  'slipumaKoefCoefficient',
]);

function numberFromText(value: unknown) {
  const numbers = String(value ?? '').replace(',', '.').match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  if (numbers.length === 0) return 0;
  return numbers.reduce((total, number) => total + number, 0) / numbers.length;
}

export function mapCrmEstimatorToWorkbookInputs(data: CrmEstimatorFormData): Record<string, WorkbookInputValue> {
  return {
    latojumaPlatiba: numberFromText(data.lathingArea || data.existingRoofArea),
    jumtaSlipums: numberFromText(data.roofPitch),
    jumtaLogs1Count: data.roofWindowCount ?? 0,
    skurstenaPieslegumuSkaits: data.chimneyCount ?? 0,
    teknesM: data.gutterSystem && data.gutterSystem !== 'Nav nepieciešams' ? numberFromText(data.existingRoofArea) : 0,
    notecesGb: 0,
    notecesM: 0,
    sniegaBarjerasApalasM: data.snowBarriers === 'Nav nepieciešams' ? 0 : numberFromText(data.snowBarrierZones),
    jumtaLaipas3m: data.roofWalkways ? 1 : 0,
    drosibasTroseM: data.safetyRopeSystems ? numberFromText(data.safetyRopePointsFromTo) : 0,
  };
}

export function getWorkbookDefinitions(): WorkbookInputDefinition[] {
  return inputSchema as WorkbookInputDefinition[];
}

export function getWorkbookProcessingData(): WorkbookProcessingData {
  const engine = createEngine();
  return engine.processingReferenceData() as WorkbookProcessingData;
}

export function calculateWorkbookProject(lead: CrmLead, workbookInputs: Record<string, WorkbookInputValue> = {}, estimatorData: CrmEstimatorFormData = lead.estimatorData) {
  const engine = createEngine();
  const crmInputs = mapCrmEstimatorToWorkbookInputs(estimatorData);
  engine.setInputs({...crmInputs, ...workbookInputs});
  return engine.calculateProject({includeProcessingData: true});
}