'use client';

import { formatEur, formatNum } from '@/ui/lib/format';
import type { EstimateOutputs } from '@/ui/api';

/** The three workbook totals shown side by side. */
export function PricingModels({ outputs }: { outputs: EstimateOutputs }) {
  const { summary: s, f2, offer: o, constants: k } = outputs;
  const models = [
    { id: 'A', title: 'Kopsavilkums', total: s.offer, note: 'Bez PVN, pamatdarbs un peļņa', points: ['Izmanto slīpuma un komandējuma koeficientus', 'VSAOI tikai pamatdarbam'] },
    { id: 'B', title: 'F2 forma', total: f2.exVat, note: `Bez PVN, darbs ×${formatNum(k.labor_markup_factor)} + virsizdevumi + peļņa`, points: ['Iekļauti visi materiāli', `PVN: ${formatEur(f2.vat)}`] },
    { id: 'C', title: 'Piedāvājums', total: o.total, note: `Pēc ${formatEur(o.discount)} atlaides`, points: ['Klientam paredzēts', o.omittedMaterials > 0.5 ? `Neietver ${formatEur(o.omittedMaterials)} materiālus` : 'Iekļautas visas materiālu grupas'], selected: true },
  ];
  return (
    <div className="card-grid three">
      {models.map((m) => (
        <article key={m.id} className={m.selected ? 'card is-selected' : 'card'}>
          <h4>{m.title}</h4>
          <p className="card-value">{formatEur(m.total)}</p>
          <small>{m.note}</small>
          <ul>{m.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </article>
      ))}
    </div>
  );
}
