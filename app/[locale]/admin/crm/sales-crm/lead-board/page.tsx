import {redirect} from 'next/navigation';
import Link from 'next/link';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeads} from '@/lib/crmLeadsStore';
import {getCrmUsers} from '@/lib/crmUsersStore';
import {getRecentCrmUserActivity} from '@/lib/crmUserActivityStore';
import LeadManagementAdminClient from '@/app/[locale]/admin/lead-management/LeadManagementAdminClient';

export default async function SalesCrmLeadBoardPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  const [leads, crmUsers, activity] = await Promise.all([
    getCrmLeads(),
    getCrmUsers(),
    getRecentCrmUserActivity(100),
  ]);

  const salesUsers = crmUsers.filter((user) => user.role === 'sales' && user.isActive);

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Sales CRM</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Lead board</h1>
        </div>
        <Link href={`/${locale}/admin/crm/sales-crm`} className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
          Back to Sales CRM
        </Link>
      </div>
      <LeadManagementAdminClient locale={locale} readOnly={false} initialLeads={leads} initialCrmUsers={salesUsers} initialActivity={activity} />
    </div>
  );
}
