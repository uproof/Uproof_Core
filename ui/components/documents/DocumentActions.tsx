'use client';

import { useEstimate } from '@/ui/state/EstimateContext';
import { printPath } from '@/ui/navigation';

/** "Open in own window" renders the document route without the app shell; "Print" prints the current page. */
export function DocumentActions({ doc }: { doc: string }) {
  const { leadId } = useEstimate();
  return (
    <>
      <button type="button" onClick={() => window.open(printPath(leadId, doc), `estimate-${doc}`, 'width=1100,height=900')}>Open in own window</button>
      <button type="button" onClick={() => window.print()}>Print</button>
    </>
  );
}
