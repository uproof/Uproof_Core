import type { EngineCore } from '../core';
import type { CashFlowResult, SummaryResult, WorkPlanItem } from '../types';

/** Darbu plāns: blocks with hours, one crew, sequential. */
export function buildWorkPlan(e: EngineCore): WorkPlanItem[] {
  const crew = e.I('crew_size');
  const k = e.k;
  const out: WorkPlanItem[] = [];
  let cursor = 0;
  for (const r of e.bundle.tame) {
    if (!r.x.U || r.r >= 333 || !crew) continue;
    const hours = e.C('T', r.r, 'U');
    if (!(hours > 0)) continue;
    const days = (hours / crew / k.workday_hours) * k.schedule_productivity_factor;
    out.push({ row: r.r, task: r.b, qty: e.C('T', r.r, 'D'), hours, days, start: cursor, end: cursor + days });
    cursor += days;
  }
  return out;
}

/** Projekta naudas plūsma: equal stage payments vs attributable summary costs. */
export function buildCashFlow(e: EngineCore, offerTotal: number, summary: SummaryResult): CashFlowResult {
  const k = e.k;
  const L = summary.lines;
  const stage = (offerTotal - offerTotal * k.final_payment_share) / k.payment_stages;
  const s = (a: number, b: number) => L.slice(a, b).reduce((x, l) => x + l.total, 0);
  const costs = [s(0, 13) + s(46, 53) + summary.transport, s(13, 25), s(25, 46)];
  return { stages: costs.map((cost) => ({ amount: stage, cost })), final: offerTotal * k.final_payment_share };
}
