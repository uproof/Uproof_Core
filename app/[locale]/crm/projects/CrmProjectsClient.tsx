"use client";

import {useMemo, useState} from 'react';
import Card from '@/components/Card';
import Section from '@/components/Section';
import type {CrmProjectRecord} from '@/lib/crmProjectsStore';

type Props = {
  locale: string;
  projects: CrmProjectRecord[];
  isSalesView: boolean;
};

type ProjectSortKey = 'updated-desc' | 'updated-asc' | 'identifier-asc' | 'identifier-desc' | 'title-asc' | 'title-desc' | 'owner-asc' | 'owner-desc' | 'phase-asc' | 'phase-desc' | 'budget-asc' | 'budget-desc' | 'due-asc' | 'due-desc';

function compareText(left: string, right: string) {
  return left.localeCompare(right, undefined, {numeric: true, sensitivity: 'base'});
}

function parseMoney(value: string) {
  const numeric = Number.parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseDateValue(value: string) {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getProjectSearchText(project: CrmProjectRecord) {
  return [project.id, project.leadId, project.title, project.location, project.owner, project.phase, project.budget, project.dueDate, project.estimatorData.map((row) => [row.label, row.measurement, row.notes].join(' ')).join(' ')].join(' ');
}

export default function CrmProjectsClient({locale, projects}: Props) {
  const isLv = locale === 'lv';
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<ProjectSortKey>('updated-desc');

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects
      .filter((project) => !normalizedQuery || getProjectSearchText(project).toLowerCase().includes(normalizedQuery))
      .sort((left, right) => {
        switch (sortKey) {
          case 'updated-asc':
          case 'updated-desc':
            return compareText(sortKey === 'updated-asc' ? left.id : right.id, sortKey === 'updated-asc' ? right.id : left.id);
          case 'identifier-asc':
            return compareText(left.id, right.id);
          case 'identifier-desc':
            return compareText(right.id, left.id);
          case 'title-asc':
            return compareText(left.title, right.title);
          case 'title-desc':
            return compareText(right.title, left.title);
          case 'owner-asc':
            return compareText(left.owner, right.owner);
          case 'owner-desc':
            return compareText(right.owner, left.owner);
          case 'phase-asc':
            return compareText(left.phase, right.phase);
          case 'phase-desc':
            return compareText(right.phase, left.phase);
          case 'budget-asc':
            return parseMoney(left.budget) - parseMoney(right.budget) || compareText(left.budget, right.budget);
          case 'budget-desc':
            return parseMoney(right.budget) - parseMoney(left.budget) || compareText(right.budget, left.budget);
          case 'due-asc':
            return parseDateValue(left.dueDate) - parseDateValue(right.dueDate) || compareText(left.dueDate, right.dueDate);
          case 'due-desc':
            return parseDateValue(right.dueDate) - parseDateValue(left.dueDate) || compareText(right.dueDate, left.dueDate);
          default:
            return 0;
        }
      });
  }, [projects, query, sortKey]);

  return (
    <Section pad="sm" className="px-0 !py-0">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-500">{isLv ? 'Projekti' : 'Projects'}</p>
          <p className="mt-1 text-sm text-slate-500">{isLv ? 'Meklē pēc projekta, īpašnieka, fāzes, budžeta vai termiņa.' : 'Search by project, owner, phase, budget, due date, and more.'}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex min-w-[18rem] flex-1 items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">{isLv ? 'Meklēt' : 'Search'}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isLv ? 'P-1001, īpašnieks, budžets...' : 'P-1001, owner, budget...'}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">{isLv ? 'Kārtot' : 'Sort'}</span>
            <select value={sortKey} onChange={(event) => setSortKey(event.target.value as ProjectSortKey)} className="bg-transparent text-sm text-slate-900 outline-none">
              <option value="updated-desc">{isLv ? 'Jaunākie pirmie' : 'Newest first'}</option>
              <option value="updated-asc">{isLv ? 'Vecākie pirmie' : 'Oldest first'}</option>
              <option value="identifier-asc">{isLv ? 'ID A-Z' : 'ID A-Z'}</option>
              <option value="identifier-desc">{isLv ? 'ID Z-A' : 'ID Z-A'}</option>
              <option value="title-asc">{isLv ? 'Nosaukums A-Z' : 'Title A-Z'}</option>
              <option value="title-desc">{isLv ? 'Nosaukums Z-A' : 'Title Z-A'}</option>
              <option value="owner-asc">{isLv ? 'Atbildīgais A-Z' : 'Owner A-Z'}</option>
              <option value="owner-desc">{isLv ? 'Atbildīgais Z-A' : 'Owner Z-A'}</option>
              <option value="phase-asc">{isLv ? 'Fāze A-Z' : 'Phase A-Z'}</option>
              <option value="phase-desc">{isLv ? 'Fāze Z-A' : 'Phase Z-A'}</option>
              <option value="budget-desc">{isLv ? 'Budžets (no lielākā)' : 'Budget high to low'}</option>
              <option value="budget-asc">{isLv ? 'Budžets (no mazākā)' : 'Budget low to high'}</option>
              <option value="due-asc">{isLv ? 'Termiņš tuvākais' : 'Due soonest'}</option>
              <option value="due-desc">{isLv ? 'Termiņš tālākais' : 'Due latest'}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card variant="outlined" hover={false} className="border-sky-100 bg-sky-50">
          <p className="text-sm uppercase tracking-[0.22em] text-sky-500">{isLv ? 'Pārskats' : 'Board summary'}</p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">{isLv ? 'Projekta plūsma' : 'Project workflow'}</h3>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
              <div className="text-2xl font-bold text-slate-900">{filteredProjects.length}</div>
              {isLv ? 'Atrasti projekti' : 'Projects found'}
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
              <div className="text-2xl font-bold text-slate-900">{filteredProjects.filter((project) => project.phase.toLowerCase().includes('done') || project.phase.toLowerCase().includes('complete')).length}</div>
              {isLv ? 'Pabeigtie' : 'Completed'}
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            {isLv ? `Atrasti ${filteredProjects.length} projekti` : `Found ${filteredProjects.length} projects`}
          </div>
        </Card>

        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} variant="outlined" hover={false} className="border-sky-100 bg-white">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">{project.id}</div>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">{project.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{project.phase}</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div>{isLv ? 'Atbildīgais' : 'Owner'}: {project.owner}</div>
                <div>{isLv ? 'Budžets' : 'Budget'}: {project.budget}</div>
                <div>{isLv ? 'Termiņš' : 'Due'}: {project.dueDate}</div>
              </div>
              <div className="mt-5 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">{isLv ? 'Estimator dati' : 'Estimator data'}</div>
                <div className="space-y-2">
                  {project.estimatorData.map((row) => (
                    <div key={`${project.id}-${row.label}-${row.measurement}-${row.notes}`} className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-slate-700">
                      <div className="font-semibold text-slate-900">{row.label || '—'}</div>
                      <div>{row.measurement || '—'}</div>
                      <div className="text-slate-500">{row.notes || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}

          {filteredProjects.length === 0 ? <Card variant="outlined" hover={false} className="border-dashed border-sky-200 bg-white text-slate-600">{isLv ? 'Nav projektu, kas atbilst filtram.' : 'No projects match the current search.'}</Card> : null}
        </div>
      </div>
    </Section>
  );
}