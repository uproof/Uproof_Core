"use client";

import {useMemo, useState} from 'react';
import Link from 'next/link';
import {ArrowTopRightOnSquareIcon} from '@heroicons/react/24/outline';
import Section from '@/components/Section';
import type {CrmLead} from '@/lib/crmMockData';
import {maskEmail, maskPhone} from '@/lib/sensitiveMask';

type Props = {
  locale: string;
  leads: CrmLead[];
  isSalesView: boolean;
};

type DashboardSortKey = 'updated-desc' | 'updated-asc' | 'identifier-asc' | 'identifier-desc' | 'customer-asc' | 'customer-desc' | 'activity-asc' | 'activity-desc' | 'value-asc' | 'value-desc' | 'deal-asc' | 'deal-desc';

const activityRank: Record<string, number> = {
  'First call': 1,
  '2nd call': 2,
  '3rd call': 3,
  Message: 4,
  Email: 5,
};

function parseMoney(value: string) {
  const numeric = Number.parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : 0;
}

function compareText(left: string, right: string) {
  return left.localeCompare(right, undefined, {numeric: true, sensitivity: 'base'});
}

function getDashboardSearchText(lead: CrmLead) {
  return [
    lead.id,
    lead.customer,
    lead.company,
    lead.phone,
    lead.email,
    lead.address,
    lead.status,
    lead.progress,
    lead.activityUpdate,
    lead.dealProgress,
    lead.owner,
    lead.value,
    lead.nextAction,
  ].join(' ');
}

