/** Engine data model. Mirrors the DB settings tables and the extracted line catalogs. */

export type InputValue = number | string | null;
export type InputValues = Record<string, InputValue>;

export interface CellDef {
  /** DSL expression, e.g. "ceil0(in.demo_slate_m2/T[3].C,0)" */
  e?: string;
  /** Constant value */
  c?: number | string | null;
}

/** One Tāme row. `x` maps sheet column (C..V) to its definition. */
export interface TameRule {
  r: number;
  b: string;
  br: number;
  n: string;
  u: string | null;
  lu: string | null;
  t: string[];
  x: Record<string, CellDef>;
}

/** One F2 forma row. Header rows only have `h`. */
export interface F2Rule {
  r: number;
  h?: string;
  n?: string;
  u?: string | null;
  x?: Record<string, CellDef>;
}

export interface MaterialSetting { id: string; name: string; price: number | null; vat: number | null; supplier: string | null }
export interface LaborNormSetting { id: string; cat: string; name: string; op: string | number | null; unit: string | null; hours: number | null }
export interface SheetMetalDetailSetting { id: string; grp: string; name: string; w: number | null; folds: number | null; has: Record<string, boolean> }
export interface SlopeRow { angle_deg: number; area_multiplier: number }
export interface BattenGapRule { from_deg: number; to_deg: number; gap_mm: number | string }
export type Constants = Record<string, number>;

export interface EngineSettings {
  materials: MaterialSetting[];
  norms: LaborNormSetting[];
  sd: SheetMetalDetailSetting[];
  coil: Record<string, number>;
  fold_cost: number;
  slope: SlopeRow[];
  gaps: BattenGapRule[];
  k: Constants;
}

export interface InputDef {
  k: string;
  s: string;
  l: string | null;
  u: string;
  d: boolean;
  v: InputValue;
}

export interface EngineBundle {
  settings: EngineSettings;
  inputs: InputDef[];
  tame: TameRule[];
  f2: F2Rule[];
}

export interface LeadTerms {
  client: string;
  address: string;
  discount: number;
  vatRate: number;
  startDate: string;
}

export type PriceRef = { type: 'mat'; id: string } | { type: 'sd'; id: string; variant: string } | null;

export interface LineResult {
  row: number; block: string; blockRow: number; name: string; unit: string | null; laborUnit: string | null; tools: string[];
  qty: number; reserve: number; qtyRes: number; price: number; materials: number; hours: number; labor: number; laborMarked: number;
  priceRef: PriceRef;
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
  rows: F2Row[]; hours: number; labor: number; materials: number; mechanisms: number; subtotal: number; transport: number; direct: number;
  overhead: number; safety: number; profit: number; vsaoi: number; exVat: number; vat: number; incVat: number;
}

export interface OfferResult {
  lines: Record<number, number>; hours: number; labor: number; vsaoi: number; overhead: number; discount: number; subtotal: number;
  vatRate: number; vat: number; total: number; days: number; iin: number; vsaoiAll: number; omittedMaterials: number;
}

export interface WorkPlanItem { row: number; task: string; qty: number; hours: number; days: number; start: number; end: number }

export interface CashFlowResult { stages: { amount: number; cost: number }[]; final: number }
