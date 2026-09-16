/**
 * Client offer (Piedāvājums), pricing model C.
 * Material lines sum F2 material totals over fixed F2 row ranges (workbook Piedāvājums F8:F24).
 * Discount and VAT come from the lead terms.
 */
import type { Context } from '../context';
import { ceilUp } from '../functions';
import type { F2Result } from './f2';
import type { SummaryResult } from './summary';

export const OFFER_MATERIAL_LINES: Record<number, [number, number][]> = {
  8: [[8, 11]], 9: [[38, 47]], 10: [[53, 65]], 11: [[67, 75]], 12: [[81, 96]], 13: [[98, 105]], 14: [[107, 114]],
  15: [[122, 128]], 16: [[130, 132]], 17: [[134, 138]], 18: [[179, 184]], 19: [[197, 204]], 20: [[264, 276]],
  21: [[277, 283]], 22: [[284, 285]], 23: [[289, 290]], 24: [[291, 291]],
};

export interface OfferTerms { discount?: number; vatRate?: number }

export function buildOffer(c: Context, f2: F2Result, summary: SummaryResult, terms: OfferTerms) {
  const k = c.k;
  const mByRow = new Map<number, number>();
  for (const r of f2.rows) if ('M' in r) mByRow.set(r.row, r.M);
  const lines: Record<number, number> = {};
  for (const [line, ranges] of Object.entries(OFFER_MATERIAL_LINES)) {
    let s = 0;
    for (const [a, b] of ranges) for (let r = a; r <= b; r++) s += mByRow.get(r) ?? 0;
    lines[Number(line)] = s;
  }
  const covered = Object.values(lines).reduce((a, x) => a + x, 0);
  lines[25] = f2.transport;
  lines[26] = f2.mechanisms;
  const labor = f2.hours * k.labor_rate_eur_h;
  lines[27] = labor;
  const base = Object.values(lines).reduce((a, x) => a + x, 0);
  const vsaoi = labor * k.employer_social_tax_vsaoi;
  const overhead = base * k.offer_overhead_share;
  const discount = Number(terms.discount ?? k.offer_discount_eur);
  const vatRate = Number(terms.vatRate ?? k.offer_vat_rate);
  const subtotal = base + vsaoi + overhead - discount;
  const vat = subtotal * vatRate;
  return {
    lines, hours: f2.hours, labor, vsaoi, overhead, discount, subtotal, vatRate, vat, total: subtotal + vat,
    days: ceilUp(summary.days) + k.offer_duration_buffer_days, iin: labor * k.info_income_tax_iin,
    vsaoiAll: labor * k.info_employee_vsaoi + vsaoi, omittedMaterials: f2.materials - covered,
  };
}
export type OfferResult = ReturnType<typeof buildOffer>;
