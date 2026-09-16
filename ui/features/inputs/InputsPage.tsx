'use client';

import Link from 'next/link';
import { leadPath } from '@/ui/navigation';
import { PageHeader, Panel } from '@/ui/components/common';
import { useEstimate } from '@/ui/state/EstimateContext';
import { INPUT_SECTIONS, type SectionLayout } from './sectionsConfig';
import { OfferTermsPanel } from './sections/OfferTermsPanel';
import { FieldGrid } from './sections/FieldGrid';
import { ChimneyTables } from './sections/ChimneyTables';
import { PaintingTable } from './sections/PaintingTable';
import { WindowsTable } from './sections/WindowsTable';
import { SnowMeltTable } from './sections/SnowMeltTable';

/** Step 2: lead measurements (Ievade). Every change triggers a debounced recalculation. */
export function InputsPage() {
  const { schema, reloadLead, status, leadId } = useEstimate();
  const renderSection = (id: string, layout: SectionLayout) => {
    switch (layout) {
      case 'chimneys': return <ChimneyTables />;
      case 'painting': return <PaintingTable />;
      case 'windows': return <WindowsTable />;
      case 'snowMelt': return <SnowMeltTable />;
      default: return <FieldGrid defs={schema.filter((d) => d.s === id)} />;
    }
  };
  return (
    <>
      <PageHeader
        title="Inputs" titleLv="Ievade"
        description="Measurements and options for this roof. Changes are saved to the lead and recalculated on the server."
        actions={<>
          <span>{status === 'calculating' ? 'Saving and recalculating…' : 'Saved'}</span>
          <button type="button" onClick={() => reloadLead()}>Reload saved lead</button>
          <Link href={leadPath(leadId, 'lines')} className="button primary">Review line items</Link>
        </>}
      />
      <nav className="jump-links" aria-label="Input sections">
        <a href="#section-terms">Offer terms</a>
        {INPUT_SECTIONS.map((s) => <a key={s.id} href={`#section-${s.id}`}>{s.title}</a>)}
      </nav>
      <div className="stack">
        <OfferTermsPanel />
        {INPUT_SECTIONS.map((s) => (
          <Panel key={s.id} id={`section-${s.id}`} title={s.title} titleLv={s.titleLv}>
            {renderSection(s.id, s.layout)}
          </Panel>
        ))}
      </div>
    </>
  );
}
