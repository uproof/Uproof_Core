'use client';

import { Fragment, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { leadPath } from '@/ui/navigation';
import { PageHeader, SearchBox, Toggle } from '@/ui/components/common';
import { EmptyOutputState } from '@/ui/components/EmptyOutputState';
import { format2, formatNum } from '@/ui/lib/format';
import { useEstimate } from '@/ui/state/EstimateContext';
import { groupLines, isActiveLine } from './groupLines';

/** Step 3: every Tāme line, grouped by block. Read-only; edits happen in Inputs or Settings. */
export function LineItemsPage() {
  const { outputs, leadId, saveLeadData } = useEstimate();
  const router = useRouter();
  const [advancing, setAdvancing] = useState(false);
  const [nextError, setNextError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [closed, setClosed] = useState<Set<number>>(new Set());
  const blocks = useMemo(() => (outputs ? groupLines(outputs.lines, { query, activeOnly }) : []), [outputs, query, activeOnly]);
  if (!outputs) return <><PageHeader title="Line items" titleLv="Tāme" /><EmptyOutputState title="Line items" columns={['Line', 'Qty', 'Reserve', 'Unit price €', 'Materials €', 'Hours', 'Labor €']} /></>;

  const toggle = (row: number) => setClosed((s) => { const n = new Set(s); n.has(row) ? n.delete(row) : n.add(row); return n; });
  const next = async () => {
    setAdvancing(true);
    setNextError(null);
    try { await saveLeadData(); router.push(leadPath(leadId, 'offer')); }
    catch (error) { setNextError(error instanceof Error ? error.message : 'Could not save line items.'); }
    finally { setAdvancing(false); }
  };
  const totals = outputs.lines.reduce((a, l) => ({ m: a.m + l.materials, h: a.h + l.hours, l: a.l + l.labor }), { m: 0, h: 0, l: 0 });

  return (
    <>
      <PageHeader title="Line items" titleLv="Tāme" description="Quantities, waste reserve, prices and labor produced from the inputs."
        actions={<button type="button" className="button primary" onClick={() => void next()} disabled={advancing}>{advancing ? 'Saving…' : 'Next →'}</button>} />
      {nextError && <p className="notice notice-warning">{nextError}</p>}
      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Search line items" />
        <Toggle checked={activeOnly} onChange={setActiveOnly} label="Only lines in this job" />
        <button type="button" onClick={() => setClosed(closed.size ? new Set() : new Set(blocks.map((b) => b.blockRow)))}>{closed.size ? 'Expand all' : 'Collapse all'}</button>
      </div>
      <div className="table-wrap" style={{ maxHeight: '72vh' }}>
        <table className="table">
          <thead>
            <tr><th>Line</th><th className="num">Qty</th><th className="num">Reserve</th><th className="num">With reserve</th><th className="num">Unit price €</th><th className="num">Materials €</th><th className="num">Hours</th><th className="num">Labor €</th></tr>
          </thead>
          <tbody>
            {blocks.length === 0 && <tr><td colSpan={8}>No lines match. Clear the search or turn off the filter.</td></tr>}
            {blocks.map((b) => (
              <Fragment key={b.blockRow}>
                <tr className="row-group" aria-expanded={!closed.has(b.blockRow)} onClick={() => toggle(b.blockRow)}>
                  <td colSpan={5}>{b.name} <small>rows {b.firstRow} to {b.lastRow}</small></td>
                  <td className="num">{format2(b.materials)}</td><td className="num">{format2(b.hours)}</td><td className="num">{format2(b.labor)}</td>
                </tr>
                {!closed.has(b.blockRow) && b.lines.map((l) => (
                  <tr key={l.row} className={isActiveLine(l) ? undefined : 'row-muted'}>
                    <td>{l.name}{l.tools.length > 0 && <><br /><small>{l.tools.join(', ')}</small></>}</td>
                    <td className="num">{formatNum(l.qty)}</td>
                    <td className="num">{l.reserve ? `×${formatNum(l.reserve)}` : ''}</td>
                    <td className="num">{formatNum(l.qtyRes)} {l.unit}</td>
                    <td className="num">{l.price ? format2(l.price) : ''}</td>
                    <td className="num">{l.materials ? format2(l.materials) : ''}</td>
                    <td className="num">{l.hours ? format2(l.hours) : ''}</td>
                    <td className="num">{l.labor ? format2(l.labor) : ''}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="row-total"><td colSpan={5}>Total incl. transport and site costs</td><td className="num">{format2(totals.m)}</td><td className="num">{format2(totals.h)}</td><td className="num">{format2(totals.l)}</td></tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
