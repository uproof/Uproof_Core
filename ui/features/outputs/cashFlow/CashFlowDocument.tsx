'use client';

import { Notice } from '@/ui/components/common';
import { formatEur, format2, formatPct } from '@/ui/lib/format';
import { useOutputs } from '@/ui/state/EstimateContext';
import { EmptyOutputState } from '@/ui/components/EmptyOutputState';

const STAGE_NAMES = ['Stage 1: up to gutters', 'Stage 2: sheet metal', 'Stage 3: additional elements'];

export function CashFlowDocument() {
  const outputs = useOutputs();
  if (!outputs) return <EmptyOutputState title="Payments" columns={['Stage', 'Client pays €', 'Cost €', 'Difference €']} />;
  const { cashFlow: c, offer, constants: k } = outputs;
  const costTotal = c.stages.reduce((a, s) => a + s.cost, 0);
  const first = c.stages[0];
  return (
    <>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Stage</th><th className="num">Client pays €</th><th className="num">Attributable cost €</th><th className="num">Difference €</th><th>Cost share of payment</th></tr></thead>
          <tbody>
            {c.stages.map((s, i) => (
              <tr key={i}>
                <td>{STAGE_NAMES[i] ?? `Stage ${i + 1}`}</td>
                <td className="num">{format2(s.amount)}</td>
                <td className="num">{format2(s.cost)}</td>
                <td className="num">{format2(s.amount - s.cost)}</td>
                <td><meter min={0} max={Math.max(s.amount, s.cost)} value={s.cost} aria-label={`Cost vs payment, stage ${i + 1}`} /></td>
              </tr>
            ))}
            <tr><td>Final payment {formatPct(k.final_payment_share)}</td><td className="num">{format2(c.final)}</td><td /><td className="num">{format2(c.final)}</td><td /></tr>
          </tbody>
          <tfoot><tr className="row-total"><td>Total</td><td className="num">{format2(offer.total)}</td><td className="num">{format2(costTotal)}</td><td className="num">{format2(offer.total - costTotal)}</td><td /></tr></tfoot>
        </table>
      </div>
      {first && first.cost > first.amount && (
        <Notice tone="warning">Stage 1 costs exceed the stage 1 payment by {formatEur(first.cost - first.amount)}.</Notice>
      )}
    </>
  );
}
