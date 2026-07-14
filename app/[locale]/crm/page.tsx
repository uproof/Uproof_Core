import {getCrmLeads} from '@/lib/crmLeadsStore';
import {resolveCrmWorkspace} from '@/lib/crmWorkspace';
import CrmDashboardClient from './CrmDashboardClient';

export default async function CrmDashboard({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const {session, salesUser, isSalesView} = await resolveCrmWorkspace();
  let leads = await getCrmLeads();

  if (isSalesView) {
    leads = salesUser ? await getCrmLeads({assignedSalesUserId: salesUser.id}) : [];
  }

  return <CrmDashboardClient locale={locale} leads={leads} isSalesView={isSalesView} />;
}