export default function CrmDashboardClient({locale, leads, isSalesView}: Props) {
  const isLv = locale === 'lv';
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<DashboardSortKey>('updated-desc');

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return leads
      .filter((lead) => {
        if (!normalizedQuery) return true;
        return getDashboardSearchText(lead).toLowerCase().includes(normalizedQuery);
      })
      .sort((left, right) => {
        switch (sortKey) {
          case 'updated-asc':
            return compareText(left.updatedAtUtc || left.updatedAt, right.updatedAtUtc || right.updatedAt);
          case 'updated-desc':
            return compareText(right.updatedAtUtc || right.updatedAt, left.updatedAtUtc || left.updatedAt);
          case 'identifier-asc':
            return compareText(left.id, right.id);
          case 'identifier-desc':
            return compareText(right.id, left.id);
          case 'customer-asc':
            return compareText(left.customer, right.customer);
          case 'customer-desc':
            return compareText(right.customer, left.customer);
          case 'activity-asc':
            return (activityRank[left.activityUpdate] || 999) - (activityRank[right.activityUpdate] || 999) || compareText(left.activityUpdate, right.activityUpdate);
          case 'activity-desc':
            return (activityRank[right.activityUpdate] || 999) - (activityRank[left.activityUpdate] || 999) || compareText(right.activityUpdate, left.activityUpdate);
          case 'value-asc':
            return parseMoney(left.value) - parseMoney(right.value) || compareText(left.value, right.value);
          case 'value-desc':
            return parseMoney(right.value) - parseMoney(left.value) || compareText(right.value, left.value);
          case 'deal-asc':
            return compareText(left.dealProgress, right.dealProgress);
          case 'deal-desc':
            return compareText(right.dealProgress, left.dealProgress);
          default:
            return 0;
        }
      });
  }, [leads, query, sortKey]);

  return (
    <Section pad="sm" className="px-0 !py-0">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-500">{isLv ? 'Līdu pārskats' : 'Lead board'}</p>
          <p className="mt-1 text-sm text-slate-500">{isLv ? 'Meklē pēc identifikatora, aktivitātes, vērtības vai klienta.' : 'Search by identifier, activity, value, or customer.'}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex min-w-[18rem] flex-1 items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">{isLv ? 'Meklēt' : 'Search'}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isLv ? 'L-1040, aktivitāte, summa...' : 'L-1040, activity, amount...'}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">{isLv ? 'Kārtot' : 'Sort'}</span>
            <select value={sortKey} onChange={(event) => setSortKey(event.target.value as DashboardSortKey)} className="bg-transparent text-sm text-slate-900 outline-none">
              <option value="updated-desc">{isLv ? 'Jaunākie pirmie' : 'Newest first'}</option>
              <option value="updated-asc">{isLv ? 'Vecākie pirmie' : 'Oldest first'}</option>
              <option value="identifier-asc">{isLv ? 'ID A-Z' : 'ID A-Z'}</option>
              <option value="identifier-desc">{isLv ? 'ID Z-A' : 'ID Z-A'}</option>
              <option value="customer-asc">{isLv ? 'Klients A-Z' : 'Customer A-Z'}</option>
              <option value="customer-desc">{isLv ? 'Klients Z-A' : 'Customer Z-A'}</option>
              <option value="activity-desc">{isLv ? 'Aktivitāte (jaunākā)' : 'Activity first'}</option>
              <option value="activity-asc">{isLv ? 'Aktivitāte (vecākā)' : 'Activity reverse'}</option>
              <option value="value-desc">{isLv ? 'Vērtība no lielākās' : 'Value high to low'}</option>
              <option value="value-asc">{isLv ? 'Vērtība no mazākās' : 'Value low to high'}</option>
              <option value="deal-asc">{isLv ? 'Darījums A-Z' : 'Deal A-Z'}</option>
              <option value="deal-desc">{isLv ? 'Darījums Z-A' : 'Deal Z-A'}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
        <div className="order-1 h-fit rounded-3xl border border-sky-100 bg-sky-50 p-4 shadow-sm lg:sticky lg:top-4">
          <p className="text-sm uppercase tracking-[0.22em] text-sky-500">{isLv ? 'Pārskats' : 'Board summary'}</p>
          <h3 className="mt-3 text-lg font-bold text-slate-900 leading-tight">{isLv ? 'Līdu plūsma' : 'Lead workflow'}</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
              <div className="text-xl font-bold text-slate-900">{filteredLeads.filter((lead) => !['WON', 'LOST', 'COMPLETED', 'CANCELLED'].includes(lead.status)).length}</div>
              <div className="mt-1">{isLv ? 'Atvērti līdi' : 'Open leads'}</div>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
              <div className="text-xl font-bold text-slate-900">{filteredLeads.filter((lead) => lead.status === 'INSPECTION_SCHEDULED').length}</div>
              <div className="mt-1">{isLv ? 'Plānotas apskates' : 'Scheduled inspections'}</div>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">{isLv ? 'Kopā' : 'Total'}</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{leads.length}</div>
              <div className="mt-1 text-xs text-slate-500">{isLv ? 'Visi līdi sarakstā' : 'All leads in the board'}</div>
            </div>
          </div>
        </div>

        <div className="order-2 h-fit overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm lg:sticky lg:top-4">
          <div className="grid grid-cols-[1.15fr_0.7fr_0.65fr_0.7fr_0.8fr_0.75fr] gap-0 border-b border-sky-100 bg-sky-50 px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-sky-500">
            <div>{isLv ? 'Līds' : 'Lead'}</div>
            <div>{isLv ? 'Statuss' : 'Status'}</div>
            <div>{isLv ? 'Progress' : 'Progress'}</div>
            <div>{isLv ? 'Aktivitāte' : 'Activity'}</div>
            <div>{isLv ? 'Darījums' : 'Deal'}</div>
            <div>{isLv ? 'Piezīme' : 'Note'}</div>
          </div>

          <div className="divide-y divide-sky-100">
            {filteredLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/${locale}/crm/leads/${lead.id.toLowerCase()}`}
                className="grid grid-cols-[1.15fr_0.7fr_0.65fr_0.7fr_0.8fr_0.75fr] items-center gap-0 px-5 py-5 transition hover:bg-sky-50/60"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-sky-500">
                    {lead.id}
                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="mt-2 text-base font-semibold text-slate-900">{lead.customer}</div>
                  <div className="mt-1 text-sm text-slate-600">{lead.address}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{isLv ? 'Kontakts:' : 'Contact:'}</span>
                    <span>{isSalesView ? maskPhone(lead.phone) : lead.phone}</span>
                    <span>·</span>
                    <span>{isSalesView ? maskEmail(lead.email) : lead.email}</span>
                  </div>
                </div>

                <div className="pr-3 text-sm text-slate-700">{lead.status.replaceAll('_', ' ')}</div>
                <div className="pr-3 text-sm text-slate-700">{lead.progress}</div>
                <div className="pr-3 text-sm text-slate-700">{lead.activityUpdate}</div>
                <div className="pr-3 text-sm text-slate-700">{lead.dealProgress}</div>
                <div className="pr-3 text-sm text-slate-600 line-clamp-2">{lead.note}</div>
              </Link>
            ))}
          </div>

          {filteredLeads.length === 0 ? (
            <div className="border-t border-dashed border-sky-200 px-5 py-6 text-sm text-slate-600">{isLv ? 'Nav līdu, kas atbilst filtram.' : 'No leads match the current search.'}</div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}