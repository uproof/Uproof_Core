"use client";

import {useEffect, useRef, useState} from 'react';
import Card from '@/components/Card';
import Section from '@/components/Section';
import SensitiveValue from '@/components/crm/SensitiveValue';
import type {CrmQuote} from '@/lib/crmMockData';

type Props = {
  locale: string;
  quotes: CrmQuote[];
};

export default function CrmQuotesClient({locale, quotes}: Props) {
  const isLv = locale === 'lv';
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('No file selected');
  const [role, setRole] = useState<'superadmin' | 'sales'>('sales');

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch('/api/crm/session', {cache: 'no-store'});
        const data = await response.json();
        if (data?.ok && (data.role === 'superadmin' || data.role === 'sales')) {
          setRole(data.role);
        }
      } catch {
        // Keep sales default on failure to avoid exposing privileged actions.
      }
    };

    loadSession();
  }, []);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <Section pad="sm" className="px-0 !py-0">
      <div className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-600">{isLv ? 'Tāmes' : 'Quotes'}</p>
          <button
            type="button"
            onClick={() => {
              if (role === 'superadmin') {
                window.location.href = '/api/crm/export';
              }
            }}
            disabled={role !== 'superadmin'}
            className="rounded-xl border border-sky-200 bg-white px-4 py-2 text-xs font-semibold text-sky-700 transition enabled:hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLv ? 'Eksportēt visas tāmes (CSV)' : 'Export all quotes (CSV)'}
          </button>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id} variant="outlined" hover={false}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">{quote.id}</div>
                  <h3 className="mt-2 text-xl font-bold text-gray-900">{quote.customer}</h3>
                  <p className="mt-1 text-sm text-gray-600">{isLv ? 'Pievienoja' : 'Added by'} {quote.owner}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3 text-right">
                  <div className="text-xs uppercase tracking-[0.2em] text-gray-500">{isLv ? 'Statuss' : 'Status'}</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{quote.status}</div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-2">{isLv ? 'Summa' : 'Amount'}: <SensitiveValue value={quote.amount} kind="amount" entityId={quote.id} field="amount" className="border-0 p-0 hover:bg-transparent" /></span>
                <span>{isLv ? 'Nosūtīts' : 'Sent'}: {quote.sentAt}</span>
                <a
                  href={`/api/crm/quotes/${encodeURIComponent(quote.id)}/pdf`}
                  className="ml-auto inline-flex items-center rounded-lg border border-sky-200 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
                >
                  {isLv ? 'Lejupielādēt marķētu PDF' : 'Download stamped PDF'}
                </a>
              </div>
            </Card>
          ))}
        </div>

        <Card variant="outlined" hover={false} className="border-sky-100 bg-sky-50">
          <p className="text-sm font-semibold text-sky-600">{isLv ? 'Manuāla tāmes ievade' : 'Manual quote entry'}</p>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">{isLv ? 'Pārdevējs manuāli pievieno vai augšupielādē tāmes failu.' : 'Sales adds or uploads the quote file manually.'}</div>
            <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">{isLv ? 'Katra tāme paliek sasaistīta ar līdu un klientu.' : 'Each quote stays linked to the lead and customer.'}</div>
            <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">{isLv ? 'Izmanto statusus: nosūtīta, parakstīta, zaudēta vai atcelta.' : 'Use the quote status for sent, signed, lost, or cancelled.'}</div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setSelectedFileName(file ? file.name : 'No file selected');
              }}
            />
            <button type="button" onClick={openFilePicker} className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600">
              {isLv ? 'Pievienot / augšupielādēt tāmi' : 'Add / upload quote'}
            </button>
            <div className="rounded-2xl border border-sky-100 bg-white px-4 py-3 text-xs font-medium text-slate-600 shadow-sm">
              {selectedFileName === 'No file selected' ? (isLv ? 'Fails nav izvēlēts' : selectedFileName) : selectedFileName}
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}
