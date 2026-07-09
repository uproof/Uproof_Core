import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeads} from '@/lib/crmLeadsStore';
import {getCrmUsers} from '@/lib/crmUsersStore';
import {getRecentCrmUserActivity} from '@/lib/crmUserActivityStore';
import SalesUserManagementAdminClient from './SalesUserManagementAdminClient';

type Props = {params: Promise<{locale: string}>};

export default async function AdminCrmUsersPage({params}: Props) {
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

  return <SalesUserManagementAdminClient locale={locale} initialCrmUsers={salesUsers} initialLeads={leads} initialActivity={activity} />;
}
