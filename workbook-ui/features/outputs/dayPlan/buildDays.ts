import type { WorkPlanItem } from '@/workbook-ui/engine';

export interface PlanDay { dayNo: number; date: Date; isWeekend: boolean; tasks: string[] }
export interface DayTracking { crew?: string; hours?: string; done?: boolean; note?: string }

/** Day n lists tasks with start < n and end > n - 1 (workbook Dienas plāns rule). */
export function buildDays(plan: WorkPlanItem[], startDate: string, skipWeekends: boolean): PlanDay[] {
  const total = Math.ceil(plan.at(-1)?.end ?? 0);
  const date = new Date(`${startDate}T00:00:00`);
  const days: PlanDay[] = [];
  for (let n = 1; n <= total; n++) {
    if (skipWeekends) while (date.getDay() === 0 || date.getDay() === 6) date.setDate(date.getDate() + 1);
    days.push({
      dayNo: n,
      date: new Date(date),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      tasks: plan.filter((t) => t.start < n && t.end > n - 1).map((t) => t.task),
    });
    date.setDate(date.getDate() + 1);
  }
  return days;
}
