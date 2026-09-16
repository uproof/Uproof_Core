/**
 * F2 forma, cell by cell as in the workbook. Used by the on-screen sheet and the .xlsx export.
 * The layout (src/server/engine/f2/layout.json) was extracted from the workbook: column widths, row heights,
 * merged cells, 99 cell styles, static texts and which calculated value belongs in each cell.
 */

export type BorderStyle = 'thin' | 'medium' | 'thick' | 'dashed' | 'dotted' | 'double' | 'hair' | null;

export interface F2Style {
  font: string; size: number; bold: boolean; italic: boolean; color: string | null; fill: string | null;
  h: 'left' | 'center' | 'right' | 'general' | 'justify' | null; v: 'top' | 'center' | 'bottom' | null; wrap: boolean;
  border: [BorderStyle, BorderStyle, BorderStyle, BorderStyle]; // top, right, bottom, left
  numFmt: string;
}

export type F2Binding =
  | { kind: 'row'; key: string }        // F2 row value, column D..O
  | { kind: 'name' }                    // row name that comes from an input or another line
  | { kind: 'total'; key: 'K' | 'L' | 'M' | 'N' | 'O' }
  | { kind: 'value'; key: string }      // F2 result field (transport, overhead, exVat, ...)
  | { kind: 'constant'; key: string }   // settings constant (rate, shares)
  | { kind: 'text'; key: 'title' | 'dateLine' | 'vatLabel' };

export interface F2LayoutCell { c: string; s: number; rs?: number; cs?: number; v?: string | number; bind?: F2Binding }
export interface F2LayoutRow { r: number; h: number; cells: F2LayoutCell[] }
export interface F2AutoFilter { range: string; column: string; firstRow: number; lastRow: number; operator: 'notEqual'; value: number }
export interface F2Image { cell: string; widthPx: number; heightPx: number; src: string }
export interface F2Layout {
  sheet: string; freezeRow: number; columns: { c: string; width: number }[]; rows: F2LayoutRow[]; styles: F2Style[];
  autoFilter?: F2AutoFilter; images?: F2Image[];
}

export interface F2SheetData {
  f2: { rows: { row: number; name?: string; [col: string]: unknown }[]; hours: number; labor: number; materials: number; mechanisms: number; subtotal: number; [k: string]: unknown };
  constants: Record<string, number>;
  address: string;
  date: string; // ISO yyyy-mm-dd
}

const TOTAL_FIELD = { K: 'hours', L: 'labor', M: 'materials', N: 'mechanisms', O: 'subtotal' } as const;
const MONTHS_LOCATIVE = ['Janvārī', 'Februārī', 'Martā', 'Aprīlī', 'Maijā', 'Jūnijā', 'Jūlijā', 'Augustā', 'Septembrī', 'Oktobrī', 'Novembrī', 'Decembrī'];

/** "Tāme sastādīta 2026.gada 10.Maijā" (workbook L3 format). */
export function latvianDateLine(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `Tāme sastādīta ${y}.gada ${d}.${MONTHS_LOCATIVE[m - 1]}`;
}

/**
 * The workbook's filter on column O ("Kopā (EUR)" not equal to 0): a row is hidden when its total is exactly 0.
 * Rows with an empty total (section titles) stay visible, as in the spreadsheet.
 */
export function isRowFiltered(layout: F2Layout, row: number, data: F2SheetData): boolean {
  const f = layout.autoFilter;
  if (!f || row < f.firstRow || row > f.lastRow) return false;
  const r = layout.rows[row - 1];
  const cell = r?.cells.find((c) => c.c === f.column);
  if (!cell) return false;
  const v = cellValue(cell, row, data);
  return typeof v === 'number' && v === f.value;
}

/** Raw cell value (number or text) before formatting; undefined = empty cell. */
export function cellValue(cell: F2LayoutCell, row: number, data: F2SheetData): string | number | undefined {
  const b = cell.bind;
  if (!b) return cell.v;
  switch (b.kind) {
    case 'row': {
      const r = data.f2.rows.find((x) => x.row === row);
      const v = r?.[b.key];
      return typeof v === 'number' ? v : undefined;
    }
    case 'name': return data.f2.rows.find((x) => x.row === row)?.name ?? '';
    case 'total': return data.f2[TOTAL_FIELD[b.key]] as number;
    case 'value': return data.f2[b.key] as number;
    case 'constant': return data.constants[b.key];
    case 'text':
      if (b.key === 'title') return `Jumta renovācija darbiem, ${data.address}`;
      if (b.key === 'dateLine') return latvianDateLine(data.date);
      return `PVN ${Math.round((data.constants.f2_vat_rate ?? 0) * 100)}%`;
  }
}

/**
 * Round like a spreadsheet: on the 15-significant-digit decimal value, halves away from zero
 * (0.225 -> 0.23 and 5.265 -> 5.27, where JavaScript's toFixed would give 0.22 and 5.26 because of binary noise).
 */
export function spreadsheetFixed(value: number, decimals: number): string {
  const normalized = Number(value.toPrecision(15));
  const scale = 10 ** decimals;
  const scaled = Number((Math.abs(normalized) * scale).toPrecision(15));
  const rounded = Math.floor(scaled + 0.5) / scale;
  const sign = normalized < 0 && rounded !== 0 ? '-' : '';
  return sign + rounded.toFixed(decimals);
}

/** Number formats used in the sheet: 0.00, 0.00%, @ (text), General. Decimal comma as in Latvian locale. */
export function formatCell(value: string | number | undefined, numFmt: string, decimal = ','): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  const dec = (s: string) => (decimal === '.' ? s : s.replace('.', decimal));
  if (numFmt === '0.00') return dec(spreadsheetFixed(value, 2));
  if (numFmt === '0.00%') return `${dec(spreadsheetFixed(value * 100, 2))}%`;
  if (numFmt === '@') return String(value);
  return dec(String(Number(value.toPrecision(10))));
}

/** Sheet column width (character units) to screen pixels, as Google Sheets exports them (12.63 = 100 px). */
export const widthToPx = (w: number) => Math.round((w / 12.63) * 100);
/** Row height in points to pixels. */
export const heightToPx = (pt: number) => Math.round((pt * 4) / 3);
export const BORDER_PX: Record<string, number> = { hair: 1, thin: 1, dotted: 1, dashed: 1, medium: 2, double: 3, thick: 3 };
