'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowLeftIcon, PencilSquareIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, CheckCircleIcon, LockClosedIcon} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import Card from '@/components/Card';
import Section from '@/components/Section';
import SensitiveValue from '@/components/crm/SensitiveValue';
import {CrmLead, CrmLeadWorkLogEntry} from '@/lib/crmMockData';
import {CRM_ESTIMATOR_BOOLEAN_OPTIONS, CRM_ESTIMATOR_FIELD_DEFINITIONS, CRM_ESTIMATOR_FIELD_SECTIONS, createEmptyCrmEstimatorData, formatEstimatorValue} from '@/lib/crmEstimator';
import {maskText} from '@/lib/sensitiveMask';

const statusOptions = ['NEW', 'CONTACTED', 'INSPECTION_SCHEDULED', 'INSPECTION_COMPLETED', 'ESTIMATING', 'QUOTE_SENT', 'WON', 'LOST', 'PROJECT_STARTED', 'COMPLETED', 'CANCELLED'];
const progressOptions = ['new', 'reached', 'in progress', 'cancelled', 'won'];
const activityOptions = ['First call', '2nd call', '3rd call', 'Message', 'Email'];
const dealOptions = ['Negotiation', 'Signed', 'Lost', 'Won', 'Cancelled'];

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
  const canRevealClientData = accessScope === 'admin' || accessScope === 'sales';
  const router = useRouter();
  const tabIdRef = useRef(typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
  const liveChannelRef = useRef<BroadcastChannel | null>(null);
  const [version, setVersion] = useState(lead.updatedAtUtc);
  const [status, setStatus] = useState(lead.status);
  const [progress, setProgress] = useState(lead.progress);
  const [activityUpdate, setActivityUpdate] = useState(lead.activityUpdate);
  const [dealProgress, setDealProgress] = useState(lead.dealProgress);
  const [customerName, setCustomerName] = useState(lead.customer);
  const [projectAddress, setProjectAddress] = useState(lead.projectAddress || lead.address);
  const [problem, setProblem] = useState(lead.problem || '');
  const [clientCharacterNote, setClientCharacterNote] = useState(lead.clientCharacterNote || '');
  const [note, setNote] = useState(lead.note);
  const [estimatorData, setEstimatorData] = useState(lead.estimatorData || createEmptyCrmEstimatorData());
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const [showClientData, setShowClientData] = useState(false);
  const workLog: CrmLeadWorkLogEntry[] = showWorkLog ? (lead.workLog || []) : [];
  const clientDataVisible = showClientData && canRevealClientData;
  const displayCustomerName = accessScope === 'admin' ? customerName : (clientDataVisible ? customerName : maskText(customerName));
  const displayPhone = accessScope === 'admin' ? lead.phone : (clientDataVisible ? lead.phone : '');
  const displayEmail = accessScope === 'admin' ? lead.email : (clientDataVisible ? lead.email : '');
  const displayAddress = accessScope === 'admin' ? lead.address : (clientDataVisible ? lead.address : maskText(lead.address));
  const displayCompany = accessScope === 'admin' ? lead.company : (clientDataVisible ? lead.company : maskText(lead.company));
  const displayValue = accessScope === 'admin' ? lead.value : (clientDataVisible ? lead.value : maskText(lead.value));

  const estimatorSections = useMemo(() => CRM_ESTIMATOR_FIELD_SECTIONS, []);

  useEffect(() => {
    setVersion(lead.updatedAtUtc);
    setStatus(lead.status);
    setProgress(lead.progress);
    setActivityUpdate(lead.activityUpdate);
    setDealProgress(lead.dealProgress);
    setCustomerName(lead.customer);
    setProjectAddress(lead.projectAddress || lead.address);
    setProblem(lead.problem || '');
    setClientCharacterNote(lead.clientCharacterNote || '');
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
    lead.updatedAtUtc,
  ]);

  const updateEstimatorField = <K extends keyof typeof estimatorData>(key: K, value: (typeof estimatorData)[K]) => {
    setEstimatorData((current) => ({...current, [key]: value}));
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
    setProjectAddress(savedLead.projectAddress || savedLead.address);
    setProblem(savedLead.problem || '');
    setClientCharacterNote(savedLead.clientCharacterNote || '');
    setNote(savedLead.note);
    setEstimatorData(savedLead.estimatorData || createEmptyCrmEstimatorData());
  };

  const handleSave = async () => {
    setSaveState('saving');
    setSaveError('');
    try {
      const response = await fetch(`/api/crm/leads/${encodeURIComponent(lead.id)}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          updatedAtUtc: version,
          ...(isSalesScope ? {} : {customer: customerName}),
          projectAddress,
          address: projectAddress,
          problem,
          clientCharacterNote,
          status,
          progress,
          activityUpdate,
          dealProgress,
          note,
          estimatorData,
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

  return (
    <Section pad="sm" className="px-0 !py-0">
      <div className="mb-3 flex flex-col gap-3 border-b border-sky-100 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-500">{isLv ? 'Līda pārvaldība' : 'Lead management'}</p>
          <h2 className="mt-0 text-3xl font-bold tracking-tight text-slate-900">{displayCustomerName}</h2>
          <p className="mt-2 text-sm text-slate-500">{accessScope === 'admin' ? (isLv ? 'CMS / superadmin skats' : 'CMS / superadmin view') : (isLv ? 'CRM pārdošanas skats' : 'CRM sales view')}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/crm/leads`} className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white px-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 sm:justify-start">
            <ArrowLeftIcon className="h-4 w-4" /> {isLv ? 'Atpakaļ uz līdiem' : 'Back to leads'}
          </Link>
          {canRevealClientData ? (
            <button
              type="button"
              onClick={() => setShowClientData((current) => !current)}
              className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white px-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 sm:justify-start"
            >
              <LockClosedIcon className="h-4 w-4" />
              {showClientData ? (isLv ? 'Paslēpt klienta datus' : 'Hide client data') : (isLv ? 'Skatīt klienta datus' : 'View client data')}
            </button>
          ) : null}
          <button type="button" onClick={handleSave} className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300 sm:self-end" disabled={saveState === 'saving'}>
            <PencilSquareIcon className="h-4 w-4" /> {isLv ? 'Saglabāt izmaiņas' : 'Save changes'}
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

      <div className="grid gap-6 xl:grid-cols-[minmax(260px,0.62fr)_minmax(0,1.38fr)] 2xl:grid-cols-[minmax(280px,0.58fr)_minmax(0,1.42fr)]">
        <Card variant="outlined" hover={false} className="border-sky-100 bg-sky-50 px-4 py-4 sm:px-5 sm:py-5">
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
            <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
              <PhoneIcon className="h-4 w-4 shrink-0 text-sky-500" />
              {clientDataVisible ? (
                <span className="min-w-0 break-words text-slate-900">{displayPhone}</span>
              ) : (
                <SensitiveValue value={lead.phone} kind="phone" className="min-w-0 border-0 p-0 hover:bg-transparent" />
              )}
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
              <EnvelopeIcon className="h-4 w-4 shrink-0 text-sky-500" />
              {clientDataVisible ? (
                <span className="min-w-0 break-words text-slate-900">{displayEmail}</span>
              ) : (
                <SensitiveValue value={lead.email} kind="email" className="min-w-0 border-0 p-0 hover:bg-transparent" />
              )}
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm"><MapPinIcon className="h-4 w-4 shrink-0 text-sky-500" /> <span className="min-w-0 break-words">{displayAddress}</span></div>
          </div>

          <div className="mt-5 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{isLv ? 'Kontaktinformācija' : 'Contact details'}</p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div><span className="font-semibold text-slate-900">{isLv ? 'Atbildīgais' : 'Owner'}:</span> {lead.owner}</div>
              <div><span className="font-semibold text-slate-900">{isLv ? 'Uzņēmums' : 'Company'}:</span> {displayCompany}</div>
              <div className="flex items-center gap-2"><span className="font-semibold text-slate-900">{isLv ? 'Vērtība' : 'Value'}:</span> {clientDataVisible ? <span className="text-slate-900">{displayValue}</span> : <SensitiveValue value={lead.value} kind="amount" className="border-0 p-0 hover:bg-transparent" />}</div>
              <div><span className="font-semibold text-slate-900">{isLv ? 'Atjaunots' : 'Updated'}:</span> {lead.updatedAt}</div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">{isLv ? 'Pielikumi' : 'Attachments'}</p>
              <label className="inline-flex cursor-pointer items-center rounded-xl border border-sky-200 bg-white px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-50">
                {isLv ? 'Pievienot failu' : 'Attach file'}
                <input type="file" className="hidden" />
              </label>
            </div>

            <div className="mt-4 space-y-2">
              {signedAttachments.length > 0 ? (
                signedAttachments.map((attachment) => (
                  <a key={attachment.name} href={attachment.url} className="flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700 transition hover:bg-sky-100">
                    <span>{attachment.name}</span>
                    <span className="text-xs font-semibold text-sky-700">{isLv ? 'Lejupielādēt' : 'Download'}</span>
                  </a>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-sky-200 bg-white px-4 py-3 text-sm text-slate-500">
                  {isLv ? 'Pielikumu vēl nav.' : 'No attachments yet.'}
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card variant="outlined" hover={false} className="border-sky-100 bg-white">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-sky-500">
              <CheckCircleIcon className="h-5 w-5" /> {isLv ? 'Līda plūsma' : 'Lead workflow'}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
                {isLv ? 'Client character note' : 'Client character note'}
                <textarea
                  value={clientCharacterNote}
                  onChange={(e) => setClientCharacterNote(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-sky-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  placeholder={isLv ? 'Piemērs: atvērts, steidzīgs, grib zināt cenu' : 'Example: open, in a rush, wants to know the price'}
                />
              </label>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4 items-start">
              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                {isLv ? 'Statuss' : 'Status'}
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-12 w-full min-w-0 rounded-xl border border-sky-200 bg-white px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                  {statusOptions.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
                </select>
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                {isLv ? 'Progress' : 'Progress'}
                <select value={progress} onChange={(e) => setProgress(e.target.value)} className="h-12 w-full min-w-0 rounded-xl border border-sky-200 bg-white px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                  {progressOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                {isLv ? 'Aktivitāte' : 'Activity'}
                <select value={activityUpdate} onChange={(e) => setActivityUpdate(e.target.value)} className="h-12 w-full min-w-0 rounded-xl border border-sky-200 bg-white px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                  {activityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700">
                {isLv ? 'Darījums' : 'Deal'}
                <select value={dealProgress} onChange={(e) => setDealProgress(e.target.value)} className="h-12 w-full min-w-0 rounded-xl border border-sky-200 bg-white px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100">
                  {dealOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            </div>
          </Card>

          <Card variant="outlined" hover={false} className="border-sky-100 bg-white">
            <div className="mb-4">
              <div className="text-sm font-semibold text-sky-500">{isLv ? 'Estimator forma' : 'Estimator form'}</div>
              <p className="mt-1 text-sm text-slate-600">{isLv ? 'Fiksēti lauki ar izvēlnēm un skaitliskiem ievadlaukiem.' : 'Fixed fields with select and numeric inputs.'}</p>
            </div>

            <div className="space-y-6">
              {estimatorSections.map((section) => (
                <div key={section} className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
                  <div className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">{section}</div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {CRM_ESTIMATOR_FIELD_DEFINITIONS.filter((definition) => definition.section === section).map((definition) => {
                      const value = estimatorData[definition.key];
                      const inputId = `estimator-${String(definition.key)}`;

                      return (
                        <label key={definition.key} htmlFor={inputId} className="flex min-w-0 flex-col gap-2 text-sm font-medium text-slate-700 sm:col-span-1">
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
                          ) : (
                            <input id={inputId} value={formatEstimatorValue(value)} onChange={(event) => updateEstimatorField(definition.key, event.target.value)} placeholder={definition.placeholder} className="h-12 w-full rounded-xl border border-sky-200 bg-white px-4 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100" />
                          )}
                        </label>
                      );
                    })}
                  </div>
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
