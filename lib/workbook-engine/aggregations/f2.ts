/**
 * F2 forma (local estimate) and pricing model B.
 * Per row:  G = E × rate   I = H × mechanisms share   J = G + H + I
 *           K = E × D      L = K × rate   M = H × D   N = I × D   O = L + M + N
 */
import type { Context } from '../context';
import { iferror, total } from '../functions';
import type { F2RowRule } from '../line';
import { resolveName } from '../names';
import { F2_ROWS } from '../rules/f2Form';

const TRANSPORT_FIRST = 'transporta_izmaksas.skarda_piegade_1gb_400m2';
const TRANSPORT_LAST = 'transporta_izmaksas.citu_mat_sagades_izmaksas_1_no_kopejas_m';

export interface F2DataRow {
  row: number; name: string; unit: string | null;
  D: number; E: number; F: number; G: number; H: number; I: number; J: number; K: number; L: number; M: number; N: number; O: number;
}
export type F2OutRow = F2DataRow | { row: number; header: string };

function rowValues(c: Context, r: F2RowRule): F2DataRow {
  const k = c.k;
  const D = c.f2Value(r.row, 'qty'), E = c.f2Value(r.row, 'hoursMarkedPerUnit'), H = c.f2Value(r.row, 'materialUnitPrice');
  const G = E * k.labor_rate_eur_h, I = H * k.mechanisms_share_of_materials;
  const K = E * D;
  const L = K * k.labor_rate_eur_h, M = H * D, N = I * D;
  return { row: r.row, name: resolveName(c, r.name, r.nameFrom), unit: r.unit ?? null, D, E, F: k.labor_rate_eur_h, G, H, I, J: G + H + I, K, L, M, N, O: L + M + N };
}

export function buildF2(c: Context) {
  const k = c.k;
  const rows: F2OutRow[] = [];
  const data: F2DataRow[] = [];
  for (const r of F2_ROWS) {
    if (r.kind === 'section') rows.push({ row: r.row, header: r.title });
    else { const v = rowValues(c, r); rows.push(v); data.push(v); }
  }
  const sum = (col: 'K' | 'L' | 'M' | 'N' | 'O') => data.reduce((a, v) => a + v[col], 0);
  const hours = sum('K'), labor = sum('L'), materials = sum('M'), mechanisms = sum('N'), subtotal = sum('O');
  const transport = total(c.span(TRANSPORT_FIRST, TRANSPORT_LAST, 'materials'));
  const direct = subtotal + transport;
  const overhead = direct * k.f2_overhead_share, profit = direct * k.f2_profit_share;
  const vsaoi = labor * k.employer_social_tax_vsaoi;
  const exVat = direct + overhead + profit + vsaoi;
  return {
    rows, hours, labor, materials, mechanisms, subtotal, transport,
    transportShareOfLabor: iferror(() => transport / labor, 0),  // workbook J293
    direct, overhead, safety: overhead * k.f2_labor_safety_share_of_overhead, profit, vsaoi,
    exVat, vat: exVat * k.f2_vat_rate, incVat: exVat * (1 + k.f2_vat_rate),
  };
}
export type F2Result = ReturnType<typeof buildF2>;
