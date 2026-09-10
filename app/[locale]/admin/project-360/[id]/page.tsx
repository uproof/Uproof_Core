import {notFound, redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {createSignedDocQuery} from '@/lib/crmDocs';
import {getCrmProjects} from '@/lib/crmProjectsStore';
import ProjectFileClient from './ProjectFileClient';

type Props = {params: Promise<{locale: string; id: string}>};

export default async function AdminProjectFilePage({params}: Props) {
  const {locale, id} = await params;
  const session = await getAdminSession();
  if (!session) redirect(`/${locale}/admin/login`);
  if (session.role !== 'superadmin') redirect(`/${locale}/crm`);

  const projects = await getCrmProjects({limit: 500});
  const project = projects.find((entry) => entry.id.toLowerCase() === id.toLowerCase());
  if (!project) notFound();

  const documents = project.attachments.map((fileName) => {
    try {
      const query = createSignedDocQuery({leadId: project.leadId, fileName, sessionId: session.sid, ttlSeconds: 15 * 60});
      return {name: fileName, url: `/api/crm/docs/${encodeURIComponent(project.leadId)}/${encodeURIComponent(fileName)}?${query}`};
    } catch {
      return {name: fileName, url: ''};
    }
  }).filter((entry) => entry.url);

  return <ProjectFileClient locale={locale} project={project} documents={documents} />;
}
