/** Rule definitions: one LineRule per workbook Tāme row, one F2 row per F2 forma row, one InputField per input. */
import type { RuleContext } from './context';

export type Expr = number | ((c: RuleContext) => number) | undefined;

export const LINE_FIELDS = [
  'param', 'qty', 'reserve', 'qtyRes', 'unitPrice', 'materials', 'hoursPerUnit', 'hours', 'rate', 'labor',
  'hoursMarkedPerUnit', 'laborMarked', 'total', 'blockMaterials', 'blockLabor', 'blockHours', 'blockTotal',
] as const;
export type LineField = (typeof LINE_FIELDS)[number];

export type PriceRef = { type: 'mat'; id: string } | { type: 'sd'; id: string; variant: string };

export interface LineRule {
  id: string;
  row: number;                // workbook Tāme row
  block: string;
  name: string | null;
  nameFrom?: string;          // "input:key" | "material:key" | "line:id"
  unit?: string;
  laborUnit?: string;
  note?: string;              // workbook explanation text in the parameter column
  tools?: string[];
  blank?: LineField[];        // empty in the workbook, counts as 0
  priceRef?: PriceRef;        // which setting the unit price reads
  param?: Expr;               // C  consumption ratio / pack size / condition
  qty?: Expr;                 // D  quantity
  reserve?: Expr;             // E  waste / overlap factor
  qtyRes?: Expr;              // F  quantity with reserve
  unitPrice?: Expr;           // H  price per unit
  materials?: Expr;           // I  material cost
  hoursPerUnit?: Expr;        // J  labor norm
  hours?: Expr;               // L  labor hours
  rate?: Expr;                // M  hourly rate
  labor?: Expr;               // O  labor cost
  hoursMarkedPerUnit?: Expr;  // P  norm with markup
  laborMarked?: Expr;         // Q  labor cost with markup
  total?: Expr;               // R  labor + materials
  blockMaterials?: Expr;      // S  (block header rows)
  blockLabor?: Expr;          // T
  blockHours?: Expr;          // U
  blockTotal?: Expr;          // V
}

/** Standard formulas used when a field is not given and not listed in `blank`. */
export const STANDARD: Partial<Record<LineField, (c: RuleContext) => number>> = {
  qtyRes: (c) => c.this.qty * c.this.reserve,
  materials: (c) => c.this.unitPrice * c.this.qtyRes,
  hours: (c) => c.this.hoursPerUnit * c.this.qty,
  rate: (c) => c.k.labor_rate_eur_h,
  labor: (c) => c.this.hours * c.this.rate,
  hoursMarkedPerUnit: (c) => c.this.hoursPerUnit * c.k.labor_markup_factor,
  laborMarked: (c) => c.this.hoursMarkedPerUnit * c.this.qty * c.this.rate,
  total: (c) => c.this.labor + c.this.materials,
};

export function definitionOf(rule: LineRule, field: LineField): Expr {
  const value = rule[field];
  if (value !== undefined) return value;
  if (rule.blank?.includes(field)) return undefined;
  return STANDARD[field];
}

export const line = (rule: LineRule): LineRule => rule;

export type F2Field = 'qty' | 'hoursMarkedPerUnit' | 'materialUnitPrice';

export interface F2RowRule {
  kind: 'row';
  row: number;
  name: string | null;
  nameFrom?: string;
  unit?: string;
  qty?: Expr;
  hoursMarkedPerUnit?: Expr;
  materialUnitPrice?: Expr;
}
export interface F2SectionRule { kind: 'section'; row: number; title: string }
export type F2Item = F2RowRule | F2SectionRule;

export const f2Row = (r: Omit<F2RowRule, 'kind'>): F2RowRule => ({ kind: 'row', ...r });
export const f2Section = (row: number, title: string): F2SectionRule => ({ kind: 'section', row, title });

export interface InputField { key: string; section: string; label: string | null; unit: string; derived: boolean }
