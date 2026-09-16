'use client';

import { DataTable, PageHeader, Toggle, type Column } from '@/ui/components/common';
import type { SummaryLine } from '@/ui/api';
import { format2, formatEur, formatNum, formatPct } from '@/ui/lib/format';
import { useEstimate } from '@/ui/state/EstimateContext';
import { useLocalState } from '@/ui/state/useLocalState';
import { PricingModels } from './PricingModels';
import { ModelABreakdown } from './ModelABreakdown';

const COLUMNS: Column<SummaryLine>[] = [
  { key: 'name', header: 'Work group', render: (l) => l.name },
  { key: 'qty', header: 'Qty', align: 'right', render: (l) => (l.qty ? `${formatNum(l.qty)} ${l.unit}` : '') },
  { key: 'materials', header: 'Materials €', align: 'right', render: (l) => format2(l.materials) },
  { key: 'hours', header: 'Hours', align: 'right', render: (l) => format2(l.hours) },
  { key: 'labor', header: 'Labor €', align: 'right', render: (l) => format2(l.labor) },
  { key: 'total', header: 'Total €', align: 'right', render: (l) => <span className={l.total > 1000 ? 'cost-high' : l.total > 500 ? 'cost-medium' : ''}>{format2(l.total)}</span> },
];

/** Kopsavilkums: work groups, pricing model A and comparison with B and C. */
export function SummaryPage() {
  const { outputs, leadId } = useEstimate();
  const [hideEmpty, setHideEmpty] = useLocalState(`summaryHideEmpty:${leadId}`, true);
  if (!outputs) return null;
  const s = outputs.summary;
  const f2 = outputs.f2;
  const rows = s.lines.filter((l) => !hideEmpty || l.total || l.qty);
  const labor = s.lines.reduce((total, line) => total + line.labor, 0);
  const pricePerM2 = outputs.offer.total / (s.roofM2 || 1);
  const kpis = [
    ['Materiāli', formatEur(s.materials)],
    ['Transports', formatEur(s.transport)],
    ['Mehānismi', formatEur(s.mechanisms)],
    ['Darba stundas', `${format2(f2.hours)} h`],
    ['Darba dienas', `${s.days}`],
    ['Darba devēja nodoklis', formatEur(s.vsaoi)],
    ['Kopējās izmaksas', formatEur(s.cost)],
    ['Peļņa', formatEur(s.profit)],
    ['Peļņas %', formatPct(s.offer ? s.profit / s.offer : 0)],
    ['Peļņa dienā', formatEur(s.days ? s.profit / s.days : 0)],
    ['Kopā bez PVN', formatEur(s.offer)],
    ['Cena / m²', formatEur(pricePerM2)],
    ['PVN', formatEur(s.vat)],
    ['Kopā ar PVN', formatEur(s.offerVat)],
  ];
  return (
    <>
      <PageHeader title="Summary" titleLv="Kopsavilkums" description="Costs by work group and the three totals."
        actions={<Toggle checked={hideEmpty} onChange={setHideEmpty} label="Hide empty groups" />} />
      <PricingModels outputs={outputs} />
      <div className="card-grid four summary-kpis">
        {kpis.map(([label, value]) => <article key={label} className={label === 'Cena / m²' && pricePerM2 > 150 ? 'card kpi-danger' : 'card'}><h4>{label}</h4><p className="card-value">{value}</p></article>)}
      </div>
      <div className="two-columns main-aside">
        <DataTable rows={rows} columns={COLUMNS} rowKey={(l) => l.name}
          footer={<tr className="row-total"><td>Total</td><td /><td className="num">{format2(s.materials)}</td><td className="num">{format2(s.hours)}</td><td className="num">{format2(labor)}</td><td className="num">{format2(s.lines.reduce((a, l) => a + l.total, 0))}</td></tr>} />
        <ModelABreakdown outputs={outputs} />
      </div>
    </>
  );
}
