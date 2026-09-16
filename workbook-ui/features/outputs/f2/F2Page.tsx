import { PageHeader, Toggle } from '@/workbook-ui/components/common';
import { DocumentActions } from '@/workbook-ui/components/documents/DocumentActions';
import { useEstimate } from '@/workbook-ui/state/EstimateContext';
import { useLocalState } from '@/workbook-ui/state/useLocalState';
import { F2Document } from './F2Document';

export function F2Page() {
  const { leadId } = useEstimate();
  const [hideEmpty, setHideEmpty] = useLocalState(`f2HideEmpty:${leadId}`, true);
  return (
    <>
      <PageHeader title="Estimate form" titleLv="F2 forma" description="Local estimate in the standard Latvian format."
        actions={<><Toggle checked={hideEmpty} onChange={setHideEmpty} label="Hide empty rows" /><DocumentActions doc="f2" /></>} />
      <F2Document key={String(hideEmpty)} />
    </>
  );
}
