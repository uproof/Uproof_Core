'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import type {CrmProjectRecord} from '@/lib/crmProjectsStore';
import {CRM_ESTIMATOR_BOOLEAN_OPTIONS, CRM_ESTIMATOR_FIELD_DEFINITIONS, CRM_ESTIMATOR_FIELD_SECTIONS, createEmptyCrmEstimatorData, formatEstimatorValue, type CrmEstimatorEngineOutputs, type CrmEstimatorFormData, type CrmEstimatorOutputRow} from '@/lib/crmEstimator';

type Props = {
  locale: string;
  project: CrmProjectRecord;
  documents: Array<{name: string; url: string}>;
};

type ProjectDocument = {id: string; category: string; file_name: string; mime_type: string; file_size: number; uploaded_at: string; url?: string};

type ModuleProps = {title: string; subtitle: string; children: React.ReactNode; defaultOpen?: boolean};

function displayValue(entry: unknown) {
  if (entry === null || entry === undefined || entry === '') return '—';
  return String(entry);
}

function Module({title, subtitle, children, defaultOpen = false}: ModuleProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50">
        <span className="block text-sm font-bold text-slate-900">{title}</span>
        <span className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {open ? <div className="border-t border-slate-200 px-5 py-5">{children}</div> : null}
    </section>
  );
}

function projectProgressPercent(status: string, workLogCount: number) {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('frozen') || normalized.includes('completed')) return 100;
  if (workLogCount > 0) return Math.min(95, 35 + workLogCount * 10);
  if (normalized.includes('estimate_done') || normalized.includes('project_started')) return 67;
  if (normalized.includes('estimating') || normalized.includes('quote_sent')) return 35;
  return 15;
}

type ProcessedEstimatorRow = CrmEstimatorOutputRow;

const requiredEstimatorKeys: Array<keyof CrmEstimatorFormData> = ['existingRoofArea', 'buildingType', 'desiredRoofCovering', 'materialType', 'roofPitch'];

function createProcessedRows(data: CrmEstimatorFormData): ProcessedEstimatorRow[] {
  const area = data.existingRoofArea.trim();
  const rows = [
    [data.desiredRoofCovering, area, 'm²'],
    [data.materialType, area, 'm²'],
    [data.gutterSystem, data.gutterSystem ? '1' : '', 'kompl.'],
    [data.insulation, data.insulation ? area : '', 'm²'],
  ].filter((row) => row[0] && row[1]);
  return rows.map(([description, quantity, unit]) => ({description, quantity, unit, price: '', total: ''}));
}

function outputRows(value: unknown, key: string) {
  if (!value || typeof value !== 'object') return [] as Array<Record<string, unknown>>;
  const rows = (value as Record<string, unknown>)[key];
  return Array.isArray(rows) ? rows.filter((row): row is Record<string, unknown> => !!row && typeof row === 'object') : [];
}

function OutputTable({title, rows, nameKey, onChange}: {title: string; rows: Array<Record<string, unknown>>; nameKey: string; onChange: (index: number, key: string, value: string) => void}) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="text-sm font-bold text-slate-900">{title}</h3><div className="mt-3 overflow-x-auto"><table className="min-w-full text-sm"><thead><tr>{['Description', 'Quantity', 'Unit', 'Total'].map((heading) => <th key={heading} className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{heading}</th>)}</tr></thead><tbody>{rows.length > 0 ? rows.map((row, index) => <tr key={`${title}-${index}`} className="border-t border-slate-100"><td className="px-2 py-2"><input value={String(row[nameKey] ?? row.name ?? row.description ?? '')} onChange={(event) => onChange(index, nameKey, event.target.value)} className="h-9 min-w-64 rounded border border-slate-200 px-2" /></td><td className="px-2 py-2"><input value={String(row.quantity ?? '')} onChange={(event) => onChange(index, 'quantity', event.target.value)} className="h-9 w-28 rounded border border-slate-200 px-2" /></td><td className="px-2 py-2"><input value={String(row.unit ?? '')} onChange={(event) => onChange(index, 'unit', event.target.value)} className="h-9 w-24 rounded border border-slate-200 px-2" /></td><td className="px-2 py-2"><input value={String(row.total ?? row.totalExVat ?? '')} onChange={(event) => onChange(index, row.total !== undefined ? 'total' : 'totalExVat', event.target.value)} className="h-9 w-32 rounded border border-slate-200 px-2" /></td></tr>) : <tr><td colSpan={4} className="px-2 py-4 text-slate-500">Process the estimator to generate output rows.</td></tr>}</tbody></table></div></div>;
}

