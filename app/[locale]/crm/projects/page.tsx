import {getCrmProjects} from '@/lib/crmProjectsStore';
import {resolveCrmWorkspace} from '@/lib/crmWorkspace';
import CrmProjectsClient from './CrmProjectsClient';

type Props = {params: Promise<{locale: string}>};
const CRM_LIST_LIMIT = 250;

export default async function CrmProjectsPage({params}: Props) {
  const {locale} = await params;
  const {salesUser, isSalesView} = await resolveCrmWorkspace();
  let projects = await getCrmProjects({limit: CRM_LIST_LIMIT});

  if (isSalesView) {
    projects = salesUser ? await getCrmProjects({assignedSalesUserId: salesUser.id, limit: CRM_LIST_LIMIT}) : [];
  }

  return <CrmProjectsClient locale={locale} projects={projects} isSalesView={isSalesView} />;
}
