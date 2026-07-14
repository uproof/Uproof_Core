"use client";

import {useMemo, useRef, useState} from 'react';
import Card from '@/components/Card';
import Section from '@/components/Section';
import SensitiveValue from '@/components/crm/SensitiveValue';
import type {CrmQuote} from '@/lib/crmMockData';

type Props = {
  locale: string;
  quotes: CrmQuote[];
  canExportAllQuotes: boolean;
  canDownloadQuotePdf: boolean;
};

export default function CrmQuotesClient({locale, quotes, canExportAllQuotes, canDownloadQuotePdf}: Props) {
  const isLv = locale === 'lv';
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('No file selected');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<'updated-desc' | 'updated-asc' | 'identifier-asc' | 'identifier-desc' | 'customer-asc' | 'customer-desc' | 'amount-asc' | 'amount-desc' | 'status-asc' | 'status-desc'>('updated-desc');

  const filteredQuotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const compareText = (left: string, right: string) => left.localeCompare(right, undefined, {numeric: true, sensitivity: 'base'});
    const parseMoney = (value: string) => {
      const numeric = Number.parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
      return Number.isFinite(numeric) ? numeric : 0;
    };

    return quotes
      .filter((quote) => {
        if (!normalizedQuery) return true;
        return [quote.id, quote.customer, quote.status, quote.amount, quote.sentAt, quote.owner].join(' ').toLowerCase().includes(normalizedQuery);
      })
      .sort((left, right) => {
        switch (sortKey) {
          case 'updated-asc':
            return compareText(left.sentAt, right.sentAt);
          case 'updated-desc':
            return compareText(right.sentAt, left.sentAt);
          case 'identifier-asc':
            return compareText(left.id, right.id);
          case 'identifier-desc':
            return compareText(right.id, left.id);
          case 'customer-asc':
            return compareText(left.customer, right.customer);
          case 'customer-desc':
            return compareText(right.customer, left.customer);
          case 'amount-asc':
            return parseMoney(left.amount) - parseMoney(right.amount) || compareText(left.amount, right.amount);
          case 'amount-desc':
            return parseMoney(right.amount) - parseMoney(left.amount) || compareText(right.amount, left.amount);
          case 'status-asc':
            return compareText(left.status, right.status);
          case 'status-desc':
            return compareText(right.status, left.status);
          default:
            return 0;
        }
      });
  }, [quotes, query, sortKey]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <Section pad="sm" className="px-0 !py-0">
      <div className="mb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-600">{isLv ? 'Tāmes' : 'Quotes'}</p>
            <p className="mt-1 text-sm text-slate-500">{isLv ? 'Meklē pēc identifikatora, klienta, statusa vai summas.' : 'Search by identifier, customer, status, amount, or owner.'}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex min-w-[18rem] flex-1 items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">{isLv ? 'Meklēt' : 'Search'}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={isLv ? 'Q-2001, summa, klients...' : 'Q-2001, amount, customer...'}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>

            <label className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">{isLv ? 'Kārtot' : 'Sort'}</span>
              <select value={sortKey} onChange={(event) => setSortKey(event.target.value as typeof sortKey)} className="bg-transparent text-sm text-slate-900 outline-none">
                <option value="updated-desc">{isLv ? 'Jaunākie pirmie' : 'Newest first'}</option>
                <option value="updated-asc">{isLv ? 'Vecākie pirmie' : 'Oldest first'}</option>
                <option value="identifier-asc">{isLv ? 'ID A-Z' : 'ID A-Z'}</option>
                <option value="identifier-desc">{isLv ? 'ID Z-A' : 'ID Z-A'}</option>
                <option value="customer-asc">{isLv ? 'Klients A-Z' : 'Customer A-Z'}</option>
                <option value="customer-desc">{isLv ? 'Klients Z-A' : 'Customer Z-A'}</option>
                <option value="amount-desc">{isLv ? 'Summa no lielākās' : 'Amount high to low'}</option>
                <option value="amount-asc">{isLv ? 'Summa no mazākās' : 'Amount low to high'}</option>
                <option value="status-asc">{isLv ? 'Statuss A-Z' : 'Status A-Z'}</option>
                <option value="status-desc">{isLv ? 'Statuss Z-A' : 'Status Z-A'}</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                if (canExportAllQuotes) {
                  window.location.href = '/api/crm/export';
                }
              }}
              disabled={!canExportAllQuotes}
              className="rounded-xl border border-sky-200 bg-white px-4 py-2 text-xs font-semibold text-sky-700 transition enabled:hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLv ? 'Eksportēt visas tāmes (CSV)' : 'Export all quotes (CSV)'}
            </button>
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          {filteredQuotes.map((quote) => (
            <Card key={quote.id} variant="outlined" hover={false}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">{quote.id}</div>
                  <h3 className="mt-2 text-xl font-bold text-gray-900">{quote.customer}</h3>
                  <p className="mt-1 text-sm text-gray-600">{isLv ? 'Pievienoja' : 'Added by'} {quote.owner}</p>

          {filteredQuotes.length === 0 ? (
            <Card variant="outlined" hover={false} className="border-dashed border-sky-200 bg-white text-slate-600">
              {isLv ? 'Nav tāmes, kas atbilst filtram.' : 'No quotes match the current search.'}
            </Card>
          ) : null}
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3 text-right">
                  <div className="text-xs uppercase tracking-[0.2em] text-gray-500">{isLv ? 'Statuss' : 'Status'}</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">{quote.status}</div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-2">{isLv ? 'Summa' : 'Amount'}: <SensitiveValue value={quote.amount} kind="amount" className="border-0 p-0 hover:bg-transparent" /></span>
                <span>{isLv ? 'Nosūtīts' : 'Sent'}: {quote.sentAt}</span>
                {canDownloadQuotePdf ? (
                  <a
                    href={`/api/crm/quotes/${encodeURIComponent(quote.id)}/pdf`}
                    className="ml-auto inline-flex items-center rounded-lg border border-sky-200 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
                  >
                    {isLv ? 'Lejupielādēt marķētu PDF' : 'Download stamped PDF'}
                  </a>
                ) : null}
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
