import { ceil0 } from '../dsl';
import type { EngineCore } from '../core';
import type { F2Result, LeadTerms, OfferResult, SummaryResult } from '../types';

/** Offer line number -> F2 row ranges whose material totals (column M) it sums. Workbook: Piedāvājums F8:F24. */
export const OFFER_MATERIAL_LINES: [line: number, ranges: [number, number][]][] = [
  [8, [[8, 11]]], [9, [[38, 47]]], [10, [[53, 65]]], [11, [[67, 75]]], [12, [[81, 96]]], [13, [[98, 105]]], [14, [[107, 114]]],
  [15, [[122, 128]]], [16, [[130, 132]]], [17, [[134, 138]]], [18, [[179, 184]]], [19, [[197, 204]]], [20, [[264, 276]]],
  [21, [[277, 283]]], [22, [[284, 285]]], [23, [[289, 290]]], [24, [[291, 291]]],
];

/** Client offer (pricing model C). Discount and VAT come from the lead, not shared settings. */
export function buildOffer(e: EngineCore, f2: F2Result, summary: SummaryResult, terms: LeadTerms): OfferResult {
  const k = e.k;
  const lines: Record<number, number> = {};
  for (const [line, ranges] of OFFER_MATERIAL_LINES) {
    let s = 0;
    for (const [a, b] of ranges) for (let r = a; r <= b; r++) s += e.C('F', r, 'M');
    lines[line] = s;
  }
  lines[25] = f2.transport;
  lines[26] = f2.mechanisms;
  const labor = f2.hours * k.labor_rate_eur_h;
  lines[27] = labor;
  const base = Object.values(lines).reduce((a, x) => a + x, 0);
  const vsaoi = labor * k.employer_social_tax_vsaoi;
  const overhead = base * k.offer_overhead_share;
  const subtotal = base + vsaoi + overhead - terms.discount;
  const vat = subtotal * terms.vatRate;
  const covered = OFFER_MATERIAL_LINES.reduce((a, [line]) => a + lines[line], 0);
  return {
    lines, hours: f2.hours, labor, vsaoi, overhead, discount: terms.discount, subtotal, vatRate: terms.vatRate, vat, total: subtotal + vat,
    days: ceil0(summary.days) + k.offer_duration_buffer_days, iin: labor * k.info_income_tax_iin,
    vsaoiAll: labor * k.info_employee_vsaoi + vsaoi, omittedMaterials: f2.materials - covered,
  };
}
