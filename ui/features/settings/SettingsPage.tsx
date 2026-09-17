'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { leadPath } from '@/ui/navigation';
import { PageHeader, Tabs, type TabItem } from '@/ui/components/common';
import { useEstimate } from '@/ui/state/EstimateContext';
import { MaterialsTab } from './tabs/MaterialsTab';
import { LaborNormsTab } from './tabs/LaborNormsTab';
import { SheetMetalTab } from './tabs/SheetMetalTab';
import { SlopeTab } from './tabs/SlopeTab';
import { ConstantsTab } from './tabs/ConstantsTab';

type TabId = 'materials' | 'norms' | 'sheetMetal' | 'slope' | 'constants';

/** Step 1: review the shared settings version; optional per-estimate overrides. */
export function SettingsPage() {
  const { settings, overrideCount, resetOverrides, publishOverrides, leadId, saveLeadData } = useEstimate();
  const router = useRouter();
  const [tab, setTab] = useState<TabId>('materials');
  const [publishing, setPublishing] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const publish = async () => {
    const note = window.prompt('Describe this settings change (for example "Rukki price update September")');
    if (!note) return;
    setPublishing(true);
    try { await publishOverrides(note); } finally { setPublishing(false); }
  };
  const next = async () => {
    setAdvancing(true);
    try {
      await saveLeadData();
      router.push(leadPath(leadId, 'inputs'));
    } finally {
      setAdvancing(false);
    }
  };
  if (!settings) return null;
  const v = settings.values;
  const tabs: TabItem<TabId>[] = [
    { id: 'materials', label: 'Materials', count: v.materials.length },
    { id: 'norms', label: 'Labor norms', count: v.norms.length },
    { id: 'sheetMetal', label: 'Sheet metal', count: v.sd.length },
    { id: 'slope', label: 'Slope' },
    { id: 'constants', label: 'Constants' },
  ];
  return (
    <>
      <PageHeader
        title="Settings" titleLv="Iestatījumi"
        actions={<>
          {overrideCount > 0 && <button type="button" onClick={resetOverrides}>Reset {overrideCount} change{overrideCount > 1 ? 's' : ''}</button>}
          {overrideCount > 0 && <button type="button" onClick={publish} disabled={publishing}>{publishing ? 'Saving…' : 'Save as new shared version'}</button>}
          <button type="button" className="button primary" onClick={() => void next()} disabled={advancing}>{advancing ? 'Saving…' : 'Next →'}</button>
        </>}
      />
      <Tabs label="Settings sections" items={tabs} active={tab} onChange={setTab} />
      {tab === 'materials' && <MaterialsTab />}
      {tab === 'norms' && <LaborNormsTab />}
      {tab === 'sheetMetal' && <SheetMetalTab />}
      {tab === 'slope' && <SlopeTab />}
      {tab === 'constants' && <ConstantsTab />}
    </>
  );
}
