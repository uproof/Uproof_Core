/**
 * API contract between UI and backend (FastAPI). Matches ENGINE_SPEC.md section 11.4.
 * The mock server implements the same interface in the browser.
 */
import type {
  Constants, EngineSettings, InputDef, InputValues, LeadTerms, LineResult, SummaryResult, F2Result, OfferResult, WorkPlanItem, CashFlowResult,
} from '@/workbook-ui/engine';

export interface SettingsVersion { id: number; importedAt: string; note: string }

export interface SettingsSnapshot {
  version: SettingsVersion;
  values: EngineSettings;
}

/** Per-estimate edits on top of the shared settings version. */
export interface SettingsOverrides {
  materials: Record<string, number | null>;
  norms: Record<string, number | null>;
  coil: Record<string, number>;
  constants: Record<string, number>;
}

export interface Lead {
  id: string;
  terms: LeadTerms;
  inputs: InputValues;
}

export interface PreviewRequest {
  leadId: string;
  settingsVersionId: number;
  overrides: SettingsOverrides;
  inputs: InputValues;
  terms: LeadTerms;
}

export interface MaterialsListItem { name: string; unit: string | null; qty: number; cost: number; usedIn: string[] }
export interface MaterialsListGroup { supplier: string; kind: 'supplier' | 'workshop' | 'service' | 'input'; total: number; items: MaterialsListItem[] }
export interface ToolItem { key: string; name: string; usedIn: string[] }

export interface EstimateOutputs {
  inputs: InputValues;            // with derived inputs filled in
  constants: Constants;           // effective constants used (settings version + overrides)
  lines: LineResult[];            // Tāme
  summary: SummaryResult;         // Kopsavilkums
  f2: F2Result;                   // F2 forma
  offer: OfferResult;             // Piedāvājums
  workPlan: WorkPlanItem[];       // Darbu plāns
  cashFlow: CashFlowResult;       // Naudas plūsma
  materialsList: MaterialsListGroup[];
  tools: ToolItem[];              // Mehānismu saraksts
}

export interface EstimatorApi {
  getActiveSettings(): Promise<SettingsSnapshot>;
  getInputSchema(): Promise<InputDef[]>;
  getLead(leadId: string): Promise<Lead>;
  saveLead(lead: Lead): Promise<void>;
  previewEstimate(req: PreviewRequest): Promise<EstimateOutputs>;
}

export const emptyOverrides = (): SettingsOverrides => ({ materials: {}, norms: {}, coil: {}, constants: {} });
