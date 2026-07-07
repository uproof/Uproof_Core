import {getCrmQuotes} from '@/lib/crmQuotesStore';
import CrmQuotesClient from './CrmQuotesClient';

type Props = {params: Promise<{locale: string}>};

export default async function CrmQuotesPage({params}: Props) {
  const {locale} = await params;
  const quotes = await getCrmQuotes();
  return <CrmQuotesClient locale={locale} quotes={quotes} />;
}
