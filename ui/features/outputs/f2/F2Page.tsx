'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { leadPath } from '@/ui/navigation';
import { PageHeader, Toggle } from '@/ui/components/common';
import { useLocalState } from '@/ui/state/useLocalState';
import { DocumentActions } from '@/ui/components/documents/DocumentActions';
import { API_BASE_URL } from '@/ui/api';
import { useEstimate } from '@/ui/state/EstimateContext';
import { F2Sheet } from './F2Sheet';

export function F2Page() {
  const { leadId, status, saveLeadData } = useEstimate();
  const router = useRouter();
  const [advancing, setAdvancing] = useState(false);
  const [nextError, setNextError] = useState<string | null>(null);
  const [showFiltered, setShowFiltered] = useLocalState('f2ShowFiltered', false);
  const next = async () => {
    setAdvancing(true);
    setNextError(null);
    try { await saveLeadData(); router.push(leadPath(leadId, 'summary')); }
    catch (error) { setNextError(error instanceof Error ? error.message : 'Could not save the estimate form.'); }
    finally { setAdvancing(false); }
  };
  return (
    <>
      <PageHeader title="Estimate form" titleLv="F2 forma"
        description="Same layout as the workbook sheet, including its filter that hides rows with Kopā (EUR) = 0."
        actions={<>
          <Toggle checked={showFiltered} onChange={setShowFiltered} label="Show rows hidden by the filter" />
          <a className="button" href={`${API_BASE_URL}/leads/${encodeURIComponent(leadId)}/f2.xlsx`} aria-disabled={status === 'calculating'}>Download .xlsx</a>
          <DocumentActions doc="f2" />
          <button type="button" className="button primary" onClick={() => void next()} disabled={advancing}>{advancing ? 'Saving…' : 'Next →'}</button>
        </>} />
      <F2Sheet showFiltered={showFiltered} />
      {nextError && <p className="notice notice-warning">{nextError}</p>}
    </>
  );
}
