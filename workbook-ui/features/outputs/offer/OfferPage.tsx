import { Notice, PageHeader } from '@/workbook-ui/components/common';
import { DocumentActions } from '@/workbook-ui/components/documents/DocumentActions';
import { formatEur } from '@/workbook-ui/lib/format';
import { useOutputs } from '@/workbook-ui/state/EstimateContext';
import { OfferDocument } from './OfferDocument';

export function OfferPage() {
  const outputs = useOutputs();
  if (!outputs) return null;
  return (
    <>
      <PageHeader title="Offer" titleLv="Piedāvājums" description="What the client receives." actions={<DocumentActions doc="offer" />} />
      {outputs.offer.omittedMaterials > 0.5 && (
        <Notice tone="warning">
          {formatEur(outputs.offer.omittedMaterials)} of materials are not in this offer. The workbook offer only adds 17 material groups (spec issue 1).
        </Notice>
      )}
      <OfferDocument />
    </>
  );
}
