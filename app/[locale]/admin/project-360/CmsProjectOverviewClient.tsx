'use client';

import {DragEvent, useMemo, useState} from 'react';
import Link from 'next/link';
import type {CrmProjectRecord} from '@/lib/crmProjectsStore';

type Props = {locale: string; projects: CrmProjectRecord[]};
type LaneKey = 'in-progress' | 'scheduled' | 'to-be-estimated' | 'quote-sent' | 'finalised' | 'completed';
type Period = 'all' | 'month' | 'year';
type SortMode = 'updated' | 'created' | 'value' | 'title';

type Lane = {key: LaneKey; label: string; status: CrmProjectRecord['status']};
const LANES: Lane[] = [
  {key: 'in-progress', label: 'In Progress', status: 'ESTIMATE_DONE'},
  {key: 'scheduled', label: 'Scheduled', status: 'WAITING_DATA'},
  {key: 'to-be-estimated', label: 'To Be Estimated', status: 'ESTIMATING'},
  {key: 'quote-sent', label: 'Quote Sent', status: 'ESTIMATE_SENT'},
  {key: 'finalised', label: 'Finalised Projects', status: 'ACCEPTED'},
  {key: 'completed', label: 'Completed Projects', status: 'FROZEN'},
];

function money(value: string) {
  const parsed = Number.parseFloat(String(value || '').replace(/[^\d,.-]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function timestamp(project: CrmProjectRecord) {
  return Date.parse(project.updatedAtUtc || project.createdAtUtc || '') || 0;
}

function laneFor(project: CrmProjectRecord): LaneKey {
  const status = String(project.status || '').toUpperCase();
  if (status === 'FROZEN') return 'completed';
  if (status === 'ACCEPTED') return 'finalised';
  if (status === 'ESTIMATE_SENT') return 'quote-sent';
  if (status === 'ESTIMATING') return 'to-be-estimated';
  if (status === 'ESTIMATE_DONE') return 'in-progress';
  return 'scheduled';
}

function dateText(value: string, locale: string) {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? new Intl.DateTimeFormat(locale === 'lv' ? 'lv-LV' : 'en-GB', {day: '2-digit', month: 'short'}).format(parsed) : '—';
}

export default function CmsProjectOverviewClient({locale, projects}: Props) {
  const [items, setItems] = useState(projects);
  const [period, setPeriod] = useState<Period>('all');
  const [month, setMonth] = useState(String(new Date().getMonth()));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [sort, setSort] = useState<SortMode>('updated');
  const [view, setView] = useState<'board' | 'list'>('board');
  const [expandedLane, setExpandedLane] = useState<LaneKey | null>(null);
  const [search, setSearch] = useState<Record<LaneKey, string>>({'in-progress': '', scheduled: '', 'to-be-estimated': '', 'quote-sent': '', finalised: '', completed: ''});
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState({
    brigadeCount: '', brigadeHours: '', brigadeValue: '',
    scheduledCount: '', scheduledHours: '', scheduledValue: '',
    inProgressCount: '', inProgressHours: '', inProgressValue: '',
    completedCount: '', completedHours: '', completedValue: '',
  });
  const [editingOverview, setEditingOverview] = useState(false);

  const years = Array.from(new Set(items.map((project) => new Date(timestamp(project)).getFullYear()).filter(Number.isFinite))).sort((left, right) => right - left);
  const filtered = useMemo(() => items.filter((project) => {
    const date = new Date(timestamp(project));
    if (period === 'year') return date.getFullYear() === Number(year);
    if (period === 'month') return date.getFullYear() === Number(year) && date.getMonth() === Number(month);
    return true;
  }).sort((left, right) => {
    if (sort === 'title') return left.title.localeCompare(right.title);
    if (sort === 'value') return money(right.budget) - money(left.budget);
    if (sort === 'created') return Date.parse(right.createdAtUtc || '') - Date.parse(left.createdAtUtc || '');
    return timestamp(right) - timestamp(left);
  }), [items, month, period, sort, year]);

  const laneItems = (lane: LaneKey) => {
    const query = search[lane].trim().toLowerCase();
    return filtered.filter((project) => laneFor(project) === lane && (!query || `${project.id} ${project.title} ${project.customer} ${project.location}`.toLowerCase().includes(query)));
  };

  const moveProject = async (projectId: string, lane: LaneKey) => {
    const project = items.find((entry) => entry.id === projectId);
    const target = LANES.find((entry) => entry.key === lane);
    if (!project || !target || laneFor(project) === lane) return;
    const previous = items;
    setItems((current) => current.map((entry) => entry.id === projectId ? {...entry, status: target.status} : entry));
    try {
      const response = await fetch(`/api/crm/leads/${encodeURIComponent(project.leadId)}`, {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({updatedAtUtc: project.updatedAtUtc, status: target.status})});
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || 'Failed to update project status');
    } catch (moveError: any) {
      setItems(previous);
      setError(moveError?.message || 'Failed to update project status');
    }
  };

  const handleDrop = (event: DragEvent<HTMLElement>, lane: LaneKey) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain') || draggedId;
    setDraggedId(null);
    if (id) void moveProject(id, lane);
  };

  const owners = Array.from(new Set(filtered.map((project) => project.owner).filter(Boolean)));

  const overviewSection = <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold text-slate-900">Overview</h2><button type="button" onClick={() => setEditingOverview((current) => !current)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">{editingOverview ? 'Done' : 'Correct values'}</button></div>
    <div className="mt-4 grid grid-cols-4 gap-3">
      {[
        {title: 'Brigade', prefix: 'brigade', count: owners.length, hours: '', value: ''},
        {title: 'Scheduled Projects', prefix: 'scheduled', count: laneItems('scheduled').length, hours: '', value: laneItems('scheduled').reduce((sum, project) => sum + money(project.budget), 0)},
        {title: 'In Progress', prefix: 'inProgress', count: laneItems('in-progress').length, hours: '', value: laneItems('in-progress').reduce((sum, project) => sum + money(project.budget), 0)},
        {title: 'Completed Projects', prefix: 'completed', count: laneItems('completed').length, hours: '', value: laneItems('completed').reduce((sum, project) => sum + money(project.budget), 0)},
      ].map((section) => (
        <div key={section.prefix} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <h3 className="text-sm font-bold text-slate-900">{section.title}</h3>
          <div className="mt-3 grid gap-2">{[['Count', `${section.prefix}Count`, String(section.count)], ['Hours', `${section.prefix}Hours`, section.hours], ['Value', `${section.prefix}Value`, section.value ? section.value.toLocaleString() : '']].map(([label, key, fallback]) => <label key={key} className="block min-w-0"><span className="block truncate text-xs text-slate-500">{label}</span><input readOnly={!editingOverview} value={overview[key as keyof typeof overview] || fallback} onChange={(event) => setOverview((current) => ({...current, [key]: event.target.value}))} className={`mt-1 h-9 w-full min-w-0 rounded-lg border px-2 text-sm font-semibold text-slate-900 ${editingOverview ? 'border-sky-300 bg-white' : 'border-transparent bg-slate-100'}`} /></label>)}</div>
        </div>
      ))}
    </div>
  </section>;

  return <div className="space-y-5">
    {overviewSection}
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <select value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm"><option value="all">All dates</option><option value="month">Monthly</option><option value="year">Yearly</option></select>
      {period !== 'all' ? <select value={year} onChange={(event) => setYear(event.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">{years.map((entry) => <option key={entry}>{entry}</option>)}</select> : null}
      {period === 'month' ? <select value={month} onChange={(event) => setMonth(event.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm">{Array.from({length: 12}, (_, index) => <option key={index} value={index}>{new Intl.DateTimeFormat(locale === 'lv' ? 'lv-LV' : 'en-GB', {month: 'long'}).format(new Date(2020, index, 1))}</option>)}</select> : null}
      <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} className="h-10 rounded-xl border border-slate-200 px-3 text-sm"><option value="updated">Recently updated</option><option value="created">Recently created</option><option value="value">Highest value</option><option value="title">Project name</option></select>
      <div className="ml-auto flex gap-2"><button type="button" onClick={() => setView('board')} className={`h-10 rounded-xl px-3 text-sm font-semibold ${view === 'board' ? 'bg-sky-100 text-sky-700' : 'border border-slate-200 text-slate-600'}`}>Board</button><button type="button" onClick={() => setView('list')} className={`h-10 rounded-xl px-3 text-sm font-semibold ${view === 'list' ? 'bg-sky-100 text-sky-700' : 'border border-slate-200 text-slate-600'}`}>List</button></div>
    </div>
    {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
    {view === 'board' ? <div className="grid gap-4 xl:grid-cols-5">{LANES.map((lane) => { const expanded = expandedLane === lane.key; return <section key={lane.key} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, lane.key)} className={`${expanded ? 'xl:col-span-5' : ''} min-h-80 rounded-2xl border border-slate-200 bg-slate-50 p-3`}><div className="mb-3 flex items-center gap-2"><h2 className="min-w-0 flex-1 text-sm font-bold uppercase tracking-[0.12em] text-slate-700">{lane.label}</h2><span className="rounded-full bg-white px-2 py-1 text-xs text-slate-500">{laneItems(lane.key).length}</span><input value={search[lane.key]} onChange={(event) => setSearch((current) => ({...current, [lane.key]: event.target.value}))} placeholder="Search" className="h-8 w-24 shrink-0 rounded-lg border border-slate-200 bg-white px-2 text-xs" /><button type="button" onClick={() => setExpandedLane(expanded ? null : lane.key)} className="h-8 shrink-0 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600">{expanded ? 'Collapse' : 'Expand'}</button></div><div className="flex min-w-0 gap-3 overflow-x-auto pb-2">{laneItems(lane.key).map((project) => <Link key={project.id} draggable onDragStart={(event) => { event.dataTransfer.setData('text/plain', project.id); setDraggedId(project.id); }} onDragEnd={() => setDraggedId(null)} href={`/${locale}/admin/project-360/${encodeURIComponent(project.id)}`} className={`block min-h-40 w-72 shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-sky-300 ${draggedId === project.id ? 'opacity-50' : ''}`}><p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-600">{project.id}</p><p className="mt-2 font-bold text-slate-900">{project.title}</p><p className="mt-1 text-sm text-slate-600">{project.customer}</p><div className="mt-3 flex justify-between text-xs text-slate-500"><span>{project.budget || '—'}</span><span>{dateText(project.updatedAtUtc, locale)}</span></div></Link>)}</div></section>; })}</div> : <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="min-w-full divide-y divide-slate-200"><thead><tr>{['Project', 'Client', 'Category', 'Value', 'Updated'].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((project) => <tr key={project.id}><td className="px-4 py-3"><Link href={`/${locale}/admin/project-360/${encodeURIComponent(project.id)}`} className="font-semibold text-sky-700">{project.title}</Link></td><td className="px-4 py-3 text-sm">{project.customer}</td><td className="px-4 py-3 text-sm">{LANES.find((lane) => lane.key === laneFor(project))?.label}</td><td className="px-4 py-3 text-sm">{project.budget || '—'}</td><td className="px-4 py-3 text-sm text-slate-500">{dateText(project.updatedAtUtc, locale)}</td></tr>)}</tbody></table></div>}
  </div>;
}
