'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowLeftIcon, PencilSquareIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, CheckCircleIcon} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import Card from '@/components/Card';
import Section from '@/components/Section';
import {CrmLead, CrmLeadWorkLogEntry} from '@/lib/crmMockData';
import {CRM_ESTIMATOR_BOOLEAN_OPTIONS, CRM_ESTIMATOR_FIELD_DEFINITIONS, CRM_ESTIMATOR_FIELD_SECTIONS, createEmptyCrmEstimatorData, formatEstimatorValue, CrmEstimatorFormData} from '@/lib/crmEstimator';

const statusOptions = ['NEW', 'CONTACTED', 'INSPECTION_SCHEDULED', 'INSPECTION_COMPLETED', 'ESTIMATING', 'QUOTE_SENT', 'WON', 'LOST', 'PROJECT_STARTED', 'COMPLETED', 'CANCELLED'];
const progressOptions = ['new', 'reached', 'in progress', 'cancelled', 'won'];
const activityOptions = ['First call', '2nd call', '3rd call', 'Message', 'Email'];
const dealOptions = ['Negotiation', 'Signed', 'Lost', 'Won', 'Cancelled'];

type DesiredInfoRow = {
  solution: string;
  time: string;
};

type QuoteVariantKey = 'eco' | 'optimal' | 'lux';

type QuoteVariantState = {
  key: QuoteVariantKey;
  amount: string;
  liked: boolean;
  fileName: string;
};

const QUOTE_VARIANT_ORDER: QuoteVariantKey[] = ['eco', 'optimal', 'lux'];

function parseDesiredInfoRows(solutionValue: string, timeValue: string): DesiredInfoRow[] {
  const solutions = solutionValue.split('\n').map((entry) => entry.trim());
  const times = timeValue.split('\n').map((entry) => entry.trim());
  const count = Math.max(solutions.length, times.length, 1);

  const rows: DesiredInfoRow[] = [];
  for (let index = 0; index < count; index += 1) {
    rows.push({solution: solutions[index] || '', time: times[index] || ''});
  }

  return rows;
}

function serializeDesiredInfoRows(rows: DesiredInfoRow[]) {
  const normalized = rows
    .map((row) => ({solution: row.solution.trim(), time: row.time.trim()}))
    .filter((row) => row.solution || row.time);

  return {
    solutions: normalized.map((row) => row.solution).join('\n'),
    times: normalized.map((row) => row.time).join('\n'),
  };
}

function parseQuoteVariantNote(note: string) {
  if (!note) {
    return {liked: false, fileName: ''};
  }

  try {
    const parsed = JSON.parse(note) as {liked?: boolean; fileName?: string};
    return {
      liked: !!parsed.liked,
      fileName: typeof parsed.fileName === 'string' ? parsed.fileName : '',
    };
  } catch {
    return {liked: false, fileName: ''};
  }
}

function parseQuoteVariants(estimatorData: CrmEstimatorFormData): QuoteVariantState[] {
  const legacyRows = Array.isArray(estimatorData.legacyRows) ? estimatorData.legacyRows : [];
  return QUOTE_VARIANT_ORDER.map((key) => {
    const row = legacyRows.find((entry) => entry.label === `quote:${key}`);
    const parsedNote = parseQuoteVariantNote(row?.notes || '');
    return {
      key,
      amount: row?.measurement || '',
      liked: parsedNote.liked,
      fileName: parsedNote.fileName,
    };
  });
}

function serializeQuoteVariants(variants: QuoteVariantState[]) {
  return variants.map((variant) => ({
    label: `quote:${variant.key}`,
    measurement: variant.amount.trim(),
    notes: JSON.stringify({liked: variant.liked, fileName: variant.fileName.trim()}),
  }));
}

const HIDDEN_ESTIMATOR_KEYS = new Set<keyof CrmEstimatorFormData>([
  'plannedExecutionTime',
  'chimneyRenovation',
  'chimneyRenovationCount',
  'chimneySheetCladding',
  'chimneySheetCladdingCount',
  'chimneyCaps',
  'chimneyCapsCount',
]);

