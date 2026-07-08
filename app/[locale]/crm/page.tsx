import {getCrmLeads} from '@/lib/crmLeadsStore';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import CrmDashboardClient from './CrmDashboardClient';

export default async function CrmDashboard({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const session = await getAdminSession();
  let leads = await getCrmLeads();

  if (session?.role === 'sales') {
    const salesUser = await getCrmUserByEmail(session.email);
    leads = salesUser ? await getCrmLeads({assignedSalesUserId: salesUser.id}) : [];
  }

  return <CrmDashboardClient locale={locale} leads={leads} isSalesView={session?.role === 'sales'} />;
}