function EngineOutputSections({outputs, onChange}: {outputs: CrmEstimatorEngineOutputs; onChange: (output: keyof CrmEstimatorEngineOutputs, index: number, key: string, value: string) => void}) {
  const materials = outputs.materialsToUse && Array.isArray(outputs.materialsToUse.consolidatedMaterials) ? outputs.materialsToUse.consolidatedMaterials as Array<Record<string, unknown>> : [];
  const tasks = outputs.workPlan && Array.isArray(outputs.workPlan.tasks) ? outputs.workPlan.tasks as Array<Record<string, unknown>> : [];
  return <div className="mt-5 space-y-3"><Module title="Piedāvājums" subtitle="Workbook customer offer output"><OutputTable title="Piedāvājums" rows={outputRows(outputs.customerOffer, 'activeLineItems')} nameKey="description" onChange={(index, key, value) => onChange('customerOffer', index, key, value)} /></Module><Module title="F2 forma" subtitle="Workbook formal estimate output"><OutputTable title="F2 forma" rows={outputRows(outputs.f2Estimate, 'activeRows')} nameKey="name" onChange={(index, key, value) => onChange('f2Estimate', index, key, value)} /></Module><Module title="Materials and supply chain" subtitle="Generated from the workbook estimate"><OutputTable title="Materials" rows={materials} nameKey="item" onChange={(index, key, value) => onChange('materialsToUse', index, key, value)} /></Module><Module title="Work Plan" subtitle="Generated workbook schedule"><OutputTable title="Work Plan" rows={tasks} nameKey="position" onChange={(index, key, value) => onChange('workPlan', index, key, value)} /></Module></div>;
}

