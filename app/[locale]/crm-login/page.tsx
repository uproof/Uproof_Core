import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import CrmLoginPage from '../crm/login/CrmLoginPage';

type Props = {params: Promise<{locale: string}>};

export default async function CrmLoginEntry({params}: Props) {
  const {locale} = await params;
  const session = await getAdminSession();
  if (session?.role === 'superadmin') {
    redirect(`/${locale}/admin/crm`);
  }
  return <CrmLoginPage />;
}
