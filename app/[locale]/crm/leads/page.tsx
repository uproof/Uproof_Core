import Card from '@/components/Card';
import Section from '@/components/Section';
import SensitiveValue from '@/components/crm/SensitiveValue';
import {getCrmLeads} from '@/lib/crmLeadsStore';
import Link from 'next/link';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';

type Props = {params: Promise<{locale: string}>};

export default async function CrmLeadsPage({params}: Props) {
  const {locale} = await params;
  const session = await getAdminSession();
  let leads = await getCrmLeads();
  if (session?.role === 'sales') {
    const salesUser = await getCrmUserByEmail(session.email);
    leads = salesUser ? await getCrmLeads({assignedSalesUserId: salesUser.id}) : [];
  }
  const isLv = locale === 'lv';
  const openLeadsCount = leads.filter((lead) => !['WON', 'LOST', 'COMPLETED', 'CANCELLED'].includes(lead.status)).length;
  const scheduledInspectionsCount = leads.filter((lead) => lead.status === 'INSPECTION_SCHEDULED').length;
  return (
    <Section pad="sm" className="px-0 !py-0">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-500">{isLv ? 'Līdu saraksts' : 'Lead list'}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card variant="outlined" hover={false} className="border-sky-100 bg-sky-50">
          <p className="text-sm uppercase tracking-[0.22em] text-sky-500">{isLv ? 'Pārskats' : 'Board summary'}</p>
          <h3 className="mt-3 text-2xl font-bold text-slate-900">{isLv ? 'Līdu plūsma' : 'Lead workflow'}</h3>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
              <div className="text-2xl font-bold text-slate-900">{openLeadsCount}</div>
              {isLv ? 'Atvērti līdi' : 'Open leads'}
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
              <div className="text-2xl font-bold text-slate-900">{scheduledInspectionsCount}</div>
              {isLv ? 'Plānotas apskates' : 'Scheduled inspections'}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {leads.map((lead) => (
            <Link key={lead.id} href={`/${locale}/crm/leads/${lead.id.toLowerCase()}`} className="block">
              <Card variant="outlined" hover className="border-sky-100 bg-white">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">{lead.id}</div>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">{lead.customer}</h3>
                    <p className="mt-1 text-sm text-slate-600">{lead.company}</p>
                    <div className="mt-3 text-sm text-slate-600">
                      <div>{lead.address}</div>
                      <div><SensitiveValue value={lead.phone} kind="phone" entityId={lead.id} field="phone" className="border-0 p-0 hover:bg-transparent" /></div>
                      <div><SensitiveValue value={lead.email} kind="email" entityId={lead.id} field="email" className="border-0 p-0 hover:bg-transparent" /></div>
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
        </div>
      </div>
    </Section>
  );
}

