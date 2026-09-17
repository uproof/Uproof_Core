'use client';

import {useState} from 'react';
import {CRM_ESTIMATOR_FIELD_DEFINITIONS, CRM_ESTIMATOR_FIELD_SECTIONS, formatEstimatorValue, type CrmEstimatorFormData} from '@/lib/crmEstimator';

type Props = {
  data?: CrmEstimatorFormData;
};

function hasValue(value: unknown) {
  if (value === null || value === undefined || value === '' || value === false || value === 0) return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function CrmLeadSummaryNavigator({data}: Props) {
  const [open, setOpen] = useState(false);
  const values = data || null;
  const fields = values ? CRM_ESTIMATOR_FIELD_DEFINITIONS.filter((definition) => hasValue(values[definition.key])) : [];
  const chimneyEntries = values?.chimneyEntries?.filter((entry) => entry.workType || entry.quantity || entry.notes) || [];

  return <>
    <button type="button" onClick={() => setOpen(true)} className="crm-summary-trigger no-print" aria-label="Open CRM lead summary">CRM lead</button>
    {open ? <aside className="crm-summary-drawer no-print" aria-label="CRM lead summary">
      <div className="crm-summary-header"><div><strong>CRM lead summary</strong><span>Saved lead values used by this estimate</span></div><button type="button" onClick={() => setOpen(false)} aria-label="Close CRM lead summary">×</button></div>
      <div className="crm-summary-content">{CRM_ESTIMATOR_FIELD_SECTIONS.map((section) => { const sectionFields = fields.filter((definition) => definition.section === section); if (sectionFields.length === 0) return null; return <section key={section}><h2>{section}</h2>{sectionFields.map((definition) => <div key={definition.key} className="crm-summary-row"><span>{definition.label}</span><strong>{formatEstimatorValue(values?.[definition.key])}</strong></div>)}</section>; })}{chimneyEntries.length > 0 ? <section><h2>Skursteņu darbi</h2>{chimneyEntries.map((entry, index) => <div key={`${entry.workType}-${index}`} className="crm-summary-row"><span>{entry.workType || 'Darbs'}</span><strong>{[entry.quantity, entry.notes].filter(Boolean).join(' · ')}</strong></div>)}</section> : null}{fields.length === 0 && chimneyEntries.length === 0 ? <p className="crm-summary-empty">No saved CRM estimator values.</p> : null}</div>
    </aside> : null}
  </>;
}
