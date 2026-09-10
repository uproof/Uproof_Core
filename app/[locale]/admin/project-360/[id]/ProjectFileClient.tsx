'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import type {CrmProjectRecord} from '@/lib/crmProjectsStore';
import type {CrmEstimatorFormData} from '@/lib/crmEstimator';

type Props = {
  locale: string;
  project: CrmProjectRecord;
  documents: Array<{name: string; url: string}>;
};

type ProjectDocument = {id: string; category: string; file_name: string; mime_type: string; file_size: number; uploaded_at: string; url?: string};

type ModuleProps = {title: string; subtitle: string; children: React.ReactNode; defaultOpen?: boolean};

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

function value(value: unknown) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function estimatorEntries(data: CrmEstimatorFormData) {
  return [
    ['Roof problem', data.roofProblem],
    ['Existing covering', data.existingRoofCovering],
    ['Roof area', data.existingRoofArea],
    ['Building type', data.buildingType],
    ['Desired covering', data.desiredRoofCovering],
    ['Material', data.materialType],
    ['Material colour', data.desiredMaterialColor],
    ['Roof pitch', data.roofPitch],
    ['Gutter system', data.gutterSystem],
    ['Insulation', data.insulation],
    ['Structure condition', data.roofStructureCondition],
    ['Planned execution', data.plannedExecutionTime],
  ].filter(([, entry]) => entry !== '' && entry !== null && entry !== undefined);
}

function projectProgressPercent(status: string, workLogCount: number) {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('frozen') || normalized.includes('completed')) return 100;
  if (workLogCount > 0) return Math.min(95, 35 + workLogCount * 10);
  if (normalized.includes('estimate_done') || normalized.includes('project_started')) return 67;
  if (normalized.includes('estimating') || normalized.includes('quote_sent')) return 35;
  return 15;
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
  const materials = [
    ['Material type', estimator.materialType],
    ['Desired covering', estimator.desiredRoofCovering],
    ['Colour', estimator.desiredMaterialColor],
    ['Roof area', estimator.existingRoofArea],
    ['Gutter system', estimator.gutterSystem],
    ['Insulation', estimator.insulation],
  ].filter(([, entry]) => entry);

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

          <Module title="Estimator data" subtitle="">
            <a href={`/${locale}/estimator/${encodeURIComponent(project.leadId)}`} className="mb-4 inline-flex items-center rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600">Open Estimator Engine</a><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{estimatorEntries(estimator).map(([label, entry]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-900">{value(entry)}</p></div>)}</div><p className="mt-4 text-xs text-slate-500">The estimator engine is the source of truth for estimate inputs and generated estimate PDFs. This project view does not create or overwrite estimator revisions.</p>
          </Module>

          <Module title="Materials and supply chain" subtitle="">
            {materials.length > 0 ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{materials.map(([label, entry]) => <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-slate-900">{value(entry)}</p></div>)}</div> : <p className="text-sm text-slate-500">No estimator material selections have been recorded.</p>}
          </Module>

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
