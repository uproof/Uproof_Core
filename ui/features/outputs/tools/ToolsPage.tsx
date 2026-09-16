'use client';

import { PageHeader } from '@/ui/components/common';
import { DocumentActions } from '@/ui/components/documents/DocumentActions';
import { useOutputs } from '@/ui/state/EstimateContext';
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
