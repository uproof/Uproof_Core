import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Notice, PageHeader, Tabs, type TabItem } from '@/workbook-ui/components/common';
import { useEstimate } from '@/workbook-ui/state/EstimateContext';
import { MaterialsTab } from './tabs/MaterialsTab';
import { LaborNormsTab } from './tabs/LaborNormsTab';
import { SheetMetalTab } from './tabs/SheetMetalTab';
import { SlopeTab } from './tabs/SlopeTab';
import { ConstantsTab } from './tabs/ConstantsTab';

type TabId = 'materials' | 'norms' | 'sheetMetal' | 'slope' | 'constants';

/** Step 1: review the shared settings version; optional per-estimate overrides. */
export function SettingsPage() {
  const { settings, overrideCount, resetOverrides } = useEstimate();
  const [tab, setTab] = useState<TabId>('materials');
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
          <Link to="../inputs" className="button primary">Continue to inputs</Link>
        </>}
      />
      <Notice>
        Settings version {settings.version.id}, {settings.version.note.toLowerCase()} on {settings.version.importedAt}.{' '}
        {overrideCount ? `${overrideCount} value${overrideCount > 1 ? 's' : ''} changed for this estimate.` : 'No changes for this estimate.'}
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
