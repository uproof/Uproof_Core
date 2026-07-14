import CrmWatermark from '@/components/crm/CrmWatermark';
import {getCrmCustomers} from '@/lib/crmCustomersStore';
import {resolveCrmWorkspace} from '@/lib/crmWorkspace';
import CrmCustomersClient from './CrmCustomersClient';

type Props = {params: Promise<{locale: string}>};
const CRM_LIST_LIMIT = 250;

export default async function CrmCustomersPage({params}: Props) {
  const {locale} = await params;
  const {session, salesUser, isSalesView} = await resolveCrmWorkspace();
  let customers = await getCrmCustomers({limit: CRM_LIST_LIMIT});

  if (isSalesView) {
    customers = salesUser ? await getCrmCustomers({assignedSalesUserId: salesUser.id, limit: CRM_LIST_LIMIT}) : [];
  }

  return <CrmCustomersClient locale={locale} customers={customers} isSalesView={isSalesView} watermark={<CrmWatermark brand="UpRoof" userId={session?.email || 'guest'} generatedAt={new Date().toISOString()} />} />;
}
