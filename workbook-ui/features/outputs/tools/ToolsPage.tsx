import { PageHeader } from '@/workbook-ui/components/common';
import { DocumentActions } from '@/workbook-ui/components/documents/DocumentActions';
import { useOutputs } from '@/workbook-ui/state/EstimateContext';
import { ToolsDocument } from './ToolsDocument';

export function ToolsPage() {
  const outputs = useOutputs();
  return (
    <>
      <PageHeader title="Tools" titleLv="Mehānismu saraksts" description={outputs ? `${outputs.tools.length} tools needed for this job.` : undefined} actions={<DocumentActions doc="tools" />} />
      <ToolsDocument />
    </>
  );
}
