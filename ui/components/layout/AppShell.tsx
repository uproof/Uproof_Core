'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useEstimate } from '@/ui/state/EstimateContext';
import { CrmLeadSummaryNavigator } from '@/ui/components/CrmLeadSummaryNavigator';

/** Sidebar + sticky totals bar + routed page. */
export function AppShell({ children }: { children: ReactNode }) {
  const { status, error, leadId, lead, saveLeadData, reloadLead } = useEstimate();
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [saved, setSaved] = useState(false);
  const locale = pathname.match(/^\/(lv|en|nl-BE)(?:\/|$)/)?.[1] || 'en';
  const projectPath = `/${locale}/admin/project-360/${encodeURIComponent(leadId)}`;
  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveLeadData();
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };
  const process = async () => {
    setProcessing(true);
    try {
      await saveLeadData();
      await reloadLead();
    } finally {
      setProcessing(false);
    }
  };
  return (
    <div className={compact ? 'shell is-compact' : 'shell'}>
      <Sidebar />
      <div className="shell-main">
        <div className="workbook-toolbar no-print">
          <div className="workbook-toolbar-title">Workbook estimator</div>
          <div className="workbook-toolbar-actions">
            <button type="button" className="toolbar-control" onClick={() => setCompact((value) => !value)}>{compact ? 'Show navigation' : 'Expand workspace'}</button>
            <button type="button" className="toolbar-control toolbar-control-primary" onClick={() => void save()} disabled={saving}>{saving ? 'Saving…' : saved ? 'Saved' : 'Save data'}</button>
            <button type="button" className="toolbar-control" onClick={() => void process()} disabled={processing}>{processing ? 'Processing…' : 'Process'}</button>
            <a href={projectPath} className="button toolbar-control">Back to project</a>
          </div>
        </div>
        <TopBar />
        <main className="page">
          {status === 'error' && error && (
            <div className="notice notice-warning" role="alert">
              <strong>{error.status ? 'Calculation stopped: ' : 'Cannot reach the estimator API: '}</strong>{error.message}
              {error.fields && <ul>{Object.entries(error.fields).map(([k, v]) => <li key={k}>{v} ({k})</li>)}</ul>}
            </div>
          )}
          {status === 'loading' && !error ? <p>Loading estimate…</p> : <><CrmLeadSummaryNavigator data={lead?.crmEstimatorData} />{children}</>}
        </main>
      </div>
    </div>
  );
}
