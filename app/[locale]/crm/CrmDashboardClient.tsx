"use client";

import {useMemo, useState} from 'react';
import Link from 'next/link';
import {ArrowTopRightOnSquareIcon, ChatBubbleLeftRightIcon, ClockIcon, UserPlusIcon} from '@heroicons/react/24/outline';
import Section from '@/components/Section';
import type {CrmLead} from '@/lib/crmMockData';

type Props = {
  locale: string;
  leads: CrmLead[];
  isSalesView: boolean;
};

type PipelineStageKey = 'new-lead' | 'waiting-data' | 'estimating' | 'estimate-done' | 'estimate-sent' | 'accepted' | 'denied' | 'frozen';
type DateFilterKey = 'all' | 'today' | 'last-7-days' | 'last-30-days' | 'this-month';

type PipelineStage = {
  key: PipelineStageKey;
  labelEn: string;
  labelLv: string;
  toneClass: string;
  laneClass: string;
};

const PIPELINE_STAGES: PipelineStage[] = [
  {key: 'new-lead', labelEn: 'New lead', labelLv: 'Jauns līds', toneClass: 'border-gray-400 bg-gray-300', laneClass: 'border-gray-300 bg-gray-100'},
  {key: 'waiting-data', labelEn: 'Waiting data', labelLv: 'Gaida datus', toneClass: 'border-gray-400 bg-gray-300', laneClass: 'border-gray-300 bg-gray-100'},
  {key: 'estimating', labelEn: 'Estimating', labelLv: 'Tāmēšana', toneClass: 'border-gray-400 bg-gray-300', laneClass: 'border-gray-300 bg-gray-100'},
  {key: 'estimate-done', labelEn: 'Estimate done', labelLv: 'Tāme pabeigta', toneClass: 'border-gray-400 bg-gray-300', laneClass: 'border-gray-300 bg-gray-100'},
  {key: 'estimate-sent', labelEn: 'Estimate sent', labelLv: 'Tāme nosūtīta', toneClass: 'border-gray-400 bg-gray-300', laneClass: 'border-gray-300 bg-gray-100'},
  {key: 'accepted', labelEn: 'Accepted', labelLv: 'Pieņemts', toneClass: 'border-gray-400 bg-gray-300', laneClass: 'border-gray-300 bg-gray-100'},
  {key: 'denied', labelEn: 'Denied', labelLv: 'Noraidīts', toneClass: 'border-gray-400 bg-gray-300', laneClass: 'border-gray-300 bg-gray-100'},
  {key: 'frozen', labelEn: 'Frozen', labelLv: 'Iesaldēts', toneClass: 'border-gray-500 bg-gray-400', laneClass: 'border-gray-400 bg-gray-200'},
];

const ESTIMATOR_COMPLETION_KEYS: Array<keyof CrmLead['estimatorData']> = [
  'roofProblem',
  'existingRoofCovering',
  'existingRoofArea',
  'buildingType',
  'desiredRoofCovering',
  'materialType',
  'roofPitch',
  'gutterSystem',
  'insulation',
  'roofStructureCondition',
];

const ESTIMATOR_ESTIMATED_THRESHOLD = 4;