const CHIMNEY_WORK_TYPE_OPTIONS = [
  {value: 'renovation:Daļēji jāpārmūrē', labelLv: 'Skursteņa atjaunošana - daļēji jāpārmūrē', labelEn: 'Chimney renovation - partial rebuild'},
  {value: 'renovation:Pilnībā jāpārmūrē', labelLv: 'Skursteņa atjaunošana - pilnībā jāpārmūrē', labelEn: 'Chimney renovation - full rebuild'},
  {value: 'renovation:Jāatjauno apmetums', labelLv: 'Skursteņa atjaunošana - jāatjauno apmetums', labelEn: 'Chimney renovation - refresh render/plaster'},
  {value: 'renovation:Jāpārkrāso', labelLv: 'Skursteņa atjaunošana - jāpārkrāso', labelEn: 'Chimney renovation - repaint'},
  {value: 'sheet-cladding', labelLv: 'Skursteņa apdare ar skārdu', labelEn: 'Chimney sheet cladding'},
  {value: 'caps', labelLv: 'Skursteņu jumtiņi / cepures', labelEn: 'Chimney caps'},
  {value: 'custom', labelLv: 'Cits darbs', labelEn: 'Other work'},
];

function autoExpandTextarea(event: React.FormEvent<HTMLTextAreaElement>) {
  const target = event.currentTarget;
  target.style.height = 'auto';
  target.style.height = `${target.scrollHeight}px`;
}

function syncLegacyChimneyFields(entries: CrmEstimatorFormData['chimneyEntries']) {
  const renovationEntries = entries.filter((entry) => entry.workType.startsWith('renovation:'));
  const sheetEntries = entries.filter((entry) => entry.workType === 'sheet-cladding');
  const capEntries = entries.filter((entry) => entry.workType === 'caps');

  const total = (items: CrmEstimatorFormData['chimneyEntries']) => {
    const amount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    return amount > 0 ? amount : null;
  };

  return {
    chimneyRenovation: renovationEntries.length > 0
      ? (renovationEntries[0].workType.replace('renovation:', '') || 'jāskatās dzīvē')
      : 'Nav nepieciešams',
    chimneyRenovationCount: total(renovationEntries),
    chimneySheetCladding: sheetEntries.length > 0,
    chimneySheetCladdingCount: total(sheetEntries),
    chimneyCaps: capEntries.length > 0,
    chimneyCapsCount: total(capEntries),
  };
}

type Props = {
  locale: string;
  lead: CrmLead;
  signedAttachments: Array<{name: string; url: string}>;
  showWorkLog?: boolean;
  accessScope?: 'sales' | 'admin';
};

