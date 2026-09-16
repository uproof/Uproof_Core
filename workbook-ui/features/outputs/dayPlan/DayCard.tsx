import { formatDate } from '@/workbook-ui/lib/format';
import type { DayTracking, PlanDay } from './buildDays';

interface Props { day: PlanDay; tracking: DayTracking; onChange: (t: DayTracking) => void }

/** One day: planned tasks + on-site tracking fields (becomes `day_log` table). */
export function DayCard({ day, tracking, onChange }: Props) {
  const set = <K extends keyof DayTracking>(k: K, v: DayTracking[K]) => onChange({ ...tracking, [k]: v });
  return (
    <article className={day.isWeekend ? 'day-card is-weekend' : 'day-card'}>
      <header><strong>Day {day.dayNo}</strong><small>{formatDate(day.date, { weekday: 'short', day: 'numeric', month: 'short' })}</small></header>
      <ul>{day.tasks.map((t) => <li key={t}>{t}</li>)}</ul>
      <div className="day-tracking no-print">
        <input type="text" placeholder="Crew" aria-label={`Crew on day ${day.dayNo}`} value={tracking.crew ?? ''} onChange={(e) => set('crew', e.target.value)} />
        <input type="number" placeholder="Hours on site" aria-label={`Hours on day ${day.dayNo}`} value={tracking.hours ?? ''} onChange={(e) => set('hours', e.target.value)} />
        <label className="toggle"><input type="checkbox" checked={!!tracking.done} onChange={(e) => set('done', e.target.checked)} />Done</label>
        <input type="text" placeholder="Comment" aria-label={`Comment for day ${day.dayNo}`} value={tracking.note ?? ''} onChange={(e) => set('note', e.target.value)} />
      </div>
    </article>
  );
}
