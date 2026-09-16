/**
 * Materiālu saraksts: what to order for each work day (port of the Google Sheets "Procurement" script).
 *
 * Script behaviour kept:
 *  - materials of a category = Tāme lines under that column-A category with quantity (with reserve) > 0
 *  - a category is active on a day if its name appears in that day's task list
 *  - materials are listed on the day a category becomes active (not active the previous day)
 *  - duplicates within a day are removed; order-by date = day date - lead time
 * Changes: lead times are stored per line id; default lead time per material; labor-only lines can be hidden.
 */
import type { Context } from '../context';
import type { LineResult } from './lines';
import type { DayPlanDay } from './schedule';
import { addDays, parseIsoDate, toIsoDate } from './dates';

const norm = (s: string | null | undefined) => String(s ?? '').split(/\s+/).filter(Boolean).join(' ');
const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

export interface ProcurementItem {
  lineId: string; category: string; material: string; qty: number; unit: string | null; cost: number;
  leadTimeDays: number; leadTimeIsDefault: boolean; orderBy: string | null; overdue: boolean;
}

export function buildProcurement(c: Context, lines: LineResult[], dayPlan: DayPlanDay[], leadTimes: Record<string, number>,
  includeLaborLines: boolean, todayIso: string) {
  const byCategory = new Map<string, LineResult[]>();
  for (const l of lines) {
    if (l.qtyRes <= 0 || !l.name) continue;
    if (!includeLaborLines && l.materials <= 0) continue;
    const key = norm(l.block).toLowerCase();
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(l);
  }
  const today = parseIsoDate(todayIso);
  const days: { dayNo: number; date: string; tasks: string[]; newTasks: string[]; items: ProcurementItem[] }[] = [];
  const flat: (ProcurementItem & { dayNo: number; date: string })[] = [];
  let prevActive = new Set<string>();

  for (const day of dayPlan) {
    const text = day.tasks.join(', ').toLowerCase();
    const active = [...byCategory.keys()]
      .map((cat) => ({ idx: text.indexOf(cat), cat }))
      .filter((x) => x.idx !== -1)
      .sort((a, b) => a.idx - b.idx || b.cat.length - a.cat.length || cmp(a.cat, b.cat))
      .map((x) => x.cat);
    const fresh = active.filter((cat) => !prevActive.has(cat));
    const seen = new Set<string>();
    const items: ProcurementItem[] = [];
    const dayDate = parseIsoDate(day.date);
    for (const cat of fresh) {
      for (const l of byCategory.get(cat)!) {
        const dedupe = JSON.stringify([cat, l.name, l.qtyRes, l.unit]);
        if (seen.has(dedupe)) continue;
        seen.add(dedupe);
        const ref = l.priceRef;
        const defaultLead = ref && ref.type === 'mat' ? c.settings.materials[ref.id].leadTimeDays : 0;
        const lead = Number((l.id in leadTimes ? leadTimes[l.id] : defaultLead) || 0);
        const orderBy = addDays(dayDate, -Math.floor(lead));   // date minus whole days, like Python date - timedelta
        const item: ProcurementItem = {
          lineId: l.id, category: l.block, material: l.name, qty: l.qtyRes, unit: l.unit, cost: l.materials,
          leadTimeDays: lead, leadTimeIsDefault: !(l.id in leadTimes), orderBy: lead ? toIsoDate(orderBy) : null, overdue: !!lead && orderBy < today,
        };
        items.push(item);
        flat.push({ ...item, dayNo: day.dayNo, date: day.date });
      }
    }
    days.push({ dayNo: day.dayNo, date: day.date, tasks: day.tasks, newTasks: fresh.map((cat) => display(lines, cat)), items });
    prevActive = new Set(active);
  }
  return { days, items: flat };
}

function display(lines: LineResult[], cat: string): string {
  const l = lines.find((x) => norm(x.block).toLowerCase() === cat);
  return l ? norm(l.block) : cat;
}
