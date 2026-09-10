import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeads} from '@/lib/crmLeadsStore';
import {getCrmUsers} from '@/lib/crmUsersStore';
import {getRecentCrmUserActivity} from '@/lib/crmUserActivityStore';
import SalesUserManagementAdminClient from '@/app/[locale]/admin/crm/users/SalesUserManagementAdminClient';
import WorkspaceBreadcrumbs from '@/components/WorkspaceBreadcrumbs';

export default async function SalesCrmSalesUsersPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  const [crmUsers, leads, activity] = await Promise.all([
    getCrmUsers(),
    getCrmLeads(),
    getRecentCrmUserActivity(100),
  ]);

  const salesUsers = crmUsers.filter((user) => user.role === 'sales');

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5"><WorkspaceBreadcrumbs items={[{label: 'Dashboard', href: `/${locale}/admin`}, {label: 'Sales CRM', href: `/${locale}/admin/crm/sales-crm`}, {label: 'Sales users'}]} backHref={`/${locale}/admin/crm/sales-crm`} /></div>
      <SalesUserManagementAdminClient locale={locale} initialCrmUsers={salesUsers} initialLeads={leads} initialActivity={activity} />
    </div>
  );
}
