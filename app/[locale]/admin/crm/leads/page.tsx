import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import LeadManagementAdminClient from '@/app/[locale]/admin/lead-management/LeadManagementAdminClient';

type Props = {params: Promise<{locale: string}>};

export default async function AdminCrmLeadManagementPage({params}: Props) {
  const {locale} = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  return <LeadManagementAdminClient locale={locale} readOnly={false} />;
}
