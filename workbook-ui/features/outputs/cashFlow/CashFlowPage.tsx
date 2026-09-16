import { PageHeader } from '@/workbook-ui/components/common';
import { DocumentActions } from '@/workbook-ui/components/documents/DocumentActions';
import { CashFlowDocument } from './CashFlowDocument';

export function CashFlowPage() {
  return (
    <>
      <PageHeader title="Payments" titleLv="Naudas plūsma" description="Client payments per stage against costs of that stage." actions={<DocumentActions doc="payments" />} />
      <CashFlowDocument />
    </>
  );
}
