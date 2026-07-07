import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import CrmLoginPage from './CrmLoginPage';

type Props = {params: Promise<{locale: string}>};

export default async function CrmLoginRoute({params}: Props) {
  const {locale} = await params;
  const session = await getAdminSession();
  if (session?.role === 'sales') {
    redirect(`/${locale}/crm`);
  }
  return <CrmLoginPage />;
}
