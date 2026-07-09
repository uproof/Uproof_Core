import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeads} from '@/lib/crmLeadsStore';
import {getCrmUsers} from '@/lib/crmUsersStore';
import {getRecentCrmUserActivity} from '@/lib/crmUserActivityStore';
import LeadManagementAdminClient from '@/app/[locale]/admin/lead-management/LeadManagementAdminClient';

type Props = {params: Promise<{locale: string}>};

export default async function AdminCrmLeadManagementPage({params}: Props) {
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

  return <LeadManagementAdminClient locale={locale} readOnly={false} initialLeads={leads} initialCrmUsers={salesUsers} initialActivity={activity} />;
}
