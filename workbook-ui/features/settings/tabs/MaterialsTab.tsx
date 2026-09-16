import { useMemo, useState } from 'react';
import { DataTable, NumberInput, SearchBox, type Column } from '@/workbook-ui/components/common';
import type { MaterialSetting } from '@/workbook-ui/engine';
import { useEstimate } from '@/workbook-ui/state/EstimateContext';

export function MaterialsTab() {
  const { settings, overrides, setOverride } = useEstimate();
  const [query, setQuery] = useState('');
  const all = settings!.values.materials;
  const rows = useMemo(() => {
    const q = query.toLowerCase();
    return all.filter((m) => !q || `${m.id} ${m.name} ${m.supplier ?? ''}`.toLowerCase().includes(q));
  }, [all, query]);

  const columns: Column<MaterialSetting>[] = [
    { key: 'id', header: 'ID', render: (m) => m.id },
    { key: 'name', header: 'Material', render: (m) => m.name },
    { key: 'supplier', header: 'Supplier', render: (m) => m.supplier },
    { key: 'vat', header: 'VAT factor', align: 'right', render: (m) => m.vat },
    {
      key: 'price', header: 'Price € excl. VAT', align: 'right', width: '150px',
      render: (m) => {
        const isOver = m.id in overrides.materials;
        return <NumberInput label={`Price for ${m.name}`} value={isOver ? overrides.materials[m.id] : m.price}
          baseValue={isOver ? m.price : undefined} onChange={(v) => setOverride('materials', m.id, v)} />;
      },
    },
  ];
  return (
    <>
      <div className="toolbar">
        <SearchBox value={query} onChange={setQuery} placeholder="Search materials or suppliers" />
        <span>{rows.length} of {all.length}</span>
      </div>
      <DataTable rows={rows} columns={columns} rowKey={(m) => m.id} maxHeight="65vh" empty="No materials match." />
    </>
  );
}
