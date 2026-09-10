import {redirect} from 'next/navigation';
import Link from 'next/link';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeads} from '@/lib/crmLeadsStore';
import {getCrmUsers} from '@/lib/crmUsersStore';
import {getRecentCrmUserActivity} from '@/lib/crmUserActivityStore';
import LeadManagementAdminClient from '@/app/[locale]/admin/lead-management/LeadManagementAdminClient';
import WorkspaceBreadcrumbs from '@/components/WorkspaceBreadcrumbs';

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
      <div className="mb-5"><WorkspaceBreadcrumbs items={[{label: 'Dashboard', href: `/${locale}/admin`}, {label: 'Sales CRM', href: `/${locale}/admin/crm/sales-crm`}, {label: 'Lead board'}]} backHref={`/${locale}/admin/crm/sales-crm`} /></div>
      <LeadManagementAdminClient locale={locale} readOnly={false} initialLeads={leads} initialCrmUsers={salesUsers} initialActivity={activity} />
    </div>
  );
}
