import { useParams } from 'react-router-dom';
import type { ComponentType } from 'react';
import { useEstimate } from '@/workbook-ui/state/EstimateContext';

/** Standalone window for one output document. Shares data via the same lead draft. */
export function PrintView({ documents }: { documents: Record<string, ComponentType> }) {
  const { doc = '' } = useParams();
  const { outputs } = useEstimate();
  const Doc = documents[doc];
  if (!Doc) return <p>Unknown document “{doc}”.</p>;
  if (!outputs) return <p>Preparing document…</p>;
  return (
    <div className="print-view">
      <div className="print-toolbar no-print"><button type="button" onClick={() => window.print()}>Print</button></div>
      <Doc />
    </div>
  );
}
