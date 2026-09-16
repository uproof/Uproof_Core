'use client';

import { Notice, PageHeader, Toggle } from '@/ui/components/common';
import { DocumentActions } from '@/ui/components/documents/DocumentActions';
import { useEstimate } from '@/ui/state/EstimateContext';
import { ProcurementDocument } from './ProcurementDocument';

export function ProcurementPage() {
  const { outputs, lead, setTerm } = useEstimate();
  const overdue = outputs?.procurement.items.filter((i) => i.overdue).length ?? 0;
  return (
    <>
      <PageHeader title="Materials plan" titleLv="Materiālu saraksts"
        description="Materials needed on the day each task starts. Enter lead times to get order-by dates."
        actions={<>{lead && <Toggle checked={lead.terms.procurementIncludeLabor} onChange={(v) => setTerm('procurementIncludeLabor', v)} label="Include labor-only lines" />}<DocumentActions doc="procurement" /></>} />
      {overdue > 0 && <Notice tone="warning">{overdue} item{overdue > 1 ? 's are' : ' is'} past the order-by date.</Notice>}
      <ProcurementDocument editable />
    </>
  );
}
