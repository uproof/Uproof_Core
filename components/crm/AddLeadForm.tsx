"use client";

import {useRouter} from 'next/navigation';
import {FormEvent, useMemo, useState} from 'react';

type Props = {
  locale: string;
};

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

export default function AddLeadForm({locale}: Props) {
  const isLv = locale === 'lv';
  const router = useRouter();
  const [draft, setDraft] = useState<LeadDraft>(initialDraft);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const labels = useMemo(
    () => ({
      title: isLv ? 'Pievienot jaunu līdu' : 'Add new lead',
      subtitle: isLv ? 'Manuāla ievade superadminam.' : 'Manual lead entry for superadmin.',
      customer: isLv ? 'Klienta vārds' : 'Customer name',
      company: isLv ? 'Uzņēmums' : 'Company',
      phone: isLv ? 'Tālrunis' : 'Phone',
      email: isLv ? 'E-pasts' : 'Email',
      address: isLv ? 'Adrese' : 'Address',
      owner: isLv ? 'Atbildīgais' : 'Owner',
      value: isLv ? 'Darījuma vērtība' : 'Deal value',
      nextAction: isLv ? 'Nākamais solis' : 'Next action',
      note: isLv ? 'Piezīme' : 'Note',
      button: isLv ? 'Saglabāt līdu' : 'Save lead',
      success: isLv ? 'Līds veiksmīgi pievienots.' : 'Lead added successfully.',
    }),
    [isLv]
  );

  const onSubmit = async (event: FormEvent) => {
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
      setMessage(labels.success);
      router.refresh();
    } catch (error: any) {
      setMessage(error?.message || 'Failed to save lead');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-sky-100 bg-sky-50 p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">{labels.title}</p>
        <p className="mt-1 text-sm text-slate-600">{labels.subtitle}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input value={draft.customer} onChange={(e) => setDraft((prev) => ({...prev, customer: e.target.value}))} required placeholder={labels.customer} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm" />
        <input value={draft.company} onChange={(e) => setDraft((prev) => ({...prev, company: e.target.value}))} required placeholder={labels.company} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm" />
        <input value={draft.phone} onChange={(e) => setDraft((prev) => ({...prev, phone: e.target.value}))} required placeholder={labels.phone} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm" />
        <input value={draft.email} onChange={(e) => setDraft((prev) => ({...prev, email: e.target.value}))} required type="email" placeholder={labels.email} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm" />
        <input value={draft.address} onChange={(e) => setDraft((prev) => ({...prev, address: e.target.value}))} required placeholder={labels.address} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm sm:col-span-2" />
        <input value={draft.owner} onChange={(e) => setDraft((prev) => ({...prev, owner: e.target.value}))} required placeholder={labels.owner} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm" />
        <input value={draft.value} onChange={(e) => setDraft((prev) => ({...prev, value: e.target.value}))} required placeholder={labels.value} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm" />
        <input value={draft.nextAction} onChange={(e) => setDraft((prev) => ({...prev, nextAction: e.target.value}))} required placeholder={labels.nextAction} className="h-11 rounded-xl border border-sky-200 bg-white px-3 text-sm sm:col-span-2" />
        <textarea value={draft.note} onChange={(e) => setDraft((prev) => ({...prev, note: e.target.value}))} placeholder={labels.note} className="min-h-[88px] rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm sm:col-span-2" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? '...' : labels.button}
        </button>
        {message && <p className="text-sm text-slate-600">{message}</p>}
      </div>
    </form>
  );
}