function EstimatorWorkflow({project, initialData}: {project: CrmProjectRecord; initialData: CrmEstimatorFormData}) {
  const [data, setData] = useState<CrmEstimatorFormData>(initialData || createEmptyCrmEstimatorData());
  const [version, setVersion] = useState(project.updatedAtUtc);
  const [rows, setRows] = useState<ProcessedEstimatorRow[]>(initialData.processedRows || []);
  const [finalised, setFinalised] = useState(initialData.processingStatus === 'finalised');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [engineOutputs, setEngineOutputs] = useState<CrmEstimatorEngineOutputs>(initialData.engineOutputs || {});

  const update = <K extends keyof CrmEstimatorFormData>(key: K, value: CrmEstimatorFormData[K]) => setData((current) => ({...current, [key]: value}));
  const missing = requiredEstimatorKeys.filter((key) => data[key] === '' || data[key] === null || data[key] === undefined);

  const updateEngineOutput = (output: keyof CrmEstimatorEngineOutputs, index: number, key: string, value: string) => {
    setEngineOutputs((current) => {
      const section = current[output];
      if (!section || typeof section !== 'object') return current;
      const rowsKey = output === 'customerOffer' ? 'activeLineItems' : output === 'f2Estimate' ? 'activeRows' : output === 'materialsToUse' ? 'consolidatedMaterials' : 'tasks';
      const rows = Array.isArray(section[rowsKey]) ? section[rowsKey] as Array<Record<string, unknown>> : [];
      return {...current, [output]: {...section, [rowsKey]: rows.map((row, rowIndex) => rowIndex === index ? {...row, [key]: value} : row)}};
    });
  };



  const save = async (nextRows = rows, nextStatus: 'draft' | 'processed' | 'finalised' = finalised ? 'finalised' : rows.length > 0 ? 'processed' : 'draft', nextOutputs = engineOutputs) => {
    setError('');
    const response = await fetch(`/api/crm/leads/${encodeURIComponent(project.leadId)}`, {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({updatedAtUtc: version, estimatorData: {...data, engineOutputs: nextOutputs, processedRows: nextRows, processingStatus: nextStatus}})});
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || 'Estimator could not be saved');
    setVersion(result.lead.updatedAtUtc);
  };

  const process = async () => {
    if (missing.length > 0) {
      setError(`Complete the required estimator fields: ${missing.map((key) => CRM_ESTIMATOR_FIELD_DEFINITIONS.find((definition) => definition.key === key)?.label || key).join(', ')}`);
      return;
    }
    try {
      setMessage('Generating estimate...');
      const nextRows = createProcessedRows(data);
      await save(nextRows, 'processed', engineOutputs);
      setRows(nextRows);
      setFinalised(false);
      setMessage('Estimate generated. Review and edit the output rows before finalising.');
    } catch (processError: any) {
      setError(processError?.message || 'Estimator could not be processed');
    }
  };

  const finalise = async () => {
    try {
      await save(rows, 'finalised', engineOutputs);
      setFinalised(true);
      setMessage('Estimator finalised. The documents are ready to download or send.');
    } catch (finaliseError: any) {
      setError(finaliseError?.message || 'Estimator could not be finalised');
    }
  };

  return <>
  <Module title="Estimator data" subtitle="Lead inputs, processing and final outputs">
    <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-slate-700">Enter or update the CRM lead data points below, then click "Process estimate" to generate the output documents.</div>
    <div className="rounded-xl border border-slate-200 bg-white p-4"><h3 className="text-sm font-bold text-slate-900">Lead data points</h3><p className="mt-1 text-xs text-slate-500">Values collected in Sales CRM.</p>{CRM_ESTIMATOR_FIELD_SECTIONS.map((section) => <div key={section} className="border-b border-slate-200 py-4 last:border-b-0"><h4 className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">{section}</h4><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{CRM_ESTIMATOR_FIELD_DEFINITIONS.filter((definition) => definition.section === section).map((definition) => { const fieldValue = data[definition.key]; const inputId = `project-estimator-${String(definition.key)}`; const isRequired = requiredEstimatorKeys.includes(definition.key); return <label key={definition.key} htmlFor={inputId} className="flex flex-col gap-1 text-sm font-medium text-slate-700"><span>{definition.label}{isRequired ? <span className="text-rose-600"> *</span> : null}</span>{definition.type === 'select' ? <select id={inputId} value={formatEstimatorValue(fieldValue)} onChange={(event) => update(definition.key, event.target.value as never)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-900"><option value="">Select</option>{definition.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : definition.type === 'boolean' ? <select id={inputId} value={fieldValue === null ? '' : fieldValue ? 'true' : 'false'} onChange={(event) => update(definition.key, event.target.value === 'true' ? true : event.target.value === 'false' ? false : null as never)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-900"><option value="">Select</option>{CRM_ESTIMATOR_BOOLEAN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : definition.type === 'number' ? <input id={inputId} type="number" value={fieldValue === null ? '' : String(fieldValue)} onChange={(event) => update(definition.key, event.target.value ? Number(event.target.value) as never : null as never)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-900" /> : definition.type === 'textarea' ? <textarea id={inputId} value={formatEstimatorValue(fieldValue)} onChange={(event) => update(definition.key, event.target.value as never)} rows={2} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900" /> : <input id={inputId} value={formatEstimatorValue(fieldValue)} onChange={(event) => update(definition.key, event.target.value as never)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-900" />}</label>; })}</div></div>)}</div>

    <div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" onClick={() => void process()} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">Process estimate</button>{missing.length > 0 ? <span className="text-sm text-amber-700">{missing.length} required field{missing.length === 1 ? '' : 's'} remaining</span> : null}</div>
    {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}{message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
    {rows.length > 0 ? <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-bold text-slate-900">Processed output</h3><p className="mt-1 text-xs text-slate-500">Edit the rows before finalising the client documents.</p></div><button type="button" onClick={() => void finalise()} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">{finalised ? 'Finalised' : 'Finalise estimate'}</button></div><div className="mt-4 overflow-x-auto"><table className="min-w-full"><thead><tr>{['Description', 'Quantity', 'Unit', 'Unit price', 'Total'].map((heading) => <th key={heading} className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{heading}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${row.description}-${index}`}><td className="px-2 py-2"><input value={row.description} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? {...entry, description: event.target.value} : entry))} className="h-9 min-w-52 rounded border border-slate-200 px-2 text-sm" /></td><td className="px-2 py-2"><input value={row.quantity} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? {...entry, quantity: event.target.value} : entry))} className="h-9 w-24 rounded border border-slate-200 px-2 text-sm" /></td><td className="px-2 py-2"><input value={row.unit} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? {...entry, unit: event.target.value} : entry))} className="h-9 w-24 rounded border border-slate-200 px-2 text-sm" /></td><td className="px-2 py-2"><input value={row.price} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? {...entry, price: event.target.value, total: event.target.value && row.quantity ? String(Number(event.target.value) * Number(row.quantity)) : ''} : entry))} className="h-9 w-28 rounded border border-slate-200 px-2 text-sm" /></td><td className="px-2 py-2"><input value={row.total} onChange={(event) => setRows((current) => current.map((entry, rowIndex) => rowIndex === index ? {...entry, total: event.target.value} : entry))} className="h-9 w-28 rounded border border-slate-200 px-2 text-sm" /></td></tr>)}</tbody></table></div>{finalised ? <div className="mt-4 flex flex-wrap gap-2"><a href={`/api/estimator/${encodeURIComponent(project.leadId)}/pdf?kind=f2`} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Download F2 forma</a><a href={`/api/estimator/${encodeURIComponent(project.leadId)}/pdf?kind=offer`} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Download Piedāvājums</a><a href={`mailto:?subject=${encodeURIComponent(`Piedāvājums - ${project.title}`)}`} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Send to client email</a></div> : null}</div> : null}
  </Module>
  <EngineOutputSections outputs={engineOutputs} onChange={updateEngineOutput} />
  </>;
}

function FinancialModule({project}: {project: CrmProjectRecord}) {
  const [open, setOpen] = useState<'payments' | 'invoices' | 'cash' | 'profit' | null>(null);
  const toggle = (key: 'payments' | 'invoices' | 'cash' | 'profit') => setOpen((current) => current === key ? null : key);
  return <Module title="Financials" subtitle="">
    <div className="grid gap-3 md:grid-cols-4">{[['payments', 'Payment Stages'], ['invoices', 'Invoices'], ['cash', 'Cash Flow'], ['profit', 'Profitability']].map(([key, label]) => <button key={key} type="button" onClick={() => toggle(key as 'payments' | 'invoices' | 'cash' | 'profit')} className={`rounded-xl border p-4 text-left ${open === key ? 'border-sky-300 bg-sky-50' : 'border-slate-200 bg-slate-50'}`}><span className="text-xs text-slate-500">{label}</span><strong className="mt-2 block text-sm text-slate-900">{key === 'profit' ? project.budget || '—' : key === 'invoices' ? 'Not recorded' : key === 'cash' ? 'Not recorded' : 'Not recorded'}</strong></button>)}</div>
    {open === 'payments' ? <div className="mt-4 overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead><tr>{['Stage', 'Contract amount', 'Paid', 'Balance', 'Due date'].map((heading) => <th key={heading} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{heading}</th>)}</tr></thead><tbody><tr>{['Stage 1', 'Not recorded', 'Not recorded', 'Not recorded', 'Not recorded'].map((entry) => <td key={entry} className="px-3 py-3 text-sm text-slate-700">{entry}</td>)}</tr></tbody></table></div> : null}
    {open === 'invoices' ? <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">No project invoices are recorded. Upload or connect invoices through the project document workflow.</div> : null}
    {open === 'cash' ? <div className="mt-4 overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead><tr>{['Stage', 'Costs', 'Contract amount', 'Balance'].map((heading) => <th key={heading} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{heading}</th>)}</tr></thead><tbody><tr>{['Total', 'Not recorded', project.budget || '—', 'Not recorded'].map((entry) => <td key={entry} className="px-3 py-3 text-sm text-slate-700">{entry}</td>)}</tr></tbody></table></div> : null}
    {open === 'profit' ? <div className="mt-4 overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead><tr>{['Category', 'Actual', 'Estimate', 'Result / Profitability'].map((heading) => <th key={heading} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{heading}</th>)}</tr></thead><tbody>{['Materials', 'Wages', 'Man-hours', 'Overhead', 'Total'].map((category) => <tr key={category}><td className="px-3 py-3 text-sm font-semibold text-slate-900">{category}</td><td className="px-3 py-3 text-sm text-slate-500">Not recorded</td><td className="px-3 py-3 text-sm text-slate-500">Not recorded</td><td className="px-3 py-3 text-sm text-slate-500">Not recorded</td></tr>)}</tbody></table></div> : null}
  </Module>;
}

function CustomKpiModule() {
  const [kpis, setKpis] = useState<Array<{name: string; target: string; format: string}>>([]);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [format, setFormat] = useState('Number');
  return <Module title="Custom KPIs" subtitle="">
    <div className="grid gap-3 md:grid-cols-[1fr_1fr_160px_auto]"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="KPI name" className="h-10 rounded-xl border border-slate-200 px-3 text-sm" /><input value={target} onChange={(event) => setTarget(event.target.value)} placeholder="Target or formula" className="h-10 rounded-xl border border-slate-200 px-3 text-sm" /><select value={format} onChange={(event) => setFormat(event.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm"><option>Number</option><option>Percent</option><option>Currency</option><option>Duration</option></select><button type="button" onClick={() => { if (name.trim()) { setKpis((current) => [...current, {name: name.trim(), target: target.trim(), format}]); setName(''); setTarget(''); } }} className="h-10 rounded-xl bg-sky-500 px-4 text-sm font-semibold text-white">Add KPI</button></div>
    {kpis.length > 0 ? <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{kpis.map((kpi) => <div key={`${kpi.name}-${kpi.target}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="font-semibold text-slate-900">{kpi.name}</p><p className="mt-1 text-sm text-slate-500">Target: {kpi.target || '—'} · {kpi.format}</p></div>)}</div> : <p className="mt-4 text-sm text-slate-500">No custom KPIs configured.</p>}
  </Module>;
}

