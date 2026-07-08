import {getCrmLeads} from '@/lib/crmLeadsStore';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import CrmLeadsClient from './CrmLeadsClient';

type Props = {params: Promise<{locale: string}>};

export default async function CrmLeadsPage({params}: Props) {
  const {locale} = await params;
  const session = await getAdminSession();
  let leads = await getCrmLeads();
  if (session?.role === 'sales') {
    const salesUser = await getCrmUserByEmail(session.email);
    leads = salesUser ? await getCrmLeads({assignedSalesUserId: salesUser.id}) : [];
  }
  return <CrmLeadsClient locale={locale} leads={leads} isSalesView={session?.role === 'sales'} />;
}

