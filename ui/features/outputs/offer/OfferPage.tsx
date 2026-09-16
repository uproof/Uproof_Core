'use client';

import { useState } from 'react';
import { Notice, PageHeader } from '@/ui/components/common';
import { DocumentActions } from '@/ui/components/documents/DocumentActions';
import { formatEur } from '@/ui/lib/format';
import { useEstimate } from '@/ui/state/EstimateContext';
import { OfferDocument } from './OfferDocument';

export function OfferPage() {
  const { outputs, saveEstimate, savedEstimates } = useEstimate();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  if (!outputs) return null;
  const onSave = async () => {
    setSaving(true);
    try {
      const saved = await saveEstimate();
      setMessage(`Saved estimate #${saved.id} (${formatEur(saved.offerTotal)}, settings version ${saved.settingsVersionId}).`);
    } catch (e) {
      setMessage(`Could not save: ${(e as { message?: string }).message ?? 'unknown error'}`);
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <PageHeader title="Offer" titleLv="Piedāvājums" description="What the client receives."
        actions={<><button type="button" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save estimate'}</button><DocumentActions doc="offer" /></>} />
      {message && <Notice>{message}</Notice>}
      {!message && savedEstimates.length > 0 && <Notice>Last saved estimate #{savedEstimates[0].id}: {formatEur(savedEstimates[0].offerTotal)}.</Notice>}
      {outputs.offer.omittedMaterials > 0.5 && (
        <Notice tone="warning">
          {formatEur(outputs.offer.omittedMaterials)} of materials are not in this offer. The workbook offer only adds 17 material groups (spec issue 1).
        </Notice>
      )}
      <OfferDocument />
    </>
  );
}
