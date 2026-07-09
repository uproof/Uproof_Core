import CrmWatermark from '@/components/crm/CrmWatermark';
import {getCrmCustomers} from '@/lib/crmCustomersStore';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import CrmCustomersClient from './CrmCustomersClient';

type Props = {params: Promise<{locale: string}>};

export default async function CrmCustomersPage({params}: Props) {
  const {locale} = await params;
  const session = await getAdminSession();
  let customers = await getCrmCustomers();

  if (session?.role === 'sales') {
    const salesUser = await getCrmUserByEmail(session.email);
    customers = salesUser ? await getCrmCustomers({assignedSalesUserId: salesUser.id}) : [];
  }

  return <CrmCustomersClient locale={locale} customers={customers} isSalesView={session?.role === 'sales'} watermark={<CrmWatermark brand="UpRoof" userId={session?.email || 'guest'} generatedAt={new Date().toISOString()} />} />;
}
