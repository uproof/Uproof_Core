"use client";

import {FormEvent, useMemo, useState} from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import type {CrmLead} from '@/lib/crmMockData';

type Props = {
  locale: string;
  readOnly?: boolean;
  initialLeads?: CrmLead[];
  initialCrmUsers?: CrmUser[];
  initialActivity?: unknown[];
};
type CrmUser = {id: string; email: string; name: string; role: 'sales' | 'superadmin'; isActive: boolean};

type LeadDraft = {
  customer: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  owner: string;
  value: string;
  nextAction: string;
  note: string;
};

const initialDraft: LeadDraft = {
  customer: '',
  company: '',
  phone: '',
  email: '',
  address: '',
  owner: '',
  value: '',
  nextAction: '',
  note: '',
};

export default function LeadManagementAdminClient({locale, readOnly = false, initialLeads = [], initialCrmUsers = []}: Props) {
  const isLv = locale === 'lv';
  const [leads, setLeads] = useState<CrmLead[]>(initialLeads);
  const [loading, setLoading] = useState(initialLeads.length === 0);
  const [draft, setDraft] = useState<LeadDraft>(initialDraft);
  const [crmUsers, setCrmUsers] = useState<CrmUser[]>(initialCrmUsers);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const labels = useMemo(
    () => ({
      title: isLv ? 'Lidu parvaldiba' : 'Lead management',
      subtitle: readOnly
        ? (isLv ? 'Privilegets parskats ar lasisanas tiesibam.' : 'Privileged read-only CRM overview.')
        : (isLv ? 'Pievieno, dzes un pieskir lidus pardevejiem.' : 'Add, delete, and assign leads to sales users.'),
      add: isLv ? 'Pievienot jaunu lidu' : 'Add new lead',
      importTitle: isLv ? 'CSV imports' : 'CSV import',
      importHint: isLv ? 'Importe vairakus lidus vienlaikus no CSV faila.' : 'Import multiple leads at once from a CSV file.',
      importButton: isLv ? 'Importet CSV' : 'Import CSV',
      chooseFile: isLv ? 'Izvelies CSV failu' : 'Choose CSV file',
      delete: isLv ? 'Dzet' : 'Delete',
      customer: isLv ? 'Klienta vards' : 'Customer name',
      company: isLv ? 'Uznemums' : 'Company',
      phone: isLv ? 'Talrunis' : 'Phone',
      email: isLv ? 'E-pasts' : 'Email',
      address: isLv ? 'Adrese' : 'Address',
      owner: isLv ? 'Atbildigais' : 'Owner',
      value: isLv ? 'Darijuma vertiba' : 'Deal value',
      nextAction: isLv ? 'Nakamas solis' : 'Next action',
      note: isLv ? 'Piezime' : 'Note',
      save: isLv ? 'Saglabat lidu' : 'Save lead',
      created: isLv ? 'Lids pievienots.' : 'Lead added.',
      deleted: isLv ? 'Lids dzests.' : 'Lead deleted.',
      empty: isLv ? 'Nav lidu.' : 'No leads yet.',
      back: isLv ? 'Atpakal uz CMS' : 'Back to CMS',
      usersPanel: isLv ? 'Pardeveju parvaldiba' : 'Sales user management',
      assign: isLv ? 'Pieskirt' : 'Assign',
    }),
    [isLv, readOnly]
  );

  const loadCrmUsers = async () => {
    try {
      const response = await fetch('/api/crm/users', {cache: 'no-store'});
      const data = await response.json();
      if (data?.ok && Array.isArray(data.users)) {
        const users = data.users.filter((entry: CrmUser) => entry.role === 'sales' && entry.isActive);
        setCrmUsers(users);
      }
    } catch {
      setCrmUsers([]);
    }
  };

  const loadLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/crm/leads', {cache: 'no-store'});
      const data = await response.json();
      if (data?.ok) {
        setLeads(data.leads);
        setAssignments((current) => {
          const next = {...current};
          for (const lead of data.leads as CrmLead[]) {
            next[lead.id] = lead.assignedSalesUserId || '';
          }
          return next;
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const onAssignLead = async (leadId: string) => {
    const salesUserId = assignments[leadId];
    if (!salesUserId) {
      setMessage('Please select a CRM user first');
      return;
    }

    try {
      const response = await fetch(`/api/crm/leads/${encodeURIComponent(leadId)}/assign`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({salesUserId}),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to assign lead');
      }

      setMessage(data.duplicate
        ? (isLv ? 'Lids jau bija pieskirts šim pardevejam.' : 'Lead was already assigned to this sales user.')
        : (isLv ? 'Lids pieskirts pardevejam.' : 'Lead assigned to sales user.'));
      await loadLeads();
    } catch (error: any) {
      setMessage(error?.message || 'Failed to assign lead');
    }
  };

  const onUnassignLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/crm/leads/${encodeURIComponent(leadId)}/unassign`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to unassign lead');
      }

      setMessage(data.duplicate
        ? (isLv ? 'Lids jau bija noņemts no pardeveja.' : 'Lead was already unassigned.')
        : (isLv ? 'Lids noņemts no pardeveja.' : 'Lead unassigned from sales user.'));
      await loadLeads();
    } catch (error: any) {
      setMessage(error?.message || 'Failed to unassign lead');
    }
  };

  const onAddLead = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(draft),
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to save lead');
      }
      setDraft(initialDraft);
      setMessage(labels.created);
      await loadLeads();
    } catch (error: any) {
      setMessage(error?.message || 'Failed to save lead');
    } finally {
      setSaving(false);
    }
  };

  const onImportCsv = async (event: FormEvent) => {
    event.preventDefault();
    if (!importFile) {
      setMessage(isLv ? 'Izvelies CSV failu.' : 'Choose a CSV file.');
      return;
    }

    setImporting(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.set('file', importFile);

      const response = await fetch('/api/crm/leads/import', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to import leads');
      }

      setImportFile(null);
      await loadLeads();
      setMessage(
        `${isLv ? 'Importets' : 'Imported'} ${data.processedCount || 0} ${isLv ? 'rindas' : 'rows'} (${data.insertedCount || 0} ${isLv ? 'jauni' : 'inserted'}, ${data.updatedCount || 0} ${isLv ? 'atjaunināti' : 'updated'}, ${data.skippedCount || 0} ${isLv ? 'izlaisti' : 'skipped'})`
      );
    } catch (error: any) {
      setMessage(error?.message || 'Failed to import leads');
    } finally {
      setImporting(false);
    }
  };

  const onDeleteLead = async (id: string) => {
    setMessage('');
    try {
      const response = await fetch(`/api/crm/leads/${encodeURIComponent(id)}`, {method: 'DELETE'});
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || 'Failed to delete lead');
      setMessage(labels.deleted);
      await loadLeads();
    } catch (error: any) {
      setMessage(error?.message || 'Failed to delete lead');
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-500">{labels.title}</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{labels.subtitle}</h2>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/admin/crm/users`} className="inline-flex items-center rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">
            {labels.usersPanel}
          </Link>
          <Link href={`/${locale}/admin`} className="inline-flex items-center rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">
            {labels.back}
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        <Card variant="outlined" hover={false} className="border-sky-100 bg-sky-50">
          <p className="text-sm font-semibold text-sky-600">{readOnly ? 'Read-only' : labels.add}</p>
          <form onSubmit={onAddLead} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input value={draft.customer} onChange={(e) => setDraft((prev) => ({...prev, customer: e.target.value}))} required placeholder={labels.customer} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm" />
            <input value={draft.company} onChange={(e) => setDraft((prev) => ({...prev, company: e.target.value}))} required placeholder={labels.company} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm" />
            <input value={draft.phone} onChange={(e) => setDraft((prev) => ({...prev, phone: e.target.value}))} required placeholder={labels.phone} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm" />
            <input value={draft.email} onChange={(e) => setDraft((prev) => ({...prev, email: e.target.value}))} required type="email" placeholder={labels.email} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm" />
            <input value={draft.address} onChange={(e) => setDraft((prev) => ({...prev, address: e.target.value}))} required placeholder={labels.address} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm sm:col-span-2" />
            <input value={draft.owner} onChange={(e) => setDraft((prev) => ({...prev, owner: e.target.value}))} required placeholder={labels.owner} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm" />
            <input value={draft.value} onChange={(e) => setDraft((prev) => ({...prev, value: e.target.value}))} required placeholder={labels.value} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm" />
            <input value={draft.nextAction} onChange={(e) => setDraft((prev) => ({...prev, nextAction: e.target.value}))} required placeholder={labels.nextAction} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm sm:col-span-2" />
            <textarea value={draft.note} onChange={(e) => setDraft((prev) => ({...prev, note: e.target.value}))} placeholder={labels.note} className="min-h-[92px] rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm sm:col-span-2" />
            <div className="sm:col-span-2 flex items-center gap-3">
              <button type="submit" disabled={saving} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? '...' : labels.save}
              </button>
              {message && <p className="text-sm text-slate-600">{message}</p>}
            </div>
          </form>

          {!readOnly ? (
            <form onSubmit={onImportCsv} className="mt-6 rounded-2xl border border-sky-100 bg-white p-4">
              <p className="text-sm font-semibold text-sky-600">{labels.importTitle}</p>
              <p className="mt-1 text-xs text-slate-500">{labels.importHint}</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sky-600"
                />
                <button type="submit" disabled={importing} className="rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:opacity-60">
                  {importing ? '...' : labels.importButton}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">{isLv ? 'CSV kolonam vajag: customer, company, phone, email, address, owner, value, nextAction. id ir ieteicams idempotencei.' : 'CSV columns: customer, company, phone, email, address, owner, value, nextAction. Include id for idempotent updates.'}</p>
            </form>
          ) : null}
        </Card>

        <Card variant="outlined" hover={false} className="border-sky-100 bg-white">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-sky-600">{isLv ? 'Esosie lidi' : 'Existing leads'}</p>
            {loading && <span className="text-xs text-slate-500">Loading...</span>}
          </div>

          <div className="mt-4 space-y-3">
            {leads.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-500">{labels.empty}</div>
            ) : (
              leads.map((lead) => (
                <div key={lead.id} className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">{lead.id}</div>
                      <h3 className="mt-2 text-lg font-bold text-slate-900">{lead.customer}</h3>
                      <div className="mt-2 space-y-1 text-sm text-slate-600">
                        <div>{lead.company}</div>
                        <div>{lead.address}</div>
                        <div>{lead.phone}</div>
                        <div>{lead.email}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end">
                      <Link href={`/${locale}/admin/crm/leads/${encodeURIComponent(lead.id)}`} className="inline-flex h-10 items-center justify-center rounded-xl border border-sky-200 bg-white px-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">
                        {isLv ? 'Atvert detalas' : 'Open details'}
                      </Link>
                      <button type="button" onClick={() => onDeleteLead(lead.id)} className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">
                        {labels.delete}
                      </button>

                      <div className="flex w-full flex-col gap-2 sm:w-56">
                        <select
                          value={assignments[lead.id] || ''}
                          onChange={(e) => setAssignments((current) => ({...current, [lead.id]: e.target.value}))}
                          className="h-10 w-full rounded-xl border border-sky-200 bg-white px-2 text-sm text-slate-700"
                        >
                          <option value="">{isLv ? 'Izvelies pardeveju' : 'Select sales user'}</option>
                          {crmUsers.map((user) => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => onAssignLead(lead.id)}
                          disabled={!assignments[lead.id] || assignments[lead.id] === lead.assignedSalesUserId}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-sky-200 bg-white px-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {labels.assign}
                        </button>
                        <button
                          type="button"
                          onClick={() => void onUnassignLead(lead.id)}
                          disabled={!lead.assignedSalesUserId}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isLv ? 'Noņemt no pardeveja' : 'Unassign'}
                        </button>
                        <div className="text-xs text-slate-500">
                          {lead.assignedSalesUserId
                            ? `${isLv ? 'Pieškirts:' : 'Assigned to:'} ${crmUsers.find((user) => user.id === lead.assignedSalesUserId)?.name || lead.assignedSalesUserId}`
                            : (isLv ? 'Nav pieskirts.' : 'Not assigned.')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
