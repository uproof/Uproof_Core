'use client';

import { useEffect, useState } from 'react';
import { api, type SettingsVersionListItem } from '@/ui/api';
import Link from 'next/link';
import { leadPath } from '@/ui/navigation';
import { Notice, PageHeader, Tabs, type TabItem } from '@/ui/components/common';
import { useEstimate } from '@/ui/state/EstimateContext';
import { MaterialsTab } from './tabs/MaterialsTab';
import { LaborNormsTab } from './tabs/LaborNormsTab';
import { SheetMetalTab } from './tabs/SheetMetalTab';
import { SlopeTab } from './tabs/SlopeTab';
import { ConstantsTab } from './tabs/ConstantsTab';

type TabId = 'materials' | 'norms' | 'sheetMetal' | 'slope' | 'constants';

/** Step 1: review the shared settings version; optional per-estimate overrides. */
export function SettingsPage() {
  const { settings, overrideCount, resetOverrides, publishOverrides, leadId } = useEstimate();
  const [tab, setTab] = useState<TabId>('materials');
  const [versions, setVersions] = useState<SettingsVersionListItem[]>([]);
  const [publishing, setPublishing] = useState(false);
  useEffect(() => { api.listSettingsVersions().then(setVersions).catch(() => setVersions([])); }, [settings?.version.id]);
  const publish = async () => {
    const note = window.prompt('Describe this settings change (for example "Rukki price update September")');
    if (!note) return;
    setPublishing(true);
    try { await publishOverrides(note); } finally { setPublishing(false); }
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
        description="Shared prices, labor norms and constants. Changes here apply to this estimate only."
        actions={<>
          {overrideCount > 0 && <button type="button" onClick={resetOverrides}>Reset {overrideCount} change{overrideCount > 1 ? 's' : ''}</button>}
          {overrideCount > 0 && <button type="button" onClick={publish} disabled={publishing}>{publishing ? 'Saving…' : 'Save as new shared version'}</button>}
          <Link href={leadPath(leadId, 'inputs')} className="button primary">Continue to inputs</Link>
        </>}
      />
      <Notice>
        <strong>Active workbook settings</strong>
        <span className="settings-status-detail">Version {settings.version.id} · {settings.version.note} · created {settings.version.importedAt}</span>
        <span className="settings-status-detail">{versions.length === 0 ? 'Using the built-in workbook baseline.' : `${versions.length} saved version${versions.length === 1 ? '' : 's'} available.`} {overrideCount ? `${overrideCount} estimate-only change${overrideCount > 1 ? 's' : ''}.` : 'No estimate-only changes.'}</span>
      </Notice>
      <Tabs label="Settings sections" items={tabs} active={tab} onChange={setTab} />
      {tab === 'materials' && <MaterialsTab />}
      {tab === 'norms' && <LaborNormsTab />}
      {tab === 'sheetMetal' && <SheetMetalTab />}
      {tab === 'slope' && <SlopeTab />}
      {tab === 'constants' && <ConstantsTab />}
    </>
  );
}