function getLeadCreatedAtMs(lead: CrmLead) {
  const raw = lead.createdAtUtc || lead.createdAt || '';
  if (!raw) return null;
  const timestamp = Date.parse(raw);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function getLeadActivityAtMs(lead: CrmLead) {
  const raw = lead.updatedAtUtc || lead.updatedAt || lead.createdAtUtc || lead.createdAt || '';
  const timestamp = Date.parse(raw);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function isClientResponse(lead: CrmLead) {
  const activity = `${lead.activityUpdate} ${lead.note} ${lead.nextAction}`.toLowerCase();
  return ['message', 'email', 'response', 'replied', 'reply', 'client called', 'client responded'].some((term) => activity.includes(term));
}

function isWithinDateFilter(lead: CrmLead, filter: DateFilterKey) {
  if (filter === 'all') return true;

  const createdAtMs = getLeadCreatedAtMs(lead);
  if (createdAtMs == null) return false;

  const now = new Date();
  const createdAt = new Date(createdAtMs);

  if (filter === 'today') {
    return createdAt.toDateString() === now.toDateString();
  }

  if (filter === 'last-7-days') {
    return now.getTime() - createdAtMs <= 7 * 24 * 60 * 60 * 1000;
  }

  if (filter === 'last-30-days') {
    return now.getTime() - createdAtMs <= 30 * 24 * 60 * 60 * 1000;
  }

  if (filter === 'this-month') {
    return createdAt.getFullYear() === now.getFullYear() && createdAt.getMonth() === now.getMonth();
  }

  return true;
}

function parseMoney(value: string) {
  const numeric = Number.parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
  return Number.isFinite(numeric) ? numeric : 0;
}

function getDashboardSearchText(lead: CrmLead) {
  return [
    lead.id,
    lead.problem,
    lead.title,
    lead.customer,
    lead.company,
    lead.address,
    lead.status,
    lead.activityUpdate,
    lead.value,
    lead.nextAction,
    lead.note,
  ].join(' ');
}

function getEstimatorCompletionCount(lead: CrmLead) {
  return ESTIMATOR_COMPLETION_KEYS.reduce((count, key) => {
    const value = lead.estimatorData?.[key];
    if (typeof value === 'string') {
      return value.trim() ? count + 1 : count;
    }
    if (typeof value === 'number') {
      return Number.isFinite(value) ? count + 1 : count;
    }
    if (typeof value === 'boolean') {
      return count + 1;
    }
    return value != null ? count + 1 : count;
  }, 0);
}

function getPipelineStage(lead: CrmLead): PipelineStageKey {
  const status = String(lead.status || '').toUpperCase();
  const stageByStatus: Record<string, PipelineStageKey> = {
    NEW_LEAD: 'new-lead',
    WAITING_DATA: 'waiting-data',
    ESTIMATING: 'estimating',
    ESTIMATE_DONE: 'estimate-done',
    ESTIMATE_SENT: 'estimate-sent',
    ACCEPTED: 'accepted',
    DENIED: 'denied',
    FROZEN: 'frozen',
  };
  return stageByStatus[status] || 'waiting-data';
}

function formatValue(value: string, locale: string) {
  const amount = parseMoney(value);
  if (!amount) return value || '-';
  return new Intl.NumberFormat(locale === 'lv' ? 'lv-LV' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CrmDashboardClient({locale, leads, isSalesView}: Props) {
  const isLv = locale === 'lv';
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterKey>('all');

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return leads
      .filter((lead) => isWithinDateFilter(lead, dateFilter))
      .filter((lead) => {
        if (!normalizedQuery) return true;
        return getDashboardSearchText(lead).toLowerCase().includes(normalizedQuery);
      })
      .sort((left, right) => {
        const rightCreatedAt = getLeadCreatedAtMs(right) || 0;
        const leftCreatedAt = getLeadCreatedAtMs(left) || 0;
        if (rightCreatedAt !== leftCreatedAt) {
          return rightCreatedAt - leftCreatedAt;
        }
        return (right.updatedAtUtc || right.updatedAt).localeCompare(left.updatedAtUtc || left.updatedAt);
      });
  }, [dateFilter, leads, query]);

  const board = useMemo(() => {
    const initial: Record<PipelineStageKey, CrmLead[]> = {
      'new-lead': [],
      'waiting-data': [],
      estimating: [],
      'estimate-done': [],
      'estimate-sent': [],
      accepted: [],
      denied: [],
      frozen: [],
    };

    for (const lead of filteredLeads) {
      initial[getPipelineStage(lead)].push(lead);
    }

    return initial;
  }, [filteredLeads]);

  const notificationGroups = useMemo(() => {
    const now = Date.now();
    const inactiveCutoff = now - 3 * 24 * 60 * 60 * 1000;
    const activeLeads = leads.filter((lead) => String(lead.status || '').toUpperCase() !== 'FROZEN');

    return [
      {
        key: 'new',
        label: isLv ? 'Jauni līdi' : 'New leads',
        icon: UserPlusIcon,
        tone: 'border-sky-200 bg-sky-50',
        leads: activeLeads.filter((lead) => String(lead.status || '').toUpperCase() === 'NEW'),
      },
      {
        key: 'responses',
        label: isLv ? 'Klientu atbildes' : 'Client responses',
        icon: ChatBubbleLeftRightIcon,
        tone: 'border-emerald-200 bg-emerald-50',
        leads: activeLeads.filter(isClientResponse),
      },
      {
        key: 'inactive',
        label: isLv ? 'Neaktīvi 3+ dienas' : 'Inactive for 3+ days',
        icon: ClockIcon,
        tone: 'border-amber-200 bg-amber-50',
        leads: activeLeads.filter((lead) => {
          const activityAt = getLeadActivityAtMs(lead);
          return activityAt != null && activityAt < inactiveCutoff;
        }),
      },
    ];
  }, [isLv, leads]);

  return (
    <Section pad="sm" className="px-0 !py-0">
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:-ml-3 lg:translate-y-8">
          <section className="flex w-full flex-col gap-3" aria-label={isLv ? 'Paziņojumi' : 'Notifications'}>
        {notificationGroups.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.key} className={`w-full rounded-2xl border p-3 ${group.tone}`}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Icon className="h-5 w-5 text-slate-600" />
                  {group.label}
                </div>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">{group.leads.length}</span>
              </div>
              {group.leads.length > 0 ? (
                <div className="space-y-1.5">
                  {group.leads.slice(0, 4).map((lead) => (
                    <Link key={`${group.key}-${lead.id}`} href={`/${locale}/crm/leads/${lead.id.toLowerCase()}`} className="block rounded-xl bg-white/80 px-3 py-2 text-sm text-slate-700 transition hover:bg-white">
                      <span className="font-semibold text-slate-900">{lead.title || lead.customer || lead.id}</span>
                      <span className="ml-2 text-xs text-slate-500">{lead.customer}</span>
                    </Link>
                  ))}
                  {group.leads.length > 4 && <p className="px-1 pt-1 text-xs text-slate-500">+{group.leads.length - 4} more</p>}
                </div>
              ) : (
                <p className="px-1 py-2 text-sm text-slate-500">{isLv ? 'Nav paziņojumu.' : 'No notifications.'}</p>
              )}
            </div>
          );
        })}
          </section>
        </aside>

        <div className="min-w-0">
          <div className="mb-4">
            <div className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm">
              <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <label className="flex w-full items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/30 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">{isLv ? 'Meklēt' : 'Search'}</span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={isLv ? 'Nosaukums, klients, adrese, nākamā darbība...' : 'Title, client, address, next action...'}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </label>

                <label className="flex w-full items-center gap-3 rounded-xl border border-sky-100 bg-sky-50/30 px-4 py-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">{isLv ? 'Pievienošanas laiks' : 'Date added'}</span>
                  <select
                    value={dateFilter}
                    onChange={(event) => setDateFilter(event.target.value as DateFilterKey)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none"
                  >
                    <option value="all">{isLv ? 'Visi laiki' : 'All time'}</option>
                    <option value="today">{isLv ? 'Šodien' : 'Today'}</option>
                    <option value="last-7-days">{isLv ? 'Pēdējās 7 dienas' : 'Last 7 days'}</option>
                    <option value="last-30-days">{isLv ? 'Pēdējās 30 dienas' : 'Last 30 days'}</option>
                    <option value="this-month">{isLv ? 'Šis mēnesis' : 'This month'}</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4 pb-2">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = board[stage.key];

          return (
            <section key={stage.key} className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className={`mb-3 flex items-center justify-between rounded-2xl border px-3 py-2 ${stage.toneClass}`}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-900">{isLv ? stage.labelLv : stage.labelEn}</h3>
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">{stageLeads.length}</span>
              </div>

              {stageLeads.length > 0 ? (
                <div className={`max-h-[420px] overflow-auto rounded-2xl border p-2 ${stage.laneClass}`}>
                  <div className="flex min-w-max items-stretch gap-3 pb-1">
                    {stageLeads.map((lead) => (
                      <Link
                        key={lead.id}
                        href={`/${locale}/crm/leads/${lead.id.toLowerCase()}`}
                        className="block min-h-[220px] w-[320px] shrink-0 rounded-2xl border border-gray-400 bg-gray-200 p-3 shadow-sm transition hover:border-gray-500 hover:bg-gray-300 hover:shadow"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">{lead.id}</p>
                          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-sky-500" />
                        </div>

                        <div className="space-y-1.5 text-sm text-slate-700">
                          <p><span className="font-semibold text-slate-900">Title:</span> {lead.title || lead.problem || lead.note || '-'}</p>
                          <p><span className="font-semibold text-slate-900">{isLv ? 'Last Activity:' : 'Last Activity:'}</span> {lead.activityUpdate || '-'}</p>
                          <p><span className="font-semibold text-slate-900">{isLv ? 'Address:' : 'Address:'}</span> {lead.address || '-'}</p>
                          <p><span className="font-semibold text-slate-900">{isLv ? 'Total Value:' : 'Total Value:'}</span> {formatValue(lead.value, locale)}</p>
                          <p><span className="font-semibold text-slate-900">{isLv ? 'Client Name:' : 'Client Name:'}</span> {lead.customer || '-'}</p>
                          <p><span className="font-semibold text-slate-900">{isLv ? 'Next action:' : 'Next action:'}</span> {lead.nextAction || lead.note || '-'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={`rounded-2xl border border-dashed px-3 py-5 text-center text-sm text-slate-500 ${stage.laneClass}`}>
                  {isLv ? 'Nav līdu šajā rindā.' : 'No leads in this row.'}
                </div>
              )}
            </section>
          );
        })}
          </div>
        </div>
      </div>
    </Section>
  );
}