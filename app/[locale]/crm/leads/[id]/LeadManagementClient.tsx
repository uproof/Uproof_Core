'use client';

import {useState} from 'react';
import {ArrowLeftIcon, PencilSquareIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, CheckCircleIcon, LockClosedIcon, PlusIcon, TrashIcon} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import Card from '@/components/Card';
import Section from '@/components/Section';
import SensitiveValue from '@/components/crm/SensitiveValue';
import {CrmLead, CrmEstimatorRow, CrmLeadWorkLogEntry} from '@/lib/crmMockData';

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
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [progress, setProgress] = useState(lead.progress);
  const [activityUpdate, setActivityUpdate] = useState(lead.activityUpdate);
  const [dealProgress, setDealProgress] = useState(lead.dealProgress);
  const [customerName, setCustomerName] = useState(lead.customer);
  const [projectAddress, setProjectAddress] = useState(lead.projectAddress || lead.address);
  const [problem, setProblem] = useState(lead.problem || '');
  const [clientCharacterNote, setClientCharacterNote] = useState(lead.clientCharacterNote || '');
  const [note, setNote] = useState(lead.note);
  const [estimatorData, setEstimatorData] = useState<CrmEstimatorRow[]>(
    lead.estimatorData.length > 0 ? lead.estimatorData : [{label: '', measurement: '', notes: ''}]
  );
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const [showClientData, setShowClientData] = useState(false);
  const workLog: CrmLeadWorkLogEntry[] = showWorkLog ? (lead.workLog || []) : [];

  const updateEstimatorRow = (index: number, key: keyof CrmEstimatorRow, value: string) => {
    setEstimatorData((current) => current.map((row, rowIndex) => (rowIndex === index ? {...row, [key]: value} : row)));
  };

  const addEstimatorRow = () => {
    setEstimatorData((current) => [...current, {label: '', measurement: '', notes: ''}]);
  };

  const removeEstimatorRow = (index: number) => {
    setEstimatorData((current) => (current.length > 1 ? current.filter((_, rowIndex) => rowIndex !== index) : current));
  };

  const handleSave = async () => {
    setSaveState('saving');
    setSaveError('');
    try {
      const response = await fetch(`/api/crm/leads/${encodeURIComponent(lead.id)}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          updatedAtUtc: lead.updatedAtUtc,
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
      setSaveState('saved');
      router.refresh();
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
          <h2 className="mt-0 text-3xl font-bold tracking-tight text-slate-900">{customerName}</h2>
          <p className="mt-2 text-sm text-slate-500">{accessScope === 'admin' ? (isLv ? 'CMS / superadmin skats' : 'CMS / superadmin view') : (isLv ? 'CRM pārdošanas skats' : 'CRM sales view')}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href={`/${locale}/crm/leads`} className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white px-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 sm:justify-start">
            <ArrowLeftIcon className="h-4 w-4" /> {isLv ? 'Atpakaļ uz līdiem' : 'Back to leads'}
          </Link>
          {accessScope === 'admin' ? (
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
              value={customerName}
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
              {showClientData && accessScope === 'admin' ? (
                <span className="min-w-0 break-words text-slate-900">{lead.phone}</span>
              ) : (
                <SensitiveValue value={lead.phone} kind="phone" entityId={lead.id} field="phone" className="min-w-0 border-0 p-0 hover:bg-transparent" />
              )}
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
              <EnvelopeIcon className="h-4 w-4 shrink-0 text-sky-500" />
              {showClientData && accessScope === 'admin' ? (
                <span className="min-w-0 break-words text-slate-900">{lead.email}</span>
              ) : (
                <SensitiveValue value={lead.email} kind="email" entityId={lead.id} field="email" className="min-w-0 border-0 p-0 hover:bg-transparent" />
              )}
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm"><MapPinIcon className="h-4 w-4 shrink-0 text-sky-500" /> <span className="min-w-0 break-words">{lead.address}</span></div>
          </div>

          <div className="mt-5 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{isLv ? 'Kontaktinformācija' : 'Contact details'}</p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div><span className="font-semibold text-slate-900">{isLv ? 'Atbildīgais' : 'Owner'}:</span> {lead.owner}</div>
              <div><span className="font-semibold text-slate-900">{isLv ? 'Uzņēmums' : 'Company'}:</span> {lead.company}</div>
              <div className="flex items-center gap-2"><span className="font-semibold text-slate-900">{isLv ? 'Vērtība' : 'Value'}:</span> {showClientData && accessScope === 'admin' ? <span className="text-slate-900">{lead.value}</span> : <SensitiveValue value={lead.value} kind="amount" entityId={lead.id} field="value" className="border-0 p-0 hover:bg-transparent" />}</div>
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
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-sky-500">{isLv ? 'Estimator DATA' : 'Estimator data'}</div>
                <p className="mt-1 text-sm text-slate-600">{isLv ? 'Tabula klienta mērījumiem un aprēķinu piezīmēm.' : 'Table for client measurements and estimate notes.'}</p>
              </div>
              <button type="button" onClick={addEstimatorRow} className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">
                <PlusIcon className="h-4 w-4" /> {isLv ? 'Pievienot rindu' : 'Add row'}
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-sky-100">
              <table className="min-w-full divide-y divide-sky-100 text-left text-sm">
                <thead className="bg-sky-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{isLv ? 'Nosaukums' : 'Item'}</th>
                    <th className="px-4 py-3 font-semibold">{isLv ? 'Mērījums' : 'Measurement'}</th>
                    <th className="px-4 py-3 font-semibold">{isLv ? 'Piezīmes' : 'Notes'}</th>
                    <th className="px-4 py-3 font-semibold">{isLv ? 'Darbība' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-100 bg-white">
                  {estimatorData.map((row, index) => (
                    <tr key={`${row.label}-${index}`}>
                      <td className="px-4 py-3 align-top"><input value={row.label} onChange={(e) => updateEstimatorRow(index, 'label', e.target.value)} className="w-full rounded-xl border border-sky-200 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" placeholder={isLv ? 'Jumta garums' : 'Roof length'} /></td>
                      <td className="px-4 py-3 align-top"><input value={row.measurement} onChange={(e) => updateEstimatorRow(index, 'measurement', e.target.value)} className="w-full rounded-xl border border-sky-200 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" placeholder={isLv ? '18.4 m' : '18.4 m'} /></td>
                      <td className="px-4 py-3 align-top"><input value={row.notes} onChange={(e) => updateEstimatorRow(index, 'notes', e.target.value)} className="w-full rounded-xl border border-sky-200 px-3 py-2 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100" placeholder={isLv ? 'Piemēram: no klienta foto' : 'Example: from client photos'} /></td>
                      <td className="px-4 py-3 align-top">
                        <button type="button" onClick={() => removeEstimatorRow(index)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                          <TrashIcon className="h-4 w-4" /> {isLv ? 'Dzēst' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
