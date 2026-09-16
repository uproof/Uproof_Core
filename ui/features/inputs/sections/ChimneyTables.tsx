'use client';

import { InputCell } from './InputCell';

interface GroupDef { prefix: string; count: number; title: string; dims: [suffix: string, label: string][] }

const PERIMETER: GroupDef['dims'] = [['perimeter_m', 'Perimeter, m'], ['height_m', 'Height, m'], ['area_m2', 'Area, m²']];
const CAP: GroupDef['dims'] = [['length_m', 'Length, m'], ['width_m', 'Width, m'], ['area_m2', 'Area, m²']];

export const CHIMNEY_GROUPS: GroupDef[] = [
  { prefix: 'chimney_rebuild', count: 6, title: 'Rebuild masonry', dims: PERIMETER },
  { prefix: 'chimney_plaster', count: 5, title: 'Re-plaster', dims: PERIMETER },
  { prefix: 'chimney_cladding', count: 7, title: 'Sheet-metal cladding', dims: PERIMETER },
  { prefix: 'chimney_cap_plain', count: 4, title: 'Cap without screen', dims: CAP },
  { prefix: 'chimney_cap_screen', count: 3, title: 'Cap with screen', dims: CAP },
];

export function ChimneyTables() {
  return (
    <div className="two-columns">
      {CHIMNEY_GROUPS.map((g) => (
        <div className="table-wrap" key={g.prefix}>
          <table className="table">
            <thead><tr><th>{g.title}</th>{g.dims.map(([, l]) => <th key={l} className="num">{l}</th>)}</tr></thead>
            <tbody>
              {Array.from({ length: g.count }, (_, i) => (
                <tr key={i}>
                  <td>{g.title} {i + 1}</td>
                  {g.dims.map(([suffix, l]) => <td key={suffix}><InputCell inputKey={`${g.prefix}_${i + 1}_${suffix}`} label={`${g.title} ${i + 1} ${l}`} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
