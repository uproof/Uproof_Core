import { DataTable, Panel } from '@/workbook-ui/components/common';
import type { MaterialsListItem } from '@/workbook-ui/api';
import { formatEur, format2, formatNum } from '@/workbook-ui/lib/format';
import { useOutputs } from '@/workbook-ui/state/EstimateContext';

export function MaterialsListDocument() {
  const outputs = useOutputs();
  if (!outputs) return null;
  const groups = outputs.materialsList;
  const total = groups.reduce((a, g) => a + g.total, 0);
  return (
    <div className="stack">
      {groups.map((g) => (
        <Panel key={g.supplier} title={g.supplier} aside={<strong>{formatEur(g.total)}</strong>} flush>
          <DataTable<MaterialsListItem>
            rows={g.items}
            rowKey={(it) => it.name + it.unit}
            columns={[
              { key: 'name', header: 'Item', render: (it) => it.name },
              { key: 'qty', header: 'Quantity', align: 'right', render: (it) => formatNum(Math.round(it.qty * 1000) / 1000) },
              { key: 'unit', header: 'Unit', render: (it) => it.unit },
              { key: 'cost', header: 'Cost €', align: 'right', render: (it) => format2(it.cost) },
              { key: 'used', header: 'Used in', render: (it) => it.usedIn.join(', ') },
            ]}
          />
        </Panel>
      ))}
      <Panel><div className="split"><strong>All materials and services</strong><strong>{formatEur(total)}</strong></div></Panel>
    </div>
  );
}
