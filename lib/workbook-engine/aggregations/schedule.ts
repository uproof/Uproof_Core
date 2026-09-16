/** Darbu plāns (work plan), Dienas plāns (day plan) and payment stages. */
import type { Context } from '../context';
import { blockName } from '../names';
import { LINES } from '../rules';
import type { SummaryResult } from './summary';
import { addDays, parseIsoDate, toIsoDate } from './dates';

const TRANSPORT_FIRST_ROW = 333;

export interface WorkPlanItem { row: number; blockId: string; task: string; qty: number; hours: number; days: number; start: number; end: number }
export interface DayPlanDay { dayNo: number; date: string; isWeekend: boolean; tasks: string[]; blockIds: string[] }

/** Blocks with hours, one crew, in sequence. days = hours / crew / workday × productivity factor. */
export function buildWorkPlan(c: Context): WorkPlanItem[] {
  const crew = c.inp.crew_size;
  const k = c.k;
  const plan: WorkPlanItem[] = [];
  if (!crew) return plan;
  let cursor = 0;
  for (const l of LINES) {
    if (l.blockHours === undefined || l.row >= TRANSPORT_FIRST_ROW) continue;
    const hours = c.value(l.id, 'blockHours');
    if (hours <= 0) continue;
    const days = (hours / crew / k.workday_hours) * k.schedule_productivity_factor;
    plan.push({ row: l.row, blockId: l.block, task: blockName(c, l.block), qty: c.value(l.id, 'qty'), hours, days, start: cursor, end: cursor + days });
    cursor += days;
  }
  return plan;
}

/** Day n lists the tasks with start < n and end > n - 1 (workbook Dienas plāns rule). */
export function buildDayPlan(workPlan: WorkPlanItem[], startIso: string, skipWeekends: boolean): DayPlanDay[] {
  const totalDays = workPlan.length ? Math.ceil(workPlan[workPlan.length - 1].end) : 0;
  let d = parseIsoDate(startIso);
  const isWeekend = (x: Date) => x.getUTCDay() === 0 || x.getUTCDay() === 6;
  const days: DayPlanDay[] = [];
  for (let n = 1; n <= totalDays; n++) {
    if (skipWeekends) while (isWeekend(d)) d = addDays(d, 1);
    const active = workPlan.filter((t) => t.start < n && t.end > n - 1);
    days.push({ dayNo: n, date: toIsoDate(d), isWeekend: isWeekend(d), tasks: active.map((t) => t.task), blockIds: active.map((t) => t.blockId) });
    d = addDays(d, 1);
  }
  return days;
}

/** Equal stage payments vs summary costs. Stage 1: groups 1-13 + 47-53 + transport, stage 2: 14-25, stage 3: 26-46. */
export function buildCashFlow(c: Context, offerTotal: number, summary: SummaryResult) {
  const k = c.k;
  const g = summary.lines;
  const stage = (offerTotal - offerTotal * k.final_payment_share) / k.payment_stages;
  const s = (a: number, b: number) => g.slice(a, b).reduce((x, l) => x + l.total, 0);
  const costs = [s(0, 13) + s(46, 53) + summary.transport, s(13, 25), s(25, 46)];
  return { stages: costs.map((cost) => ({ amount: stage, cost })), final: offerTotal * k.final_payment_share };
}
