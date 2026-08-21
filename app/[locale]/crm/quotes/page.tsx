import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmQuotes} from '@/lib/crmQuotesStore';
import CrmQuotesClient from './CrmQuotesClient';

type Props = {params: Promise<{locale: string}>};
const CRM_LIST_LIMIT = 250;

export default async function CrmQuotesPage({params}: Props) {
  const {locale} = await params;
  const session = await getAdminSession();
  if (!session) {
    redirect(`/${locale}/crm/login`);
  }
  const quotes = await getCrmQuotes(CRM_LIST_LIMIT);
  return (
    <CrmQuotesClient
      locale={locale}
      quotes={quotes}
      canExportAllQuotes={session.role === 'superadmin'}
      canDownloadQuotePdf={session.role === 'superadmin'}
    />
  );
}
