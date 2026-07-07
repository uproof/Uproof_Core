import Link from 'next/link';
import {ArrowTopRightOnSquareIcon} from '@heroicons/react/24/outline';
import Card from '@/components/Card';
import SensitiveValue from '@/components/crm/SensitiveValue';
import Section from '@/components/Section';
import {getCrmLeads} from '@/lib/crmLeadsStore';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';

export default async function CrmDashboard({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const session = await getAdminSession();
  let leads = await getCrmLeads();

  if (session?.role === 'sales') {
    const salesUser = await getCrmUserByEmail(session.email);
    leads = salesUser ? await getCrmLeads({assignedSalesUserId: salesUser.id}) : [];
  }

  return <CrmDashboardContent locale={locale} leads={leads} />;
}

function CrmDashboardContent({locale, leads}: {locale: string; leads: Awaited<ReturnType<typeof getCrmLeads>>}) {
  const isLv = locale === 'lv';

  return (
    <>
      <Section pad="sm" className="px-0 !py-0">
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-500">{isLv ? 'Līdu pārskats' : 'Lead board'}</p>
        </div>
        <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm">
          <div className="grid grid-cols-[1.15fr_0.7fr_0.65fr_0.7fr_0.8fr_0.75fr] gap-0 border-b border-sky-100 bg-sky-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">
            <div>{isLv ? 'Līds' : 'Lead'}</div>
            <div>{isLv ? 'Statuss' : 'Status'}</div>
            <div>{isLv ? 'Progress' : 'Progress'}</div>
            <div>{isLv ? 'Aktivitāte' : 'Activity'}</div>
            <div>{isLv ? 'Darījums' : 'Deal'}</div>
            <div>{isLv ? 'Piezīme' : 'Note'}</div>
          </div>

          <div className="divide-y divide-sky-100">
            {leads.map((lead) => (
              <Link
                key={lead.id}
                href={`/${locale}/crm/leads/${lead.id.toLowerCase()}`}
                className="grid grid-cols-[1.15fr_0.7fr_0.65fr_0.7fr_0.8fr_0.75fr] items-center gap-0 px-5 py-5 transition hover:bg-sky-50/60"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">
                    {lead.id}
                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                  </div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{lead.customer}</div>
                  <div className="mt-1 text-sm text-slate-600">{lead.address}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{isLv ? 'Kontakts:' : 'Contact:'}</span>
                    <SensitiveValue value={lead.phone} kind="phone" entityId={lead.id} field="phone" className="border-0 p-0 text-xs hover:bg-transparent" />
                    <span>·</span>
                    <SensitiveValue value={lead.email} kind="email" entityId={lead.id} field="email" className="border-0 p-0 text-xs hover:bg-transparent" />
                  </div>
                </div>

                <div className="pr-3 text-sm text-slate-700">{lead.status.replaceAll('_', ' ')}</div>
                <div className="pr-3 text-sm text-slate-700">{lead.progress}</div>
                <div className="pr-3 text-sm text-slate-700">{lead.activityUpdate}</div>
                <div className="pr-3 text-sm text-slate-700">{lead.dealProgress}</div>
                <div className="pr-3 text-sm text-slate-600 line-clamp-2">{lead.note}</div>
              </Link>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
