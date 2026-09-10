'use client';

import {useMemo, useState} from 'react';
import type {CrmProjectRecord} from '@/lib/crmProjectsStore';

type Props = {locale: string; projects: CrmProjectRecord[]};
type Period = 'date' | 'monthly' | 'yearly';

function amount(value: string) {
  const parsed = Number.parseFloat(String(value || '').replace(/[^\d,.-]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function dateOf(project: CrmProjectRecord) {
  return Date.parse(project.updatedAtUtc || project.createdAtUtc || '') || 0;
}

export default function HomeOverviewClient({locale, projects}: Props) {
  const now = new Date();
  const [period, setPeriod] = useState<Period>('monthly');
  const [date, setDate] = useState(now.toISOString().slice(0, 10));
  const [month, setMonth] = useState(String(now.getMonth()));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [customKpis, setCustomKpis] = useState<Array<{name: string; value: string}>>([]);
  const [kpiName, setKpiName] = useState('');
  const [kpiValue, setKpiValue] = useState('');

  const years = Array.from(new Set(projects.map((project) => new Date(dateOf(project)).getFullYear()).filter(Number.isFinite))).sort((left, right) => right - left);
  const visibleProjects = useMemo(() => projects.filter((project) => {
    const projectDate = new Date(dateOf(project));
    if (period === 'yearly') return projectDate.getFullYear() === Number(year);
    if (period === 'monthly') return projectDate.getFullYear() === Number(year) && projectDate.getMonth() === Number(month);
    return projectDate.toISOString().slice(0, 10) === date;
  }), [date, month, period, projects, year]);

  const value = visibleProjects.reduce((sum, project) => sum + amount(project.budget), 0);
  const active = visibleProjects.filter((project) => !/completed|won/i.test(`${project.progress} ${project.status}`)).length;
  const stages = visibleProjects.reduce<Record<string, number>>((result, project) => {
    const stage = /completed|won/i.test(`${project.progress} ${project.status}`) ? 'Completed' : /progress|active/i.test(`${project.progress} ${project.status}`) ? 'In Progress' : 'Scheduled';
    result[stage] = (result[stage] || 0) + 1;
    return result;
  }, {});

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Monthly overview</h2>
        <div className="flex flex-wrap items-center gap-2">
          {(['date', 'monthly', 'yearly'] as Period[]).map((entry) => <button key={entry} type="button" onClick={() => setPeriod(entry)} className={`rounded-xl px-3 py-2 text-sm font-semibold ${period === entry ? 'bg-sky-100 text-sky-700' : 'border border-slate-200 bg-white text-slate-600'}`}>{entry === 'date' ? 'Date' : entry === 'monthly' ? 'Monthly' : 'Yearly'}</button>)}
          {period === 'date' ? <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm" /> : null}
          {period === 'monthly' ? <><select value={month} onChange={(event) => setMonth(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">{Array.from({length: 12}, (_, index) => <option key={index} value={index}>{new Intl.DateTimeFormat(locale === 'lv' ? 'lv-LV' : 'en-GB', {month: 'long'}).format(new Date(2020, index, 1))}</option>)}</select><select value={year} onChange={(event) => setYear(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">{years.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></> : null}
          {period === 'yearly' ? <select value={year} onChange={(event) => setYear(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm">{years.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select> : null}
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[['Sales', `${visibleProjects.length}`], ['Finance', new Intl.NumberFormat(locale === 'lv' ? 'lv-LV' : 'en-GB', {style: 'currency', currency: 'EUR', maximumFractionDigits: 0}).format(value)], ['Expenses', `${active}`], ['Efficiency', visibleProjects.length ? `${Math.round((visibleProjects.length - active) / visibleProjects.length * 100)}%` : '0%'], ...customKpis.map((kpi) => [kpi.name, kpi.value])].map(([label, metric]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold text-slate-900">{metric}</p></div>)}
      </div>

      <section className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button type="button" onClick={() => { if (kpiName.trim()) { setCustomKpis((current) => [...current, {name: kpiName.trim(), value: kpiValue.trim() || '—'}]); setKpiName(''); setKpiValue(''); } }} className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white">Add KPI</button>
        <input value={kpiName} onChange={(event) => setKpiName(event.target.value)} placeholder="KPI name" className="h-10 rounded-xl border border-slate-200 px-3 text-sm" />
        <input value={kpiValue} onChange={(event) => setKpiValue(event.target.value)} placeholder="Value" className="h-10 rounded-xl border border-slate-200 px-3 text-sm" />
      </section>
    </>
  );
}
