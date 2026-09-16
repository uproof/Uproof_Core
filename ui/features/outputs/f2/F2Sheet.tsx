'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { api } from '@/ui/api';
import { BORDER_PX, cellValue, formatCell, heightToPx, isRowFiltered, widthToPx, type F2Layout, type F2Style } from '@/shared/f2Sheet';
import { useEstimate } from '@/ui/state/EstimateContext';

let layoutCache: Promise<F2Layout> | null = null;
const loadLayout = () => (layoutCache ??= api.getF2Layout());

function cellStyle(st: F2Style): CSSProperties {
  const [top, right, bottom, left] = st.border;
  const b = (x: string | null) => (x ? `${BORDER_PX[x] ?? 1}px solid #000` : undefined);
  return {
    fontFamily: `"${st.font}", ${st.font === 'Times New Roman' ? 'serif' : 'sans-serif'}`,
    fontSize: `${st.size}pt`,
    fontWeight: st.bold ? 700 : 400,
    fontStyle: st.italic ? 'italic' : 'normal',
    color: st.color ?? '#000',
    background: st.fill ?? '#fff',
    borderTop: b(top), borderRight: b(right), borderBottom: b(bottom), borderLeft: b(left),
    padding: 0,
    overflow: 'hidden',
  };
}

/** Inner box with the row's fixed height: wrapped text is clipped like in the spreadsheet, never grows the row. */
function contentStyle(st: F2Style, isNumber: boolean, heightPx: number): CSSProperties {
  const h = st.h && st.h !== 'general' ? st.h : isNumber ? 'right' : 'left';
  return {
    height: heightPx,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: st.v === 'center' ? 'center' : st.v === 'top' ? 'flex-start' : 'flex-end',
    textAlign: h as CSSProperties['textAlign'],
    whiteSpace: st.wrap ? 'normal' : 'nowrap',
    padding: '0 3px',
    lineHeight: 1.15,
    position: 'relative',
  };
}

/**
 * F2 forma rendered cell by cell like the workbook sheet: same rows (1-304), columns (A-O), widths, heights,
 * merged cells, fonts, borders, number formats and frozen header (rows 1-6).
 */
export function F2Sheet({ date, showFiltered = false }: { date?: string; showFiltered?: boolean }) {
  const { outputs, lead } = useEstimate();
  const [layout, setLayout] = useState<F2Layout | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { loadLayout().then(setLayout).catch((e) => setError(String(e?.message ?? e))); }, []);
  if (error) return <p role="alert">Could not load the F2 layout: {error}</p>;
  if (!layout || !outputs || !lead) return <p>Preparing F2 forma…</p>;

  const data = { f2: outputs.f2 as never, constants: outputs.constants, address: lead.terms.address, date: date ?? new Date().toISOString().slice(0, 10) };
  const tops: number[] = [];
  let acc = 0;
  for (const row of layout.rows) { tops[row.r] = acc; acc += heightToPx(row.h); }
  const totalWidth = layout.columns.reduce((a, c) => a + widthToPx(c.width), 0);

  return (
    <div className="f2-sheet-frame">
      <table className="f2-sheet" style={{ width: totalWidth }}>
        <colgroup>
          <col style={{ width: 32 }} />
          {layout.columns.map((c) => <col key={c.c} style={{ width: widthToPx(c.width) }} />)}
        </colgroup>
        <tbody>
          <tr className="f2-col-headers">
            <th />
            {layout.columns.map((c) => <th key={c.c}>{c.c}</th>)}
          </tr>
          {layout.rows.map((row) => {
            if (!showFiltered && isRowFiltered(layout, row.r, data)) return null;
            const frozen = row.r <= layout.freezeRow;
            return (
              <tr key={row.r} style={{ height: heightToPx(row.h) }}>
                <th className="f2-row-header" style={frozen ? { position: 'sticky', top: tops[row.r] + 20, zIndex: 3 } : undefined}>{row.r}</th>
                {row.cells.map((cell) => {
                  const st = layout.styles[cell.s];
                  const v = cellValue(cell, row.r, data);
                  const style = cellStyle(st);
                  if (frozen) Object.assign(style, { position: 'sticky', top: tops[row.r] + 20, zIndex: 2 });
                  let heightPx = 0;
                  for (let k = 0; k < (cell.rs ?? 1); k++) heightPx += heightToPx(layout.rows[row.r - 1 + k].h);
                  return (
                    <td key={cell.c} rowSpan={cell.rs} colSpan={cell.cs} style={style} data-cell={`${cell.c}${row.r}`}>
                      <div style={contentStyle(st, typeof v === 'number', heightPx - 1)}>
                        {layout.images?.filter((img) => img.cell === `${cell.c}${row.r}`).map((img) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={img.src} src={img.src} alt="" width={img.widthPx} height={img.heightPx} style={{ position: 'absolute', left: 0, top: 0 }} />
                        ))}
                        <span>{formatCell(v, st.numFmt)}</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
