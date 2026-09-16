'use client';

import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useEstimate } from '@/ui/state/EstimateContext';

/** Sidebar + sticky totals bar + routed page. */
export function AppShell({ children }: { children: ReactNode }) {
  const { status, error } = useEstimate();
  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-main">
        <TopBar />
        <main className="page">
          {status === 'error' && error && (
            <div className="notice notice-warning" role="alert">
              <strong>{error.status ? 'Calculation stopped: ' : 'Cannot reach the estimator API: '}</strong>{error.message}
              {error.fields && <ul>{Object.entries(error.fields).map(([k, v]) => <li key={k}>{v} ({k})</li>)}</ul>}
            </div>
          )}
          {status === 'loading' && !error ? <p>Loading estimate…</p> : children}
        </main>
      </div>
    </div>
  );
}
