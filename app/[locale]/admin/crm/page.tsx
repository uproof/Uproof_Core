import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';

type Props = {params: Promise<{locale: string}>};

export default async function AdminCrmPage({params}: Props) {
  const {locale} = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  redirect(`/${locale}/admin/crm/users`);
}