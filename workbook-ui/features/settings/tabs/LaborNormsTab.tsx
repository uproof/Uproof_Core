import { Fragment, useMemo, useState } from 'react';
import { NumberInput, SearchBox } from '@/workbook-ui/components/common';
import { formatNum } from '@/workbook-ui/lib/format';
import { useEstimate } from '@/workbook-ui/state/EstimateContext';

export function LaborNormsTab() {
  const { settings, overrides, setOverride } = useEstimate();
  const [query, setQuery] = useState('');
  const norms = settings!.values.norms;
  const byCategory = useMemo(() => {
    const q = query.toLowerCase();
    const groups = new Map<string, typeof norms>();
    for (const n of norms) {
      if (q && !`${n.cat} ${n.name} ${n.op ?? ''}`.toLowerCase().includes(q)) continue;
      groups.set(n.cat, [...(groups.get(n.cat) ?? []), n]);
    }
    return [...groups.entries()];
  }, [norms, query]);

  return (
    <>
      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Search operations" />
        <span>Hours per unit. Hourly rate and markup are under Constants.</span>
      </div>
      <div className="table-wrap" style={{ maxHeight: '65vh' }}>
        <table className="table">
          <thead><tr><th>Operation</th><th>Includes</th><th>Unit</th><th className="num">Hours / unit</th><th className="num">Units per 8 h</th></tr></thead>
          <tbody>
            {byCategory.map(([cat, rows]) => (
              <Fragment key={cat}>
                <tr className="row-section"><td colSpan={5}>{cat}</td></tr>
                {rows.map((n) => {
                  const isOver = n.id in overrides.norms;
                  const hours = isOver ? overrides.norms[n.id] : n.hours;
                  return (
                    <tr key={n.id}>
                      <td>{n.name}</td><td>{n.op}</td><td>{n.unit}</td>
                      <td className="num"><NumberInput label={`Hours for ${n.name}`} value={hours} baseValue={isOver ? n.hours : undefined} onChange={(v) => setOverride('norms', n.id, v)} /></td>
                      <td className="num">{hours ? formatNum(8 / hours) : ''}</td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
