/**
 * API contract with the FastAPI backend (uproof-estimator-api). All calculations happen on the server;
 * these types describe what it returns.
 */

import type { CrmEstimatorFormData } from '@/lib/crmEstimator';

// ---------- inputs & terms ----------
export type InputValue = number | string | null;
export type InputValues = Record<string, InputValue>;

export interface InputDef { k: string; s: string; l: string | null; u: string; d: boolean; v: InputValue }

export interface LeadTerms {
  client: string;
  address: string;
  discount: number;
  vatRate: number;
  startDate: string;
  skipWeekends: boolean;
  procurementIncludeLabor: boolean;
}

// ---------- settings ----------
export interface MaterialSetting { id: string; name: string; price: number | null; vat: number | null; supplier: string | null; isService: boolean; leadTimeDays: number }
export interface LaborNormSetting { id: string; cat: string; name: string; op: string | null; unit: string | null; hours: number | null }
export interface SheetMetalDetailSetting { id: string; grp: string; name: string; w: number | null; folds: number | null; has: Record<string, boolean> }
export interface SlopeRow { angle_deg: number; area_multiplier: number }
export interface BattenGapRule { from_deg: number; to_deg: number; gap_mm: number | string }
export type Constants = Record<string, number>;

export interface SettingsValues {
  materials: MaterialSetting[];
  norms: LaborNormSetting[];
  sd: SheetMetalDetailSetting[];
  coil: Record<string, number>;
  fold_cost: number;
  slope: SlopeRow[];
  gaps: BattenGapRule[];
  k: Constants;
}

export interface SettingsVersion { id: number; importedAt: string; note: string; parentId?: number | null }
export interface SettingsSnapshot { version: SettingsVersion; values: SettingsValues }
export interface SettingsVersionListItem { id: number; note: string; isActive: boolean; parentId: number | null; createdAt: string }

/** Per-estimate edits on top of the shared settings version. */
export interface SettingsOverrides {
  materials: Record<string, number | null>;
  norms: Record<string, number | null>;
  coil: Record<string, number>;
  constants: Record<string, number>;
  materialLeadTimes: Record<string, number>;
}

export const emptyOverrides = (): SettingsOverrides => ({ materials: {}, norms: {}, coil: {}, constants: {}, materialLeadTimes: {} });

export interface SettingsChange {
  note: string;
  materials?: Record<string, { price?: number | null; lead_time_days?: number }>;
  norms?: Record<string, number>;
  coil?: Record<string, number>;
  constants?: Record<string, number>;
}

// ---------- leads ----------
export interface Lead {
  id: string;
  terms: LeadTerms;
  inputs: InputValues;
  leadTimes: Record<string, number>;   // line id -> days (procurement)
  overrides: SettingsOverrides;
  updatedAt?: string | null;
  dayTracking?: Record<number, {crew?: string; hours?: string; done?: boolean; note?: string}>;
  toolsPacked?: Record<string, boolean>;
  crmEstimatorData?: CrmEstimatorFormData;
  offerEdits?: Record<number, {description?: string; specification?: string; unit?: string; quantity?: number; amount?: number}>;
  offerFinalised?: boolean;
}

export interface PreviewRequest {
  settingsVersionId?: number;
  overrides: SettingsOverrides;
  inputs: InputValues;
  terms: LeadTerms;
  leadTimes: Record<string, number>;
}

// ---------- outputs ----------
export type PriceRef = { type: 'mat'; id: string } | { type: 'sd'; id: string; variant: string } | null;

export interface LineResult {
  id: string; row: number; blockId: string; blockRow: number; block: string; name: string; unit: string | null; laborUnit: string | null; tools: string[];
  qty: number; reserve: number; qtyRes: number; price: number; materials: number; hours: number; labor: number; laborMarked: number; priceRef: PriceRef;
}

export interface SummaryLine { name: string; unit: string; qty: number; materials: number; labor: number; hours: number; total: number }
export interface SummaryResult {
  lines: SummaryLine[]; materials: number; hours: number; transport: number; mechanisms: number; hoursCoef: number; days: number;
  labor: number; vsaoi: number; cost: number; profit: number; offer: number; perM2: number; vat: number; offerVat: number; roofM2: number;
}

