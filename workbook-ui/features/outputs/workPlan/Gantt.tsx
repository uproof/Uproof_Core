import type { WorkPlanItem } from '@/workbook-ui/engine';
import { format2 } from '@/workbook-ui/lib/format';

/** Sequential bar chart. Positions are percentages of the total span in days. */
export function Gantt({ items }: { items: WorkPlanItem[] }) {
  const span = Math.max(1, Math.ceil(items.at(-1)?.end ?? 1));
  const pct = (d: number) => `${(d / span) * 100}%`;
  return (
    <div className="gantt" role="table" aria-label="Work plan">
      <div className="gantt-row gantt-axis" role="row">
        <div role="columnheader">Task</div>
        <div className="gantt-track" role="columnheader">
          {Array.from({ length: span + 1 }, (_, d) => <span key={d} style={{ left: pct(d) }}>{d}</span>)}
        </div>
      </div>
      {items.map((t) => (
        <div className="gantt-row" role="row" key={t.row}>
          <div role="cell">{t.task} <small>{format2(t.hours)} h</small></div>
          <div className="gantt-track" role="cell">
            <span className="gantt-bar" style={{ left: pct(t.start), width: pct(t.end - t.start) }} title={`${format2(t.days)} days`} />
          </div>
        </div>
      ))}
    </div>
  );
}
