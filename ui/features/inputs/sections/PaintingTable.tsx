'use client';

import { InputCell } from './InputCell';

const SURFACES: [key: string, label: string, labelLv: string][] = [
  ['wood_facade', 'Wood facade', 'Koka fasāde'],
  ['soffit', 'Soffit box', 'Vēja kaste'],
  ['masonry', 'Masonry facade', 'Mūra fasāde'],
];

export function PaintingTable() {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Surface</th><th className="num">Cleaning, m²</th><th className="num">Coats</th><th className="num">Area, m²</th></tr></thead>
        <tbody>
          {SURFACES.map(([k, label, lv]) => (
            <tr key={k}>
              <td>{label} <small>{lv}</small></td>
              <td><InputCell inputKey={`paint_${k}_cleaning_m2`} /></td>
              <td><InputCell inputKey={`paint_${k}_coats`} /></td>
              <td><InputCell inputKey={`paint_${k}_area_m2`} /></td>
            </tr>
          ))}
          <tr>
            <td>Masonry primer <small>Mūra gruntēšana</small></td><td />
            <td><InputCell inputKey="masonry_primer_coats" /></td>
            <td><InputCell inputKey="masonry_primer_area_m2" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
