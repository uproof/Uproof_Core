import { xsum } from '../dsl';
import type { EngineCore } from '../core';
import type { F2Result, F2Row } from '../types';

/** F2 forma: per-row unit costs and totals, footer with overhead, profit, VSAOI and VAT (pricing model B). */
export function buildF2(e: EngineCore): F2Result {
  const k = e.k;
  const F = (r: number, c: string) => e.C('F', r, c);
  const dataRows = e.bundle.f2.filter((r) => !r.h).map((r) => r.r);
  const total = (c: string) => dataRows.reduce((a, r) => a + F(r, c), 0);
  const [hours, labor, materials, mechanisms, subtotal] = ['K', 'L', 'M', 'N', 'O'].map(total);
  const transport = xsum(e.R('T', 333, 336, 'I', 'I'));
  const direct = subtotal + transport;
  const overhead = direct * k.f2_overhead_share;
  const profit = direct * k.f2_profit_share;
  const vsaoi = labor * k.employer_social_tax_vsaoi;
  const exVat = direct + overhead + profit + vsaoi;
  const rows: F2Row[] = e.bundle.f2.map((r) => r.h
    ? { row: r.r, header: r.h }
    : { row: r.r, name: r.n, unit: r.u, D: F(r.r, 'D'), E: F(r.r, 'E'), F: k.labor_rate_eur_h, G: F(r.r, 'G'), H: F(r.r, 'H'), I: F(r.r, 'I'), J: F(r.r, 'J'), K: F(r.r, 'K'), L: F(r.r, 'L'), M: F(r.r, 'M'), N: F(r.r, 'N'), O: F(r.r, 'O') });
  return {
    rows, hours, labor, materials, mechanisms, subtotal, transport, direct, overhead,
    safety: overhead * k.f2_labor_safety_share_of_overhead, profit, vsaoi, exVat, vat: exVat * k.f2_vat_rate, incVat: exVat * (1 + k.f2_vat_rate),
  };
}
