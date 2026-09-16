'use client';

import { PageHeader } from '@/ui/components/common';
import { DocumentActions } from '@/ui/components/documents/DocumentActions';
import { MaterialsListDocument } from './MaterialsListDocument';

export function MaterialsListPage() {
  return (
    <>
      <PageHeader title="Purchase list" titleLv="Iepirkumu saraksts" description="Purchase list by supplier, waste reserve included." actions={<DocumentActions doc="materials" />} />
      <MaterialsListDocument />
    </>
  );
}