export default function LeadManagementClient({locale, lead, signedAttachments, showWorkLog = false, accessScope = 'sales'}: Props) {
  const isLv = locale === 'lv';
  const isSalesScope = accessScope === 'sales';
  const backHref = `/${locale}/${accessScope === 'admin' ? 'admin/crm/leads' : 'crm'}`;
  const router = useRouter();
  const tabIdRef = useRef(typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
  const liveChannelRef = useRef<BroadcastChannel | null>(null);
  const [version, setVersion] = useState(lead.updatedAtUtc);
  const [status, setStatus] = useState(lead.status);
  const [progress, setProgress] = useState(lead.progress);
  const [activityUpdate, setActivityUpdate] = useState(lead.activityUpdate);
  const [dealProgress, setDealProgress] = useState(lead.dealProgress);
  const [customerName, setCustomerName] = useState(lead.customer);
  const [title, setTitle] = useState(lead.title || '');
  const [projectAddress, setProjectAddress] = useState(lead.projectAddress || lead.address);
  const [problem, setProblem] = useState(lead.problem || '');
  const [desiredInfoRows, setDesiredInfoRows] = useState<DesiredInfoRow[]>(parseDesiredInfoRows(lead.clientCharacterNote || '', lead.estimatorData?.plannedExecutionTime || ''));
  const [quoteVariants, setQuoteVariants] = useState<QuoteVariantState[]>(parseQuoteVariants(lead.estimatorData || createEmptyCrmEstimatorData()));
  const [note, setNote] = useState(lead.note);
  const [estimatorData, setEstimatorData] = useState(lead.estimatorData || createEmptyCrmEstimatorData());
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const [quoteState, setQuoteState] = useState<'idle' | 'creating' | 'created' | 'error'>('idle');
  const [quoteError, setQuoteError] = useState('');
  const [quoteAcceptUrl, setQuoteAcceptUrl] = useState('');
  const workLog: CrmLeadWorkLogEntry[] = showWorkLog ? (lead.workLog || []) : [];
  const displayCustomerName = customerName;
  const displayAddress = lead.address;
  const displayCompany = lead.company;
  const displayValue = lead.value;

  const estimatorSections = useMemo(() => CRM_ESTIMATOR_FIELD_SECTIONS, []);

  useEffect(() => {
    setVersion(lead.updatedAtUtc);
    setStatus(lead.status);
    setProgress(lead.progress);
    setActivityUpdate(lead.activityUpdate);
    setDealProgress(lead.dealProgress);
    setCustomerName(lead.customer);
    setTitle(lead.title || '');
    setProjectAddress(lead.projectAddress || lead.address);
    setProblem(lead.problem || '');
    setDesiredInfoRows(parseDesiredInfoRows(lead.clientCharacterNote || '', lead.estimatorData?.plannedExecutionTime || ''));
    setQuoteVariants(parseQuoteVariants(lead.estimatorData || createEmptyCrmEstimatorData()));
    setNote(lead.note);
    setEstimatorData(lead.estimatorData || createEmptyCrmEstimatorData());
  }, [
    lead.address,
    lead.activityUpdate,
    lead.clientCharacterNote,
    lead.customer,
    lead.dealProgress,
    lead.estimatorData,
    lead.note,
    lead.problem,
    lead.progress,
    lead.projectAddress,
    lead.status,
    lead.title,
    lead.updatedAtUtc,
  ]);

  const updateEstimatorField = <K extends keyof typeof estimatorData>(key: K, value: (typeof estimatorData)[K]) => {
    setEstimatorData((current) => ({...current, [key]: value}));
  };

  const updateChimneyEntries = (updater: (entries: CrmEstimatorFormData['chimneyEntries']) => CrmEstimatorFormData['chimneyEntries']) => {
    setEstimatorData((current) => {
      const nextEntries = updater(current.chimneyEntries || []);
      return {
        ...current,
        chimneyEntries: nextEntries,
        ...syncLegacyChimneyFields(nextEntries),
      };
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const channelName = `crm-lead-live:${lead.id}`;
    const messageType = 'crm-lead-updated';

    const handleIncomingUpdate = (event: MessageEvent<unknown>) => {
      const payload = event.data as {type?: string; leadId?: string; sourceTabId?: string} | null;
      if (!payload || payload.type !== messageType || payload.leadId !== lead.id || payload.sourceTabId === tabIdRef.current) {
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
        const payload = JSON.parse(event.newValue) as {type?: string; leadId?: string; sourceTabId?: string};
        if (payload.type === messageType && payload.leadId === lead.id && payload.sourceTabId !== tabIdRef.current) {
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
  }, [lead.id, router]);

  const broadcastLeadUpdate = (updatedLead: CrmLead) => {
    if (typeof window === 'undefined') {
      return;
    }

    const payload = {
      type: 'crm-lead-updated',
      leadId: updatedLead.id,
      sourceTabId: tabIdRef.current,
      updatedAtUtc: updatedLead.updatedAtUtc,
    };

    try {
      liveChannelRef.current?.postMessage(payload);
      window.localStorage.setItem(`crm-lead-live:${updatedLead.id}`, JSON.stringify(payload));
      window.localStorage.removeItem(`crm-lead-live:${updatedLead.id}`);
    } catch {
      // Ignore environments that block storage or broadcast APIs.
    }
  };

  const clearWorkLogs = async () => {
    if (!showWorkLog || accessScope !== 'admin') {
      return;
    }

    if (!window.confirm(isLv ? 'Notīrīt visus darba žurnālus šim līdam?' : 'Clear all work logs for this lead?')) {
      return;
    }

    setSaveState('saving');
    setSaveError('');
    try {
      const response = await fetch(`/api/crm/leads/${encodeURIComponent(lead.id)}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({updatedAtUtc: version, workLog: []}),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to clear work logs');
      }

      if (data.lead?.updatedAtUtc) {
        setVersion(data.lead.updatedAtUtc);
      }
      if (data.lead) {
        applySavedLead(data.lead);
        broadcastLeadUpdate(data.lead);
      }

      setSaveState('saved');
    } catch (error: any) {
      setSaveState('error');
      setSaveError(error?.message || 'Failed to clear work logs');
    }
  };

  const applySavedLead = (savedLead: CrmLead) => {
    setVersion(savedLead.updatedAtUtc);
    setStatus(savedLead.status);
    setProgress(savedLead.progress);
    setActivityUpdate(savedLead.activityUpdate);
    setDealProgress(savedLead.dealProgress);
    setCustomerName(savedLead.customer);
    setTitle(savedLead.title || '');
    setProjectAddress(savedLead.projectAddress || savedLead.address);
    setProblem(savedLead.problem || '');
    setDesiredInfoRows(parseDesiredInfoRows(savedLead.clientCharacterNote || '', savedLead.estimatorData?.plannedExecutionTime || ''));
    setQuoteVariants(parseQuoteVariants(savedLead.estimatorData || createEmptyCrmEstimatorData()));
    setNote(savedLead.note);
    setEstimatorData(savedLead.estimatorData || createEmptyCrmEstimatorData());
  };

  const handleSave = async () => {
    setSaveState('saving');
    setSaveError('');
    try {
      const desiredInfo = serializeDesiredInfoRows(desiredInfoRows);
      const quoteVariantRows = serializeQuoteVariants(quoteVariants);
      const existingLegacyRows = Array.isArray(estimatorData.legacyRows)
        ? estimatorData.legacyRows.filter((row) => !QUOTE_VARIANT_ORDER.some((key) => row.label === `quote:${key}`))
        : [];
      const estimatorDataForSave = {
        ...estimatorData,
        plannedExecutionTime: desiredInfo.times,
        legacyRows: [...existingLegacyRows, ...quoteVariantRows],
      };

      const response = await fetch(`/api/crm/leads/${encodeURIComponent(lead.id)}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          updatedAtUtc: version,
          ...(isSalesScope ? {} : {customer: customerName}),
          title,
          projectAddress,
          address: projectAddress,
          problem,
          clientCharacterNote: desiredInfo.solutions,
          status,
          progress,
          activityUpdate,
          dealProgress,
          note,
          estimatorData: estimatorDataForSave,
        }),
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Save failed');
      }
      if (data.lead?.updatedAtUtc) {
        setVersion(data.lead.updatedAtUtc);
      }
      if (data.lead) {
        applySavedLead(data.lead);
        broadcastLeadUpdate(data.lead);
      }
      setSaveState('saved');
    } catch (error: any) {
      setSaveState('error');
      setSaveError(error?.message || 'Save failed');
    }
  };

  const handleCreateQuote = async () => {
    setQuoteState('creating');
    setQuoteError('');
    setQuoteAcceptUrl('');

    try {
      const response = await fetch(`/api/crm/leads/${encodeURIComponent(lead.id)}/quotes`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({amount: lead.value}),
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to create quote');
      }

      setQuoteAcceptUrl(data.quote?.acceptUrl || '');
      setQuoteState('created');
    } catch (error: any) {
      setQuoteState('error');
      setQuoteError(error?.message || 'Failed to create quote');
    }
  };

  return (
    <Section pad="sm" className="px-0 !py-0">
      <div className="mb-3 flex flex-col gap-3 border-b border-sky-100 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-500">{isLv ? 'Līda pārvaldība' : 'Lead management'}</p>
          <h2 className="mt-0 text-3xl font-bold tracking-tight text-slate-900">{displayCustomerName}</h2>
          <p className="mt-2 text-sm text-slate-500">{accessScope === 'admin' ? (isLv ? 'CMS / superadmin skats' : 'CMS / superadmin view') : (isLv ? 'CRM pārdošanas skats' : 'CRM sales view')}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={backHref} className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white px-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 sm:justify-start">
            <ArrowLeftIcon className="h-4 w-4" /> {isLv ? 'Atpakaļ uz līdiem' : 'Back to leads'}
          </Link>
          <button type="button" onClick={handleSave} className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300 sm:self-end" disabled={saveState === 'saving'}>
            <PencilSquareIcon className="h-4 w-4" /> {isLv ? 'Saglabāt izmaiņas' : 'Save changes'}
          </button>
          <button type="button" onClick={handleCreateQuote} className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60" disabled={quoteState === 'creating'}>
            {isLv ? 'Izveidot tāmes melnrakstu' : 'Create quote draft'}
          </button>
        </div>
      </div>

      {saveState !== 'idle' && (
        <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${saveState === 'saved' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : saveState === 'error' ? 'border-red-100 bg-red-50 text-red-700' : 'border-sky-100 bg-sky-50 text-sky-700'}`}>
          {saveState === 'saving' && (isLv ? 'Saglabā...' : 'Saving...')}
          {saveState === 'saved' && (isLv ? 'Izmaiņas saglabātas.' : 'Changes saved.')}
          {saveState === 'error' && (saveError || (isLv ? 'Saglabāšana neizdevās.' : 'Save failed.'))}
        </div>
      )}

      {quoteState !== 'idle' && (
        <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${quoteState === 'created' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : quoteState === 'error' ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>
          {quoteState === 'creating' && (isLv ? 'Izveido tāmes melnrakstu...' : 'Creating quote draft...')}
          {quoteState === 'created' && (
            <div className="space-y-1">
              <div>{isLv ? 'Tāmes melnraksts izveidots.' : 'Quote draft created.'}</div>
              {quoteAcceptUrl ? <div className="break-all text-xs text-emerald-700">{quoteAcceptUrl}</div> : null}
            </div>
          )}
          {quoteState === 'error' && (quoteError || (isLv ? 'Tāmes izveide neizdevās.' : 'Quote creation failed.'))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(260px,0.62fr)_minmax(0,1.38fr)] 2xl:grid-cols-[minmax(280px,0.58fr)_minmax(0,1.42fr)]">
        <Card variant="outlined" hover={false} className="!border-gray-300 !bg-gray-300 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">
            {lead.id}
            <CheckCircleIcon className="h-4 w-4" />
          </div>
          <label className="mt-3 block text-sm font-medium text-slate-700">
            {isLv ? 'Klienta vārds' : 'Client name'}
            <input
              value={displayCustomerName}
              onChange={(e) => setCustomerName(e.target.value)}
              readOnly={isSalesScope}
              disabled={isSalesScope}
              className="mt-2 h-11 w-full rounded-2xl border border-sky-200 bg-white px-4 text-base font-semibold text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <p className="mt-2 text-sm text-slate-600">{accessScope === 'admin' ? (isLv ? 'Superadmins var rediģēt klienta datus.' : 'Superadmin can edit customer data.') : (isLv ? 'Klienta profils pārdevējiem ir tikai skatāms.' : 'Customer profile is view-only for sales users.')}</p>

          <div className="mt-5 space-y-3 text-sm text-slate-700">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-300 bg-gray-200 px-4 py-3 shadow-sm">
              <PhoneIcon className="h-4 w-4 shrink-0 text-sky-500" />
              <a href={`tel:${lead.phone}`} className="text-sm font-semibold text-sky-700 hover:text-sky-800">
                {isLv ? 'Zvanīt klientam' : 'Call client'}
              </a>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-300 bg-gray-200 px-4 py-3 shadow-sm">
              <EnvelopeIcon className="h-4 w-4 shrink-0 text-sky-500" />
              <a href={`mailto:${lead.email}`} className="text-sm font-semibold text-sky-700 hover:text-sky-800">
                {isLv ? 'Rakstīt klientam' : 'Email client'}
              </a>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-gray-300 bg-gray-200 px-4 py-3 shadow-sm"><MapPinIcon className="h-4 w-4 shrink-0 text-sky-500" /> <span className="min-w-0 break-words">{displayAddress}</span></div>
          </div>

          <div className="mt-5 rounded-2xl border border-gray-300 bg-gray-200 p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{isLv ? 'Kontaktinformācija' : 'Contact details'}</p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div><span className="font-semibold text-slate-900">{isLv ? 'Atbildīgais' : 'Owner'}:</span> {lead.owner}</div>
              <div><span className="font-semibold text-slate-900">{isLv ? 'Uzņēmums' : 'Company'}:</span> {displayCompany}</div>
              <div className="flex items-center gap-2"><span className="font-semibold text-slate-900">{isLv ? 'Vērtība' : 'Value'}:</span> <span className="text-slate-900">{displayValue}</span></div>
              <div><span className="font-semibold text-slate-900">{isLv ? 'Atjaunots' : 'Updated'}:</span> {lead.updatedAt}</div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-gray-300 bg-gray-200 p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{isLv ? 'Tāmes opcijas' : 'Estimate options'}</p>
            <div className="mt-4 space-y-3">
              {quoteVariants.map((variant) => {
                const title = variant.key === 'eco' ? 'Eco option' : variant.key === 'optimal' ? 'Optimal option' : 'Lux option';
                return (
                  <div key={variant.key} className="rounded-xl border border-gray-300 bg-gray-300/80 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-900">{title}</p>
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={variant.liked}
                          onChange={(event) => setQuoteVariants((current) => current.map((item) => item.key === variant.key ? {...item, liked: event.target.checked} : item))}
                          className="h-4 w-4 rounded border-sky-300 text-sky-600 focus:ring-sky-500"
                        />
                        {isLv ? 'Klients izvēlējās' : 'Client liked'}
                      </label>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-gray-100">
                        {isLv ? 'Augšupielādēt tāmi' : 'Upload quote'}
                        <input
                          type="file"
                          className="hidden"
                          onChange={(event) => {
                            const fileName = event.target.files?.[0]?.name || '';
                            setQuoteVariants((current) => current.map((item) => item.key === variant.key ? {...item, fileName} : item));
                          }}
                        />
                      </label>
                      <span className="text-xs text-slate-600">{variant.fileName || (isLv ? 'Fails nav izvēlēts' : 'No file selected')}</span>
                    </div>

                    <label className="mt-3 flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {isLv ? 'Summa' : 'Amount'}
                      <input
                        value={variant.amount}
                        onChange={(event) => setQuoteVariants((current) => current.map((item) => item.key === variant.key ? {...item, amount: event.target.value} : item))}
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        placeholder={isLv ? 'Ievadi summu' : 'Enter amount'}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card variant="outlined" hover={false} className="border-sky-100 bg-white">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-sky-500">
              <CheckCircleIcon className="h-5 w-5" /> {isLv ? 'Projekta pamatinformācija' : 'Project general info'}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                {isLv ? 'Nosaukums' : 'Title'}
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-12 w-full rounded-xl border border-sky-200 bg-white px-4 text-sm leading-6 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  placeholder={isLv ? 'Ievadi nosaukumu' : 'Enter title'}
                />
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                {isLv ? 'Statuss' : 'Status'}
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-12 w-full min-w-0 rounded-xl border border-sky-200 bg-white px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                  {statusOptions.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
                </select>
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                {isLv ? 'Problēma' : 'Problem'}
                <textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  placeholder={isLv ? 'Ieraksti problēmu' : 'Describe the problem'}
                />
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                {isLv ? 'Project address' : 'Project address'}
                <textarea
                  value={projectAddress}
                  onChange={(e) => setProjectAddress(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  placeholder={isLv ? 'Precīza objekta adrese' : 'Exact project address'}
                />
              </label>
              <div className="sm:col-span-2 rounded-2xl border border-sky-100 bg-sky-50/40 p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-end gap-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">{isLv ? 'Vēlamais risinājums' : 'Desired solution'}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">{isLv ? 'Vēlamais laiks' : 'Desired time'}</div>
                  <div />

                  {desiredInfoRows.map((row, index) => (
                    <div key={`desired-row-${index}`} className="contents">
                      <input
                        value={row.solution}
                        onChange={(event) => {
                          const next = [...desiredInfoRows];
                          next[index] = {...next[index], solution: event.target.value};
                          setDesiredInfoRows(next);
                        }}
                        className="h-12 w-full rounded-xl border border-sky-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        placeholder={isLv ? 'Ievadi risinājumu' : 'Enter solution'}
                      />
                      <input
                        value={row.time}
                        onChange={(event) => {
                          const next = [...desiredInfoRows];
                          next[index] = {...next[index], time: event.target.value};
                          setDesiredInfoRows(next);
                        }}
                        className="h-12 w-full rounded-xl border border-sky-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        placeholder={isLv ? 'Piemēram: 2-4 nedēļas' : 'For example: 2-4 weeks'}
                      />
                      <div className="flex items-center justify-end">
                        {desiredInfoRows.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => setDesiredInfoRows(desiredInfoRows.filter((_, itemIndex) => itemIndex !== index))}
                            className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            {isLv ? 'Noņemt' : 'Remove'}
                          </button>
                        ) : (
                          <div className="h-10" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setDesiredInfoRows([...desiredInfoRows, {solution: '', time: ''}])}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-sky-200 bg-white px-3 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                  >
                    {isLv ? 'Pievienot vēl' : 'Add more'}
                  </button>
                </div>
              </div>
            </div>

          </Card>

          <Card variant="outlined" hover={false} className="border-sky-100 bg-white">
            <div className="mb-4">
              <div className="text-sm font-semibold text-sky-500">{isLv ? 'Estimator forma' : 'Estimator form'}</div>
              <p className="mt-1 text-sm text-slate-600">{isLv ? 'Fiksēti lauki ar izvēlnēm un skaitliskiem ievadlaukiem.' : 'Fixed fields with select and numeric inputs.'}</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50/40">
              {estimatorSections.map((section) => (
                <div key={section} className="border-b border-slate-200/70 last:border-b-0">
                  <div className="px-4 pt-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">{section}</div>
                  <div className="grid gap-4 px-4 py-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {CRM_ESTIMATOR_FIELD_DEFINITIONS.filter((definition) => definition.section === section && !HIDDEN_ESTIMATOR_KEYS.has(definition.key)).map((definition) => {
                      const value = estimatorData[definition.key];
                      const inputId = `estimator-${String(definition.key)}`;

                      return (
                        <label key={definition.key} htmlFor={inputId} className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                          <span>{definition.label}</span>
                          {definition.helper ? <span className="text-xs font-normal text-slate-500">{definition.helper}</span> : null}
                          {definition.type === 'select' ? (
                            <select id={inputId} value={formatEstimatorValue(value)} onChange={(event) => updateEstimatorField(definition.key, event.target.value)} className="h-12 w-full min-w-0 rounded-xl border border-sky-200 bg-white px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                              <option value="">{isLv ? 'Izvēlies' : 'Select'}</option>
                              {definition.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                          ) : definition.type === 'boolean' ? (
                            <select id={inputId} value={value === null ? '' : value ? 'true' : 'false'} onChange={(event) => updateEstimatorField(definition.key, event.target.value === 'true' ? true : event.target.value === 'false' ? false : null)} className="h-12 w-full min-w-0 rounded-xl border border-sky-200 bg-white px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                              <option value="">{isLv ? 'Izvēlies' : 'Select'}</option>
                              {CRM_ESTIMATOR_BOOLEAN_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                          ) : definition.type === 'number' ? (
                            <input id={inputId} type="number" min="0" value={value === null ? '' : String(value)} onChange={(event) => updateEstimatorField(definition.key, event.target.value ? Number(event.target.value) : null)} placeholder={definition.placeholder} className="h-12 w-full rounded-xl border border-sky-200 bg-white px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
                          ) : definition.type === 'derived' ? (
                            <input id={inputId} value={formatEstimatorValue(value)} readOnly className="h-12 w-full rounded-xl border border-sky-200 bg-white px-4 text-slate-900 outline-none" />
                          ) : definition.type === 'textarea' ? (
                            <textarea
                              id={inputId}
                              value={formatEstimatorValue(value)}
                              onChange={(event) => updateEstimatorField(definition.key, event.target.value)}
                              onInput={autoExpandTextarea}
                              rows={3}
                              placeholder={definition.placeholder}
                              className="min-h-[48px] w-full resize-y rounded-xl border border-sky-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            />
                          ) : (
                            <input id={inputId} value={formatEstimatorValue(value)} onChange={(event) => updateEstimatorField(definition.key, event.target.value)} placeholder={definition.placeholder} className="h-12 w-full rounded-xl border border-sky-200 bg-white px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {section === 'Water management' ? (
                    <div className="border-t border-slate-200/70 px-4 py-4">
                      <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                        {isLv ? 'Papildu komentāri (ūdens apsaimniekošana)' : 'Additional comments (water management)'}
                        <textarea
                          value={estimatorData.waterManagementComment}
                          onChange={(event) => updateEstimatorField('waterManagementComment', event.target.value)}
                          onInput={autoExpandTextarea}
                          rows={3}
                          placeholder={isLv ? 'Papildu piezīmes par notekām, zonām vai risinājumiem' : 'Additional notes about gutters, zones, or related details'}
                          className="min-h-[48px] w-full resize-y rounded-xl border border-sky-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        />
                      </label>
                    </div>
                  ) : null}

                  {section === 'Insulation' ? (
                    <div className="border-t border-slate-200/70 px-4 py-4">
                      <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                        {isLv ? 'Papildu komentāri (siltināšana)' : 'Additional comments (insulation)'}
                        <textarea
                          value={estimatorData.insulationComment}
                          onChange={(event) => updateEstimatorField('insulationComment', event.target.value)}
                          onInput={autoExpandTextarea}
                          rows={3}
                          placeholder={isLv ? 'Papildu piezīmes par siltinājumu' : 'Additional notes about insulation'}
                          className="min-h-[48px] w-full resize-y rounded-xl border border-sky-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        />
                      </label>
                    </div>
                  ) : null}

                  {section === 'Structure' ? (
                    <div className="border-t border-slate-200/70 px-4 py-4 space-y-4">
                      <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                        {isLv ? 'Papildu komentāri (koka fasāde / konstrukcija)' : 'Additional comments (wood facade / structure)'}
                        <textarea
                          value={estimatorData.woodFacadeComment}
                          onChange={(event) => updateEstimatorField('woodFacadeComment', event.target.value)}
                          onInput={autoExpandTextarea}
                          rows={3}
                          placeholder={isLv ? 'Papildu piezīmes par fasādes vai konstrukcijas darbiem' : 'Additional notes about facade or structure work'}
                          className="min-h-[48px] w-full resize-y rounded-xl border border-sky-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        />
                      </label>

                      <div className="rounded-none border-0 bg-transparent">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-slate-800">{isLv ? 'Skursteņu darbi' : 'Chimney work items'}</div>
                          <button
                            type="button"
                            onClick={() => updateChimneyEntries((entries) => [...entries, {workType: '', quantity: null, notes: ''}])}
                            className="inline-flex h-9 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 px-3 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                          >
                            {isLv ? 'Pievienot vēl' : 'Add more'}
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(estimatorData.chimneyEntries || []).map((entry, index) => (
                            <div key={`chimney-entry-${index}`} className="grid gap-3 rounded-xl border border-slate-200/70 bg-white p-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.45fr)_minmax(0,1fr)_auto] md:items-end">
                              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                {isLv ? 'Darba veids' : 'Work type'}
                                <select
                                  value={entry.workType}
                                  onChange={(event) => updateChimneyEntries((entries) => entries.map((item, itemIndex) => itemIndex === index ? {...item, workType: event.target.value} : item))}
                                  className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium tracking-normal text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                >
                                  <option value="">{isLv ? 'Izvēlies' : 'Select'}</option>
                                  {CHIMNEY_WORK_TYPE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {isLv ? option.labelLv : option.labelEn}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                {isLv ? 'Skaits' : 'Qty'}
                                <input
                                  type="number"
                                  min="0"
                                  value={entry.quantity === null ? '' : String(entry.quantity)}
                                  onChange={(event) => updateChimneyEntries((entries) => entries.map((item, itemIndex) => itemIndex === index ? {...item, quantity: event.target.value ? Number(event.target.value) : null} : item))}
                                  className="h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                />
                              </label>

                              <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                {isLv ? 'Piezīmes' : 'Notes'}
                                <textarea
                                  value={entry.notes}
                                  onChange={(event) => updateChimneyEntries((entries) => entries.map((item, itemIndex) => itemIndex === index ? {...item, notes: event.target.value} : item))}
                                  onInput={autoExpandTextarea}
                                  rows={1}
                                  className="min-h-[40px] w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm normal-case tracking-normal text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                                  placeholder={isLv ? 'Papildu informācija' : 'Additional details'}
                                />
                              </label>

                              <div className="flex items-end md:justify-end">
                                <button
                                  type="button"
                                  onClick={() => updateChimneyEntries((entries) => entries.filter((_, itemIndex) => itemIndex !== index))}
                                  className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                                >
                                  {isLv ? 'Noņemt' : 'Remove'}
                                </button>
                              </div>
                            </div>
                          ))}

                          {(!estimatorData.chimneyEntries || estimatorData.chimneyEntries.length === 0) ? (
                            <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-500">
                              {isLv ? 'Pievieno skursteņu darbus, ja nepieciešams.' : 'Add chimney work items when needed.'}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>

          <Card variant="outlined" hover={false} className="border-sky-100 bg-white">
            <div className="mb-4 text-sm font-semibold text-sky-500">{isLv ? 'Atvērta piezīme' : 'Open note'}</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              placeholder={isLv ? 'Ieraksti iekšējo piezīmi' : 'Write an internal note here'}
            />
          </Card>

          {showWorkLog && (
            <Card variant="outlined" hover={false} className="border-sky-100 bg-white">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-sky-500">{isLv ? 'Veiktie darbi šim līdam' : 'Work done on this lead'}</div>
                  <p className="mt-1 text-sm text-slate-600">{isLv ? 'Šī sadaļa redzama tikai CMS / superadmin.' : 'This section is visible only in CMS / superadmin.'}</p>
                </div>
                {accessScope === 'admin' ? (
                  <button
                    type="button"
                    onClick={() => void clearWorkLogs()}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
                  >
                    {isLv ? 'Notīrīt žurnālus' : 'Clear logs'}
                  </button>
                ) : null}
              </div>
              <div className="space-y-4">
                {workLog.length > 0 ? workLog.map((entry) => (
                  <div key={entry.time} className="grid gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-4 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-4">
                    <div className="text-sm font-semibold text-sky-700">{entry.time}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{entry.title}</div>
                      <div className="mt-1 text-sm text-slate-600">{entry.detail}</div>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-sky-200 bg-white px-4 py-3 text-sm text-slate-500">
                    {isLv ? 'Veikto darbu vēl nav.' : 'No work log entries yet.'}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Section>
  );
}
