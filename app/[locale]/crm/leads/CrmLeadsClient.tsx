"use client";

import {useEffect, useMemo, useRef, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import Card from '@/components/Card';
import Section from '@/components/Section';
import type {CrmLead} from '@/lib/crmMockData';
import {maskEmail, maskPhone} from '@/lib/sensitiveMask';

type Props = {
  locale: string;
  leads: CrmLead[];
  isSalesView: boolean;
};

type LeadSortKey = 'updated-desc' | 'updated-asc' | 'identifier-asc' | 'identifier-desc' | 'customer-asc' | 'customer-desc' | 'activity-asc' | 'activity-desc' | 'value-asc' | 'value-desc' | 'status-asc' | 'status-desc';

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

function compareText(left: string, right: string) {
  return left.localeCompare(right, undefined, {numeric: true, sensitivity: 'base'});
}

export default function CrmLeadsClient({locale, leads, isSalesView}: Props) {
  const isLv = locale === 'lv';
  const router = useRouter();
  const tabIdRef = useRef(typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
  const liveChannelRef = useRef<BroadcastChannel | null>(null);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<LeadSortKey>('updated-desc');

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
          case 'status-asc':
            return compareText(left.status, right.status);
          case 'status-desc':
            return compareText(right.status, left.status);
          default:
            return 0;
        }
      });

    return nextLeads;
  }, [leads, query, sortKey]);

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

          <label className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">{isLv ? 'Kārtot' : 'Sort'}</span>
            <select value={sortKey} onChange={(event) => setSortKey(event.target.value as LeadSortKey)} className="bg-transparent text-sm text-slate-900 outline-none">
              <option value="updated-desc">{isLv ? 'Jaunākie pirmie' : 'Newest first'}</option>
              <option value="updated-asc">{isLv ? 'Vecākie pirmie' : 'Oldest first'}</option>
              <option value="identifier-asc">{isLv ? 'ID A-Z' : 'ID A-Z'}</option>
              <option value="identifier-desc">{isLv ? 'ID Z-A' : 'ID Z-A'}</option>
              <option value="customer-asc">{isLv ? 'Klients A-Z' : 'Customer A-Z'}</option>
              <option value="customer-desc">{isLv ? 'Klients Z-A' : 'Customer Z-A'}</option>
              <option value="activity-asc">{isLv ? 'Aktivitāte' : 'Activity'}</option>
              <option value="activity-desc">{isLv ? 'Aktivitāte pretējā secībā' : 'Activity reverse'}</option>
              <option value="value-desc">{isLv ? 'Vērtība (no lielākās)' : 'Value high to low'}</option>
              <option value="value-asc">{isLv ? 'Vērtība (no mazākās)' : 'Value low to high'}</option>
              <option value="status-asc">{isLv ? 'Statuss A-Z' : 'Status A-Z'}</option>
              <option value="status-desc">{isLv ? 'Statuss Z-A' : 'Status Z-A'}</option>
            </select>
          </label>
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
                    <div className="text-xs uppercase tracking-[0.2em] text-sky-500">{lead.status.replaceAll('_', ' ')}</div>
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