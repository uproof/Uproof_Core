'use client';

import { PrintView } from '@/ui/components/documents/PrintView';
import { PRINTABLE } from '@/ui/printable';

export default function WorkbookPrintPage() {
  return <PrintView documents={PRINTABLE} />;
}