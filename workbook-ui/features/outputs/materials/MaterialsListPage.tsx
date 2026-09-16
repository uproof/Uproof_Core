import { PageHeader } from '@/workbook-ui/components/common';
import { DocumentActions } from '@/workbook-ui/components/documents/DocumentActions';
import { MaterialsListDocument } from './MaterialsListDocument';

export function MaterialsListPage() {
  return (
    <>
      <PageHeader title="Materials list" titleLv="Materiālu saraksts" description="Purchase list by supplier, waste reserve included." actions={<DocumentActions doc="materials" />} />
      <MaterialsListDocument />
    </>
  );
}
