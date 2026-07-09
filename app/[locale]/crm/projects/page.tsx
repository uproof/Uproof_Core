import {getCrmProjects} from '@/lib/crmProjectsStore';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import CrmProjectsClient from './CrmProjectsClient';

type Props = {params: Promise<{locale: string}>};

export default async function CrmProjectsPage({params}: Props) {
  const {locale} = await params;
  const session = await getAdminSession();
  let projects = await getCrmProjects();

  if (session?.role === 'sales') {
    const salesUser = await getCrmUserByEmail(session.email);
    projects = salesUser ? await getCrmProjects({assignedSalesUserId: salesUser.id}) : [];
  }

  return <CrmProjectsClient locale={locale} projects={projects} isSalesView={session?.role === 'sales'} />;
}
