import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import SalesUserManagementAdminClient from './SalesUserManagementAdminClient';

type Props = {params: Promise<{locale: string}>};

export default async function AdminCrmUsersPage({params}: Props) {
  const {locale} = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  return <SalesUserManagementAdminClient locale={locale} />;
}
