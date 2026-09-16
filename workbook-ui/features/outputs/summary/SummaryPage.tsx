import { DataTable, PageHeader, Toggle, type Column } from '@/workbook-ui/components/common';
import type { SummaryLine } from '@/workbook-ui/engine';
import { format2, formatNum } from '@/workbook-ui/lib/format';
import { useEstimate } from '@/workbook-ui/state/EstimateContext';
import { useLocalState } from '@/workbook-ui/state/useLocalState';
import { PricingModels } from './PricingModels';
import { ModelABreakdown } from './ModelABreakdown';

const COLUMNS: Column<SummaryLine>[] = [
  { key: 'name', header: 'Work group', render: (l) => l.name },
  { key: 'qty', header: 'Qty', align: 'right', render: (l) => (l.qty ? `${formatNum(l.qty)} ${l.unit}` : '') },
  { key: 'materials', header: 'Materials €', align: 'right', render: (l) => format2(l.materials) },
  { key: 'hours', header: 'Hours', align: 'right', render: (l) => format2(l.hours) },
  { key: 'labor', header: 'Labor €', align: 'right', render: (l) => format2(l.labor) },
  { key: 'total', header: 'Total €', align: 'right', render: (l) => format2(l.total) },
];

/** Kopsavilkums: work groups, pricing model A and comparison with B and C. */
export function SummaryPage() {
  const { outputs, leadId } = useEstimate();
  const [hideEmpty, setHideEmpty] = useLocalState(`summaryHideEmpty:${leadId}`, true);
  if (!outputs) return null;
  const s = outputs.summary;
  const rows = s.lines.filter((l) => !hideEmpty || l.total || l.qty);
  return (
    <>
      <PageHeader title="Summary" titleLv="Kopsavilkums" description="Costs by work group and the three totals."
        actions={<Toggle checked={hideEmpty} onChange={setHideEmpty} label="Hide empty groups" />} />
      <PricingModels outputs={outputs} />
      <div className="two-columns main-aside">
        <DataTable rows={rows} columns={COLUMNS} rowKey={(l) => l.name}
          footer={<tr className="row-total"><td>Total</td><td /><td className="num">{format2(s.materials)}</td><td className="num">{format2(s.hours)}</td><td className="num">{format2(s.lines.reduce((a, l) => a + l.labor, 0))}</td><td className="num">{format2(s.lines.reduce((a, l) => a + l.total, 0))}</td></tr>} />
        <ModelABreakdown outputs={outputs} />
      </div>
    </>
  );
}
