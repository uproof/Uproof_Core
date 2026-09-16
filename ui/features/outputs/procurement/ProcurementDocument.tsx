'use client';

import { Fragment } from 'react';
import { NumberInput } from '@/ui/components/common';
import { formatDate, formatNum } from '@/ui/lib/format';
import { useEstimate } from '@/ui/state/EstimateContext';

const fmtDate = (iso: string) => formatDate(new Date(`${iso}T00:00:00`));

/**
 * Materiālu saraksts: for each work day, the materials of tasks that start that day,
 * with lead time and order-by date. Lead time edits are saved on the lead and recalculated by the API.
 */
export function ProcurementDocument({ editable = false }: { editable?: boolean }) {
  const { outputs, setLeadTime } = useEstimate();
  if (!outputs) return null;
  const days = outputs.procurement.days;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr><th>Day</th><th>Date</th><th>Material</th><th className="num">Amount</th><th>Unit</th><th className="num">Lead time, days</th><th>Order by</th></tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <Fragment key={d.dayNo}>
              <tr className="row-section">
                <td>{d.dayNo}</td><td>{fmtDate(d.date)}</td>
                <td colSpan={5}>{d.tasks.join(', ') || 'No work'}{d.newTasks.length > 0 && <small> Starts: {d.newTasks.join(', ')}</small>}</td>
              </tr>
              {d.items.map((it) => (
                <tr key={it.lineId} className={it.overdue ? 'row-overdue' : undefined}>
                  <td /><td />
                  <td>{it.material}<br /><small>{it.category}</small></td>
                  <td className="num">{formatNum(Math.round(it.qty * 1000) / 1000)}</td>
                  <td>{it.unit}</td>
                  <td className="num">
                    {editable
                      ? <>
                          <NumberInput label={`Lead time for ${it.material}`} value={it.leadTimeDays} onChange={(v) => setLeadTime(it.lineId, v)} />
                          <small>{it.leadTimeIsDefault ? 'default' : 'set for this lead'}</small>
                        </>
                      : formatNum(it.leadTimeDays)}
                  </td>
                  <td>{it.orderBy ? fmtDate(it.orderBy) : ''}{it.overdue && <strong> overdue</strong>}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