function ProjectDocumentsModule({project, initialDocuments}: {project: CrmProjectRecord; initialDocuments: Array<{name: string; url: string}>}) {
  const [documents, setDocuments] = useState<ProjectDocument[]>(initialDocuments.map((document, index) => ({id: `legacy-${index}`, category: 'other', file_name: document.name, mime_type: 'application/octet-stream', file_size: 0, uploaded_at: '', url: document.url})));
  const [category, setCategory] = useState('contract');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/crm/projects/${encodeURIComponent(project.leadId)}/documents`, {cache: 'no-store'})
      .then((response) => response.json())
      .then((data) => { if (data.ok) setDocuments(data.documents.map((document: ProjectDocument) => ({...document, url: `/api/crm/projects/${encodeURIComponent(project.leadId)}/documents/${encodeURIComponent(document.id)}`}))); })
      .catch(() => undefined);
  }, [project.leadId]);

  const upload = async (files: File[]) => {
    setUploading(true);
    setError('');
    try {
      const uploaded: ProjectDocument[] = [];
      for (const file of files) {
        const form = new FormData();
        form.set('category', category);
        form.set('file', file);
        const response = await fetch(`/api/crm/projects/${encodeURIComponent(project.leadId)}/documents`, {method: 'POST', body: form});
        const data = await response.json();
        if (!data.ok) throw new Error(data.error || `Upload failed for ${file.name}`);
        uploaded.push({...data.document, url: `/api/crm/projects/${encodeURIComponent(project.leadId)}/documents/${encodeURIComponent(data.document.id)}`});
      }
      setDocuments((current) => [...uploaded, ...current]);
    } catch (uploadError: any) {
      setError(uploadError?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const groups = [
    ['contract', 'Contract'],
    ['invoice', 'Invoices'],
    ['estimate', 'Estimate'],
    ['certificate', 'Certificate of Acceptance'],
    ['other', 'Other documents'],
  ];

  return <Module title="Project documents" subtitle="">
    <div className="flex flex-wrap items-center gap-2"><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">{groups.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><label className="inline-flex h-10 cursor-pointer items-center rounded-xl bg-sky-500 px-4 text-sm font-semibold text-white">{uploading ? 'Uploading...' : 'Add document'}<input type="file" multiple className="hidden" disabled={uploading} onChange={(event) => { const files = Array.from(event.target.files || []); if (files.length > 0) void upload(files); event.currentTarget.value = ''; }} /></label>{error ? <span className="text-sm text-rose-600">{error}</span> : null}</div>
    <div className="mt-5 grid gap-4 md:grid-cols-2">{groups.map(([key, label]) => <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="text-sm font-bold text-slate-900">{label}</h3><div className="mt-3 space-y-2">{documents.filter((document) => document.category === key).map((document) => <div key={document.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"><span className="min-w-0 truncate text-sm font-medium text-slate-900">{document.file_name}</span>{document.url ? <a href={document.url} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-sky-700">Preview</a> : null}</div>)}{documents.every((document) => document.category !== key) ? <p className="text-sm text-slate-500">No documents</p> : null}</div></div>)}</div>
  </Module>;
}

export default function ProjectFileClient({locale, project, documents}: Props) {
  const percent = projectProgressPercent(project.status, project.workLog.length);
  const estimator = project.estimatorData;
  const [projectStatus, setProjectStatus] = useState(project.status || project.phase);
  const [projectTitle, setProjectTitle] = useState(project.title);
  const [startDate, setStartDate] = useState(project.createdAtUtc ? project.createdAtUtc.slice(0, 10) : '');
  const [endDate, setEndDate] = useState(project.dueDate || '');
  const [projectOverview, setProjectOverview] = useState(project.note || project.title);
  const [description, setDescription] = useState(project.note || '');

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
          <Link href={`/${locale}/admin/project-360`} className="font-semibold text-sky-700 hover:text-sky-900">Projects</Link>
          <span className="text-slate-400">/</span>
          <span className="font-semibold text-slate-700">Project File</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">{project.id}</p><h1 className="mt-2 text-2xl font-bold text-slate-900">{project.title}</h1><p className="mt-2 text-sm text-slate-600">{project.customer}{project.company ? ` · ${project.company}` : ''}</p></div><span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">{project.phase}</span></div>
            <div className="mt-5 grid gap-3 md:grid-cols-2"><label className="block text-sm"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Overview</span><input value={projectOverview} onChange={(event) => setProjectOverview(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900" /></label><label className="block text-sm"><span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Description</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900" /></label></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">{[['Client', project.customer], ['Location', project.location], ['Owner', project.owner], ['Value', project.budget]].map(([label, entry]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-900">{entry || '—'}</p></div>)}</div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Project work progress</p><p className="mt-3 text-3xl font-bold text-slate-900">{percent}%</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-500" style={{width: `${percent}%`}} /></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><span className="text-slate-500">Project phase</span><strong className="mt-1 block text-slate-900">{project.phase}</strong></div><div><span className="text-slate-500">Work entries</span><strong className="mt-1 block text-slate-900">{project.workLog.length}</strong></div></div></section>
        </div>

        <div className="mt-5 space-y-3">
          <Module title="Client and project overview" subtitle="">
            <div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><h2 className="text-sm font-bold text-slate-900">Client data</h2><div className="mt-3 space-y-3">{[['Full name / company', project.customer + (project.company ? ` / ${project.company}` : '')], ['Legal address', project.location], ['ID No.', '—'], ['Primary contact', project.owner]].map(([label, entry]) => <label key={label} className="block text-sm"><span className="text-xs text-slate-500">{label}</span><input value={entry || ''} readOnly className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900" /></label>)}</div></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><h2 className="text-sm font-bold text-slate-900">Project data</h2><div className="mt-3 space-y-3"><label className="block text-sm"><span className="text-xs text-slate-500">Project name</span><input value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900" /></label><label className="block text-sm"><span className="text-xs text-slate-500">Status</span><select value={projectStatus} onChange={(event) => setProjectStatus(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900"><option>In Progress</option><option>Scheduled</option><option>Completed</option></select></label><label className="block text-sm"><span className="text-xs text-slate-500">Start date</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900" /></label><label className="block text-sm"><span className="text-xs text-slate-500">End date</span><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900" /></label><label className="block text-sm"><span className="text-xs text-slate-500">Commercial source</span><input value="Sales CRM — Won" readOnly className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-100 px-2 text-sm text-slate-700" /></label></div></div></div>
          </Module>

          <FinancialModule project={project} />

          <EstimatorWorkflow project={project} initialData={estimator} />

          <Module title="Project management and progress" subtitle="">
            <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">Current progress</p><p className="mt-2 text-xl font-bold text-slate-900">{project.progress || project.status}</p><p className="mt-4 text-sm text-slate-600">{project.note || 'No project note recorded.'}</p></div><div>{project.workLog.length > 0 ? <div className="space-y-2">{project.workLog.map((entry) => <div key={`${entry.time}-${entry.title}`} className="rounded-xl border border-slate-200 bg-white p-3"><div className="flex justify-between gap-3"><strong className="text-sm text-slate-900">{entry.title}</strong><span className="text-xs text-slate-500">{entry.time}</span></div><p className="mt-1 text-sm text-slate-600">{entry.detail}</p></div>)}</div> : <p className="text-sm text-slate-500">No planner or work-log entries have been recorded.</p>}</div></div>
          </Module>

          <ProjectDocumentsModule project={project} initialDocuments={documents} />

          <CustomKpiModule />
        </div>
      </div>
    </div>
  );
}
