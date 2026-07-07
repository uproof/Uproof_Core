import {notFound, redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {createSignedDocQuery} from '@/lib/crmDocs';
import {getCrmLeads} from '@/lib/crmLeadsStore';
import LeadManagementClient from '@/app/[locale]/crm/leads/[id]/LeadManagementClient';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export default async function AdminCrmLeadDetailPage({params}: Props) {
  const {locale, id} = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  const leads = await getCrmLeads();
  const lead = leads.find((entry) => entry.id.toLowerCase() === id.toLowerCase());

  if (!lead) {
    notFound();
  }

  const signedAttachments = lead.attachments.map((fileName) => {
    const query = createSignedDocQuery({
      leadId: lead.id,
      fileName,
      sessionId: session.sid,
      ttlSeconds: 15 * 60,
    });
    return {
      name: fileName,
      url: `/api/crm/docs/${encodeURIComponent(lead.id)}/${encodeURIComponent(fileName)}?${query}`,
    };
  });

  return <LeadManagementClient locale={locale} lead={lead} signedAttachments={signedAttachments} showWorkLog={true} accessScope="admin" />;
}