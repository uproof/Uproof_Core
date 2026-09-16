'use client';

import { useState } from 'react';
import { Notice, PageHeader } from '@/ui/components/common';
import { DocumentActions } from '@/ui/components/documents/DocumentActions';
import { formatEur } from '@/ui/lib/format';
import { useEstimate } from '@/ui/state/EstimateContext';
import { buildOfferLines } from './offerLayout';

export function OfferPage() {
  const { outputs, saveEstimate, savedEstimates, offerEdits, offerFinalised, setOfferEdit, finaliseOffer, offerTemplate, lead } = useEstimate();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  if (!outputs) return null;
  if (!offerTemplate || !lead) return null;
  const lines = buildOfferLines(outputs.offer, outputs.inputs, offerTemplate).map((line) => ({...line, ...offerEdits[line.line]}));
  const lineTotal = lines.reduce((sum, line) => sum + Number(line.amount || 0), 0);
  const subtotal = lineTotal + outputs.offer.labor + outputs.offer.vsaoi + outputs.offer.overhead - outputs.offer.discount;
  const vat = subtotal * outputs.offer.vatRate;
  const total = subtotal + vat;
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
        actions={<><button type="button" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save estimate'}</button><button type="button" onClick={finaliseOffer} disabled={offerFinalised}>{offerFinalised ? 'Finalised' : 'Finalise offer'}</button><DocumentActions doc="offer" /></>} />
      {message && <Notice>{message}</Notice>}
      {!message && savedEstimates.length > 0 && <Notice>Last saved estimate #{savedEstimates[0].id}: {formatEur(savedEstimates[0].offerTotal)}.</Notice>}
      {outputs.offer.omittedMaterials > 0.5 && (
        <Notice tone="warning">
          {formatEur(outputs.offer.omittedMaterials)} of materials are not in this offer. The workbook offer only adds 17 material groups (spec issue 1).
        </Notice>
      )}
      <div className="panel offer-editor">
        <h2>Edit client offer</h2>
        <table className="doc-table"><thead><tr><th>Description</th><th>Specification</th><th>Unit</th><th>Quantity</th><th>Total EUR</th></tr></thead><tbody>
          {lines.map((line) => <tr key={line.line}>
            <td><input value={line.description} onChange={(e) => setOfferEdit(line.line, {description: e.target.value})} /></td>
            <td><input value={line.specification} onChange={(e) => setOfferEdit(line.line, {specification: e.target.value})} /></td>
            <td><input value={line.unit} onChange={(e) => setOfferEdit(line.line, {unit: e.target.value})} /></td>
            <td><input type="number" min="0" step="0.001" value={line.quantity} onChange={(e) => setOfferEdit(line.line, {quantity: Number(e.target.value)})} /></td>
            <td><input type="number" min="0" step="0.01" value={line.amount} onChange={(e) => setOfferEdit(line.line, {amount: Number(e.target.value)})} /></td>
          </tr>)}
        </tbody></table>
        <p>Edited materials: {formatEur(lineTotal)} · Subtotal: {formatEur(subtotal)} · VAT: {formatEur(vat)} · Total: {formatEur(total)}</p>
      </div>
      <div className="panel"><p>{offerFinalised ? 'Offer finalised and ready to print.' : 'Offer is editable. Finalise it when the client version is complete.'}</p></div>
    </>
  );
}
