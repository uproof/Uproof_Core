'use client';

import {useMemo, useState} from 'react';
import Link from 'next/link';
import type {CrmProjectRecord} from '@/lib/crmProjectsStore';

type Props = {locale: string; projects: CrmProjectRecord[]};
type ViewMode = 'board' | 'list';
type Period = 'all' | 'month' | 'year';
type SortMode = 'updated' | 'created' | 'value' | 'title';

function dateValue(project: CrmProjectRecord) {
  return Date.parse(project.updatedAtUtc || project.createdAtUtc || '') || 0;
}

function moneyValue(value: string) {
  const parsed = Number.parseFloat(String(value || '').replace(/[^\d,.-]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: string, locale: string) {
  const amount = moneyValue(value);
  return amount ? new Intl.NumberFormat(locale === 'lv' ? 'lv-LV' : 'en-GB', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}).format(amount) : value || '—';
}

function formatDate(value: string, locale: string) {
  const timestamp = Date.parse(value || '');
  return Number.isFinite(timestamp) ? new Intl.DateTimeFormat(locale === 'lv' ? 'lv-LV' : 'en-GB', {day: '2-digit', month: 'short', year: 'numeric'}).format(timestamp) : '—';
}

function operationalStage(project: CrmProjectRecord) {
  const value = `${project.progress} ${project.status}`.toLowerCase();
  if (value.includes('completed') || value.includes('won')) return 'COMPLETED';
  if (value.includes('progress') || value.includes('active')) return 'IN PROGRESS';
  return 'SCHEDULED';
}

export default function CmsProjectOverviewClient({locale, projects}: Props) {
  const [view, setView] = useState<ViewMode>('board');
  const [period, setPeriod] = useState<Period>('all');
  const [month, setMonth] = useState(String(new Date().getMonth()));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [sort, setSort] = useState<SortMode>('updated');
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('all');

  const years = useMemo(() => Array.from(new Set(projects.map((project) => new Date(dateValue(project)).getFullYear()).filter(Number.isFinite))).sort((left, right) => right - left), [projects]);
  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects
      .filter((project) => !normalizedQuery || `${project.id} ${project.title} ${project.customer} ${project.company} ${project.location} ${project.owner}`.toLowerCase().includes(normalizedQuery))
      .filter((project) => stage === 'all' || operationalStage(project).toLowerCase() === stage)
      .filter((project) => {
        if (period === 'all') return true;
        const date = new Date(dateValue(project));
        return period === 'year' ? date.getFullYear() === Number(year) : date.getFullYear() === Number(year) && date.getMonth() === Number(month);
      })
      .sort((left, right) => {
        if (sort === 'title') return left.title.localeCompare(right.title);
        if (sort === 'value') return moneyValue(right.budget) - moneyValue(left.budget);
        if (sort === 'created') return Date.parse(right.createdAtUtc || '') - Date.parse(left.createdAtUtc || '');
        return dateValue(right) - dateValue(left);
      });
  }, [month, period, projects, query, sort, stage, year]);

  const totalValue = filteredProjects.reduce((sum, project) => sum + moneyValue(project.budget), 0);
  const stages = ['SCHEDULED', 'IN PROGRESS', 'COMPLETED'];
  const columns = stages;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Projects</p><p className="mt-2 text-3xl font-bold text-slate-900">{filteredProjects.length}</p><p className="mt-1 text-sm text-slate-500">Accepted CRM projects in view</p></div>
        <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Portfolio value</p><p className="mt-2 text-3xl font-bold text-slate-900">{formatMoney(String(totalValue), locale)}</p><p className="mt-1 text-sm text-slate-500">Current project values</p></div>
        <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Workforce</p><p className="mt-2 text-3xl font-bold text-slate-900">{new Set(filteredProjects.map((project) => project.owner).filter(Boolean)).size}</p><p className="mt-1 text-sm text-slate-500">Assigned owners across projects</p></div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search project or client" className="h-10 w-64 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-sky-400" />
          <select value={stage} onChange={(event) => setStage(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"><option value="all">All stages</option>{stages.map((entry) => <option key={entry} value={entry.toLowerCase()}>{entry}</option>)}</select>
          <select value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"><option value="all">All dates</option><option value="month">Month</option><option value="year">Year</option></select>
          {period !== 'all' ? <select value={year} onChange={(event) => setYear(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">{years.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select> : null}
          {period === 'month' ? <select value={month} onChange={(event) => setMonth(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">{Array.from({length: 12}, (_, index) => <option key={index} value={index}>{new Intl.DateTimeFormat(locale === 'lv' ? 'lv-LV' : 'en-GB', {month: 'long'}).format(new Date(2020, index, 1))}</option>)}</select> : null}
          <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"><option value="updated">Recently updated</option><option value="created">Recently created</option><option value="value">Highest value</option><option value="title">Project name</option></select>
        </div>
        <div className="flex gap-2"><button type="button" onClick={() => setView('board')} className={`h-10 rounded-xl px-3 text-sm font-semibold ${view === 'board' ? 'bg-sky-100 text-sky-700' : 'border border-slate-200 text-slate-600'}`}>Board</button><button type="button" onClick={() => setView('list')} className={`h-10 rounded-xl px-3 text-sm font-semibold ${view === 'list' ? 'bg-sky-100 text-sky-700' : 'border border-slate-200 text-slate-600'}`}>List</button></div>
      </div>

      {view === 'board' ? <div className="grid gap-4 xl:grid-cols-3">{columns.map((column) => { const items = filteredProjects.filter((project) => operationalStage(project) === column); return <section key={column} className="min-h-72 rounded-2xl border border-slate-200 bg-slate-50 p-3"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">{column}</h2><span className="rounded-full bg-white px-2 py-1 text-xs text-slate-500">{items.length}</span></div><div className="space-y-3">{items.map((project) => <Link key={project.id} href={`/${locale}/admin/project-360/${encodeURIComponent(project.id)}`} className="block rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-sky-300 hover:shadow"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">{project.id}</p><h3 className="mt-2 font-bold text-slate-900">{project.title}</h3><p className="mt-1 text-sm text-slate-600">{project.customer}</p><div className="mt-3 flex justify-between text-xs text-slate-500"><span>{formatMoney(project.budget, locale)}</span><span>{formatDate(project.updatedAtUtc, locale)}</span></div></Link>)}</div></section>; })}</div> : <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr>{['Project', 'Client', 'Stage', 'Owner', 'Value', 'Updated'].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filteredProjects.map((project) => <tr key={project.id} className="hover:bg-slate-50"><td className="px-4 py-3"><Link href={`/${locale}/admin/project-360/${encodeURIComponent(project.id)}`} className="font-semibold text-sky-700 hover:text-sky-900">{project.title}</Link><div className="text-xs text-slate-500">{project.id}</div></td><td className="px-4 py-3 text-sm text-slate-700">{project.customer}</td><td className="px-4 py-3 text-sm text-slate-700">{operationalStage(project)}</td><td className="px-4 py-3 text-sm text-slate-700">{project.owner || '—'}</td><td className="px-4 py-3 text-sm text-slate-700">{formatMoney(project.budget, locale)}</td><td className="px-4 py-3 text-sm text-slate-500">{formatDate(project.updatedAtUtc, locale)}</td></tr>)}</tbody></table></div>}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Brigade / Crew</p><h2 className="mt-2 text-xl font-bold text-slate-900">Workforce overview</h2></div><span className="text-xs text-slate-500">Project overview only</span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">Active people</p><p className="mt-2 text-2xl font-bold text-slate-900">{new Set(filteredProjects.map((project) => project.owner).filter(Boolean)).size || '—'}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">Monthly working hours</p><p className="mt-2 text-2xl font-bold text-slate-900">Not recorded</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">Active crew members</p><p className="mt-2 text-2xl font-bold text-slate-900">{new Set(filteredProjects.map((project) => project.owner).filter(Boolean)).size || '—'}</p></div></div>
        <div className="mt-4 overflow-x-auto"><table className="min-w-full divide-y divide-slate-200"><thead><tr>{['Owner / crew', 'Projects', 'Work-log entries', 'Allocation'].map((heading) => <th key={heading} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{Array.from(new Set(filteredProjects.map((project) => project.owner).filter(Boolean))).map((owner) => { const owned = filteredProjects.filter((project) => project.owner === owner); return <tr key={owner}><td className="px-3 py-3 text-sm font-semibold text-slate-900">{owner}</td><td className="px-3 py-3 text-sm text-slate-700">{owned.length}</td><td className="px-3 py-3 text-sm text-slate-700">{owned.reduce((sum, project) => sum + project.workLog.length, 0)}</td><td className="px-3 py-3 text-sm text-slate-500">Not recorded</td></tr>; })}</tbody></table></div>
      </section>
      {filteredProjects.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">No projects match the current filters.</div> : null}
    </div>
  );
}