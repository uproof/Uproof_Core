import { formatEur, formatNum } from '@/workbook-ui/lib/format';
import type { EstimateOutputs } from '@/workbook-ui/api';

/** The three totals the workbook produces side by side (spec section 7.1). */
export function PricingModels({ outputs }: { outputs: EstimateOutputs }) {
  const { summary: s, f2, offer: o, constants: k } = outputs;
  const models = [
    { id: 'A', title: 'Model A: summary', total: s.offer, note: 'excl. VAT, base labor + profit', points: ['Uses slope and travel coefficients', 'VSAOI on base labor only'] },
    { id: 'B', title: 'Model B: F2 form', total: f2.exVat, note: `excl. VAT, labor ×${formatNum(k.labor_markup_factor)} + overhead + profit`, points: ['All materials included', `VAT adds ${formatEur(f2.vat)}`] },
    { id: 'C', title: 'Model C: client offer', total: o.total, note: `after ${formatEur(o.discount)} discount`, points: ['Shown to the client', o.omittedMaterials > 0.5 ? `Leaves out ${formatEur(o.omittedMaterials)} of materials` : 'All material groups covered'], selected: true },
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
