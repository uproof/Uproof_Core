"use client";

import {useMemo, useState, type ReactNode} from 'react';
import Card from '@/components/Card';
import Section from '@/components/Section';
import {maskEmail, maskPhone, maskText} from '@/lib/sensitiveMask';
import type {CrmCustomer} from '@/lib/crmMockData';

type Props = {
  locale: string;
  customers: CrmCustomer[];
  isSalesView: boolean;
  watermark: ReactNode;
};

type CustomerSortKey = 'updated-desc' | 'updated-asc' | 'name-asc' | 'name-desc' | 'company-asc' | 'company-desc' | 'leads-asc' | 'leads-desc' | 'contact-asc' | 'contact-desc';

function compareText(left: string, right: string) {
  return left.localeCompare(right, undefined, {numeric: true, sensitivity: 'base'});
}

function getCustomerSearchText(customer: CrmCustomer) {
  return [customer.id, customer.name, customer.company, customer.phone, customer.email, customer.lastContact, customer.leads].join(' ');
}

function compareContact(left: string, right: string) {
  return compareText(left || '', right || '');
}

export default function CrmCustomersClient({locale, customers, isSalesView, watermark}: Props) {
  const isLv = locale === 'lv';
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<CustomerSortKey>('updated-desc');

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return customers
      .filter((customer) => !normalizedQuery || getCustomerSearchText(customer).toLowerCase().includes(normalizedQuery))
      .sort((left, right) => {
        switch (sortKey) {
          case 'updated-asc':
          case 'updated-desc':
            return compareContact(sortKey === 'updated-asc' ? left.lastContact : right.lastContact, sortKey === 'updated-asc' ? right.lastContact : left.lastContact);
          case 'name-asc':
            return compareText(left.name, right.name);
          case 'name-desc':
            return compareText(right.name, left.name);
          case 'company-asc':
            return compareText(left.company, right.company);
          case 'company-desc':
            return compareText(right.company, left.company);
          case 'leads-asc':
            return left.leads - right.leads || compareText(left.name, right.name);
          case 'leads-desc':
            return right.leads - left.leads || compareText(right.name, left.name);
          case 'contact-asc':
            return compareContact(left.lastContact, right.lastContact);
          case 'contact-desc':
            return compareContact(right.lastContact, left.lastContact);
          default:
            return 0;
        }
      });
  }, [customers, query, sortKey]);

  return (
    <Section pad="sm" className="relative overflow-hidden px-0 !py-0">
      {watermark}
      <div className="relative z-10">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-600">{isLv ? 'Klienti' : 'Customers'}</p>
            <p className="mt-1 max-w-3xl text-sm text-gray-600">{isLv ? 'Meklē pēc klienta, uzņēmuma, kontakta vai saistīto līdu skaita.' : 'Search by customer, company, contact, or related lead count.'}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex min-w-[18rem] flex-1 items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">{isLv ? 'Meklēt' : 'Search'}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={isLv ? 'Vārds, uzņēmums, tālrunis...' : 'Name, company, phone...'}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>

            <label className="flex items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">{isLv ? 'Kārtot' : 'Sort'}</span>
              <select value={sortKey} onChange={(event) => setSortKey(event.target.value as CustomerSortKey)} className="bg-transparent text-sm text-slate-900 outline-none">
                <option value="updated-desc">{isLv ? 'Jaunākie pirmie' : 'Newest first'}</option>
                <option value="updated-asc">{isLv ? 'Vecākie pirmie' : 'Oldest first'}</option>
                <option value="name-asc">{isLv ? 'Vārds A-Z' : 'Name A-Z'}</option>
                <option value="name-desc">{isLv ? 'Vārds Z-A' : 'Name Z-A'}</option>
                <option value="company-asc">{isLv ? 'Uzņēmums A-Z' : 'Company A-Z'}</option>
                <option value="company-desc">{isLv ? 'Uzņēmums Z-A' : 'Company Z-A'}</option>
                <option value="leads-desc">{isLv ? 'Līdi (vairāk)' : 'Leads high to low'}</option>
                <option value="leads-asc">{isLv ? 'Līdi (mazāk)' : 'Leads low to high'}</option>
                <option value="contact-desc">{isLv ? 'Kontakts jaunākais' : 'Contact latest'}</option>
                <option value="contact-asc">{isLv ? 'Kontakts vecākais' : 'Contact oldest'}</option>
              </select>
            </label>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} variant="outlined" hover={false} className="relative overflow-hidden">
              <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(2,132,199,0.14),transparent_40%)]" />
              </div>
              <div className="relative z-10">
                <div className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-600">
                  {isSalesView ? maskText(customer.id) : customer.id}
                </div>
                <h3 className="mt-2 text-base font-semibold text-gray-900">
                  {isSalesView ? maskText(customer.name) : customer.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {isSalesView ? maskText(customer.company) : customer.company}
                </p>

                <div className="mt-5 space-y-2 text-sm text-gray-600">
                  <div>{isSalesView ? maskPhone(customer.phone) : customer.phone}</div>
                  <div>{isSalesView ? maskEmail(customer.email) : customer.email}</div>
                  <div>{isSalesView ? maskText(customer.lastContact) : customer.lastContact}</div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm">
                  <span className="text-gray-600">{isLv ? 'Saistītie līdi' : 'Related leads'}</span>
                  <span className="font-semibold text-gray-900">{customer.leads}</span>
                </div>
              </div>
            </Card>
          ))}

          {filteredCustomers.length === 0 ? <Card variant="outlined" hover={false} className="border-dashed border-sky-200 bg-white text-slate-600">{isLv ? 'Nav klientu, kas atbilst filtram.' : 'No customers match the current search.'}</Card> : null}
        </div>
      </div>
    </Section>
  );
}