export interface F2Row {
  row: number; header?: string; name?: string; unit?: string | null;
  D?: number; E?: number; F?: number; G?: number; H?: number; I?: number; J?: number; K?: number; L?: number; M?: number; N?: number; O?: number;
}
export interface F2Result {
  rows: F2Row[]; hours: number; labor: number; materials: number; mechanisms: number; subtotal: number; transport: number; transportShareOfLabor: number; direct: number;
  overhead: number; safety: number; profit: number; vsaoi: number; exVat: number; vat: number; incVat: number;
}

export interface OfferResult {
  lines: Record<string, number>; hours: number; labor: number; vsaoi: number; overhead: number; discount: number; subtotal: number;
  vatRate: number; vat: number; total: number; days: number; iin: number; vsaoiAll: number; omittedMaterials: number;
}

export interface WorkPlanItem { row: number; blockId: string; task: string; qty: number; hours: number; days: number; start: number; end: number }
export interface DayPlanDay { dayNo: number; date: string; isWeekend: boolean; tasks: string[]; blockIds: string[] }
export interface CashFlowResult { stages: { amount: number; cost: number }[]; final: number }

export interface MaterialsListItem { name: string; unit: string | null; qty: number; cost: number; usedIn: string[] }
export interface MaterialsListGroup { supplier: string; kind: 'supplier' | 'workshop' | 'service' | 'input'; total: number; items: MaterialsListItem[] }
export interface ToolItem { key: string; name: string; usedIn: string[] }

export interface ProcurementItem {
  lineId: string; category: string; material: string; qty: number; unit: string | null; cost: number;
  leadTimeDays: number; leadTimeIsDefault: boolean; orderBy: string | null; overdue: boolean;
}
export interface ProcurementDay { dayNo: number; date: string; tasks: string[]; newTasks: string[]; items: ProcurementItem[] }
export interface ProcurementResult { days: ProcurementDay[]; items: (ProcurementItem & { dayNo: number; date: string })[] }

export interface EstimateOutputs {
  engineVersion: string;
  settingsVersionId: number;
  inputs: InputValues;        // derived inputs filled in
  constants: Constants;       // effective constants (version + overrides)
  lines: LineResult[];        // Tāme
  summary: SummaryResult;     // Kopsavilkums
  f2: F2Result;               // F2 forma
  offer: OfferResult;         // Piedāvājums
  workPlan: WorkPlanItem[];   // Darbu plāns
  dayPlan: DayPlanDay[];      // Dienas plāns
  cashFlow: CashFlowResult;   // Naudas plūsma
  materialsList: MaterialsListGroup[];
  tools: ToolItem[];          // Mehānismu saraksts
  procurement: ProcurementResult; // Materiālu saraksts (per day, lead times)
}

export interface SavedEstimate { id: number; createdAt: string; settingsVersionId: number; offerTotal: number }

export interface OfferTemplate { [line: string]: { desc: string; unit: string } | string[] }

export type { F2Layout } from '@/shared/f2Sheet';

export interface ApiError { status: number; message: string; fields?: Record<string, string> }

export interface EstimatorApi {
  getActiveSettings(): Promise<SettingsSnapshot>;
  listSettingsVersions(): Promise<SettingsVersionListItem[]>;
  createSettingsVersion(change: SettingsChange): Promise<SettingsSnapshot>;
  getInputSchema(): Promise<InputDef[]>;
  getOfferTemplate(): Promise<OfferTemplate>;
  getF2Layout(): Promise<import('@/shared/f2Sheet').F2Layout>;
  getLead(leadId: string): Promise<Lead>;
  saveLead(lead: Lead): Promise<Lead>;
  previewEstimate(leadId: string, req: PreviewRequest): Promise<EstimateOutputs>;
  saveEstimate(leadId: string): Promise<SavedEstimate>;
  listEstimates(leadId: string): Promise<SavedEstimate[]>;
}
