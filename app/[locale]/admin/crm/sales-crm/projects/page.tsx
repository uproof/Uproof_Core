import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';

export default async function SalesCrmProjectsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  redirect(`/${locale}/admin/project-360`);
}
