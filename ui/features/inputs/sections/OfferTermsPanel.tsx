'use client';

import { Panel } from '@/ui/components/common';
import { useEstimate } from '@/ui/state/EstimateContext';

/** Per-lead commercial terms (not shared settings). */
export function OfferTermsPanel() {
  const { lead, setTerm } = useEstimate();
  if (!lead) return null;
  const t = lead.terms;
  return (
    <Panel id="section-terms" title="Offer terms" titleLv="Piedāvājuma nosacījumi" aside={<span>Per lead</span>}>
      <div className="field-grid wide">
        <label className="field"><span>Client<small>Klients</small></span><input type="text" value={t.client} onChange={(e) => setTerm('client', e.target.value)} /></label>
        <label className="field"><span>Address<small>Objekta adrese</small></span><input type="text" value={t.address} onChange={(e) => setTerm('address', e.target.value)} /></label>
        <label className="field"><span>Discount<small>Atlaide, €</small></span><input type="number" step="any" value={t.discount} onChange={(e) => setTerm('discount', Number(e.target.value) || 0)} /></label>
        <label className="field"><span>VAT on offer<small>PVN</small></span>
          <select value={t.vatRate} onChange={(e) => setTerm('vatRate', Number(e.target.value))}>
            <option value={0}>0% reverse charge</option>
            <option value={0.21}>21%</option>
          </select>
        </label>
        <label className="field"><span>Start date<small>Darbu sākums</small></span><input type="date" value={t.startDate} onChange={(e) => setTerm('startDate', e.target.value)} /></label>
      </div>
    </Panel>
  );
}
