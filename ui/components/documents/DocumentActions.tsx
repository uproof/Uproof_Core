'use client';

import { useEstimate } from '@/ui/state/EstimateContext';
import { printPath } from '@/ui/navigation';

/** "Open in own window" renders the document route without the app shell; "Print" prints the current page. */
export function DocumentActions({ doc }: { doc: string }) {
  const { leadId, offerFinalised } = useEstimate();
  return (
    <>
      <button type="button" disabled={!offerFinalised} onClick={() => { window.location.href = printPath(leadId, doc); }}>Open document</button>
      <button type="button" disabled={!offerFinalised} onClick={() => window.print()}>Print</button>
      {!offerFinalised && <small>Finalise the offer before printing.</small>}
    </>
  );
}
