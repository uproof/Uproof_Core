import { useEstimate } from '@/workbook-ui/state/EstimateContext';
import { printPath } from '@/workbook-ui/app/navigation';

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
