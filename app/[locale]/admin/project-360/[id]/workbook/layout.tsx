'use client';

import type { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { EstimateProvider } from '@/ui/state/EstimateContext';

/** One estimate context per lead, shared by the app pages and the print windows. */
export default function LeadLayout({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  return <EstimateProvider leadId={decodeURIComponent(id)}>{children}</EstimateProvider>;
}
