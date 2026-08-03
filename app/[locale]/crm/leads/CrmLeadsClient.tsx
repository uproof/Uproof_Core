"use client";

import {useEffect, useMemo, useRef, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import Card from '@/components/Card';
import Section from '@/components/Section';
import type {CrmLead} from '@/lib/crmMockData';
import {maskEmail, maskPhone} from '@/lib/sensitiveMask';
import {ArrowsUpDownIcon, ChevronDownIcon, ChevronUpIcon} from '@heroicons/react/24/outline';

type Props = {
  locale: string;
  leads: CrmLead[];
  isSalesView: boolean;
};

type LeadSortField = 'createdAt' | 'value' | 'activity' | 'status';
type LeadSortState = {field: LeadSortField; direction: 'asc' | 'desc'} | null;

const activityRank: Record<string, number> = {
  'First call': 1,
  '2nd call': 2,
  '3rd call': 3,
  Message: 4,
  Email: 5,
};

const statusRank = new Map<string, number>([
  ['NEW', 0],
  ['CONTACTED', 1],
  ['INSPECTION_SCHEDULED', 2],
  ['INSPECTION_COMPLETED', 3],
  ['ESTIMATING', 4],
  ['QUOTE_SENT', 5],
  ['WON', 6],
  ['LOST', 7],
  ['PROJECT_STARTED', 8],
  ['COMPLETED', 9],
  ['CANCELLED', 10],
]);

function parseMoney(value: string) {
  const numeric = Number.parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseDateValue(value?: string) {
  const timestamp = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function compareText(left: string, right: string) {
  return left.localeCompare(right, undefined, {numeric: true, sensitivity: 'base'});
}

function compareNumber(left: number, right: number) {
  return left - right;
}

function getCreatedAtValue(lead: CrmLead) {
  return lead.updatedAtUtc || lead.updatedAt;
}

function getStatusOrderValue(status: string) {
  return statusRank.get(status) ?? 999;
}

function getLeadSearchText(lead: CrmLead) {
  return [
    lead.id,
    lead.customer,
    lead.company,
    lead.phone,
    lead.email,
    lead.address,
    lead.problem,
    lead.projectAddress,
    lead.clientCharacterNote,
    lead.status,
    lead.progress,
    lead.activityUpdate,
    lead.dealProgress,
    lead.note,
    lead.owner,
    lead.value,
    lead.nextAction,
  ].join(' ');
}

export default function CrmLeadsClient({locale, leads, isSalesView}: Props) {
  const isLv = locale === 'lv';
  const router = useRouter();
  const tabIdRef = useRef(typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
  const liveChannelRef = useRef<BroadcastChannel | null>(null);
  const [query, setQuery] = useState('');
  const [sortState, setSortState] = useState<LeadSortState>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const channelName = 'crm-lead-live';
    const messageType = 'crm-lead-updated';

    const handleIncomingUpdate = (event: MessageEvent<unknown>) => {
      const payload = event.data as {type?: string; sourceTabId?: string} | null;
      if (!payload || payload.type !== messageType || payload.sourceTabId === tabIdRef.current) {
        return;
      }

      router.refresh();
    };

    const channel = 'BroadcastChannel' in window ? new BroadcastChannel(channelName) : null;
    liveChannelRef.current = channel;
    channel?.addEventListener('message', handleIncomingUpdate);

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== channelName || !event.newValue) {
        return;
      }

      try {
        const payload = JSON.parse(event.newValue) as {type?: string; sourceTabId?: string};
        if (payload.type === messageType && payload.sourceTabId !== tabIdRef.current) {
          router.refresh();
        }
      } catch {
        // Ignore malformed broadcast payloads.
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      channel?.removeEventListener('message', handleIncomingUpdate);
      channel?.close();
      liveChannelRef.current = null;
      window.removeEventListener('storage', handleStorage);
    };
  }, [router]);

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const nextLeads = leads
      .filter((lead) => {
        if (!normalizedQuery) return true;
        return getLeadSearchText(lead).toLowerCase().includes(normalizedQuery);
      })
      .sort((left, right) => {
        const activeSort = sortState ?? {field: 'createdAt' as const, direction: 'desc' as const};

        switch (activeSort.field) {
          case 'createdAt': {
            const leftValue = parseDateValue(getCreatedAtValue(left));
            const rightValue = parseDateValue(getCreatedAtValue(right));
            const result = compareNumber(leftValue, rightValue) || compareText(left.id, right.id);
            return activeSort.direction === 'asc' ? result : -result;
          }
          case 'value': {
            const result = compareNumber(parseMoney(left.value), parseMoney(right.value)) || compareText(left.id, right.id);
            return activeSort.direction === 'asc' ? result : -result;
          }
          case 'activity': {
            const result = compareNumber(activityRank[left.activityUpdate] || 999, activityRank[right.activityUpdate] || 999) || compareText(left.activityUpdate, right.activityUpdate) || compareText(left.id, right.id);
            return activeSort.direction === 'asc' ? result : -result;
          }
          case 'status': {
            const result = compareNumber(getStatusOrderValue(left.status), getStatusOrderValue(right.status)) || compareText(left.status, right.status) || compareText(left.id, right.id);
            return activeSort.direction === 'asc' ? result : -result;
          }
          default:
            return 0;
        }
      });

    return nextLeads;
  }, [leads, query, sortState]);

  const cycleSort = (field: LeadSortField) => {
    setSortState((current) => {
      if (!current || current.field !== field) {
        return {field, direction: 'asc'};
      }

      if (current.direction === 'asc') {
        return {field, direction: 'desc'};
      }

      return null;
    });
  };

  const getSortIcon = (field: LeadSortField) => {
    if (!sortState || sortState.field !== field) {
      return <ArrowsUpDownIcon className="h-4 w-4" aria-hidden="true" />;
    }

    return sortState.direction === 'asc'
      ? <ChevronUpIcon className="h-4 w-4" aria-hidden="true" />
      : <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />;
  };

  const isSortActive = (field: LeadSortField) => !sortState ? field === 'createdAt' : sortState.field === field;

  return (
    <Section pad="sm" className="px-0 !py-0">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-500">{isLv ? 'Līdu saraksts' : 'Lead list'}</p>
          <p className="mt-1 text-sm text-slate-500">
            {isLv ? 'Meklē pēc identifikatora, klienta, aktivitātes, vērtības vai statusa.' : 'Search by identifier, customer, activity, value, status, and more.'}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex min-w-[18rem] flex-1 items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">{isLv ? 'Meklēt' : 'Search'}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isLv ? 'L-1040, aktivitāte, vērtība, klients...' : 'L-1040, activity, value, customer...'}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-sky-100 bg-white p-2 shadow-sm">
            <span className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">{isLv ? 'Kārtot' : 'Sort'}</span>
            {[
              {field: 'createdAt' as const, label: isLv ? 'Datums' : 'Date Created'},
              {field: 'value' as const, label: isLv ? 'Vērtība' : 'Project Value'},
              {field: 'activity' as const, label: isLv ? 'Aktivitāte' : 'Last Activity'},
              {field: 'status' as const, label: isLv ? 'Statuss' : 'Lifecycle Stage'},
            ].map((item) => (
              <button
                key={item.field}
                type="button"
                onClick={() => cycleSort(item.field)}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  isSortActive(item.field)
                    ? 'border-sky-200 bg-sky-50 text-sky-700 shadow-sm'
                    : 'border-transparent bg-transparent text-slate-600 hover:border-sky-100 hover:bg-sky-50 hover:text-sky-700'
                }`}
                aria-pressed={isSortActive(item.field)}
              >
                <span>{item.label}</span>
                <span className="text-sky-500">{getSortIcon(item.field)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card variant="outlined" hover={false} className="border-sky-100 bg-sky-50">
          <p className="text-sm uppercase tracking-[0.22em] text-sky-500">{isLv ? 'Pārskats' : 'Board summary'}</p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">{isLv ? 'Līdu plūsma' : 'Lead workflow'}</h3>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
              <div className="text-2xl font-bold text-slate-900">{filteredLeads.filter((lead) => !['WON', 'LOST', 'COMPLETED', 'CANCELLED'].includes(lead.status)).length}</div>
              {isLv ? 'Atvērti līdi' : 'Open leads'}
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
              <div className="text-2xl font-bold text-slate-900">{filteredLeads.filter((lead) => lead.status === 'INSPECTION_SCHEDULED').length}</div>
              {isLv ? 'Plānotas apskates' : 'Scheduled inspections'}
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-sky-100 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            {isLv ? `Atrasti ${filteredLeads.length} līdi` : `Found ${filteredLeads.length} leads`}
          </div>
        </Card>

        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <Link key={lead.id} href={`/${locale}/crm/leads/${lead.id}`} className="block">
              <Card variant="outlined" hover className="border-sky-100 bg-white">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">{lead.id}</div>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">{lead.customer}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lead.company}</p>
                    <div className="mt-3 text-sm text-slate-600">
                      <div>{lead.address}</div>
                      <div>{isSalesView ? maskPhone(lead.phone) : lead.phone}</div>
                      <div>{isSalesView ? maskEmail(lead.email) : lead.email}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-slate-900">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-sky-500">
                      {lead.status === 'NEW' ? <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-label={isLv ? 'Jauns līds' : 'New lead'} /> : null}
                      <span>{lead.status.replaceAll('_', ' ')}</span>
                    </div>
                    <div className="mt-1 text-sm font-semibold">{lead.nextAction}</div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 lg:grid-cols-4 text-sm text-slate-600">
                  <span>{isLv ? 'Statuss' : 'Status'}: {lead.status.replaceAll('_', ' ')}</span>
                  <span>{isLv ? 'Progress' : 'Progress'}: {lead.progress}</span>
                  <span>{isLv ? 'Aktivitāte' : 'Activity'}: {lead.activityUpdate}</span>
                  <span>{isLv ? 'Darījums' : 'Deal'}: {lead.dealProgress}</span>
                </div>
              </Card>
            </Link>
          ))}

          {filteredLeads.length === 0 ? (
            <Card variant="outlined" hover={false} className="border-dashed border-sky-200 bg-white text-slate-600">
              {isLv ? 'Nav līdu, kas atbilst filtram.' : 'No leads match the current search.'}
            </Card>
          ) : null}
        </div>
      </div>
    </Section>
  );
}