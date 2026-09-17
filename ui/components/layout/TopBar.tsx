'use client';

import { useEstimate } from '@/ui/state/EstimateContext';
import { formatEur, formatNum, format2 } from '@/ui/lib/format';

/** Always-visible totals. Updates live after each recalculation. */
export function TopBar() {
  const { lead, outputs, status } = useEstimate();
  return (
    <header className="topbar" aria-live="polite" aria-busy={status === 'calculating'}>
      <div className="topbar-title">
        <h1>{lead?.terms.address}</h1>
      </div>
      {outputs && (
        <dl className="topbar-kpis">
          <Kpi label="Roof area" value={`${formatNum(outputs.summary.roofM2)} m²`} />
          <Kpi label="Work" value={`${format2(outputs.f2.hours)} h`} />
          <Kpi label="Duration" value={`${outputs.offer.days} days`} />
          <Kpi label="F2 excl. VAT" value={formatEur(outputs.f2.exVat)} />
          <Kpi label="Offer total" value={formatEur(outputs.offer.total)} primary />
        </dl>
      )}
    </header>
  );
}

function Kpi({ label, value, primary }: { label: string; value: string; primary?: boolean }) {
  return (
    <div className={primary ? 'kpi kpi-primary' : 'kpi'}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
