import {notFound} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {createSignedDocQuery} from '@/lib/crmDocs';
import {getCrmLeads} from '@/lib/crmLeadsStore';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {createEmptyCrmEstimatorData} from '@/lib/crmEstimator';
import {redactLeadForSales} from '@/lib/sensitiveMask';
import LeadManagementClient from './LeadManagementClient';

type Props = {
  params: Promise<{locale: string; id: string}>;
};

export default async function CrmLeadDetailPage({params}: Props) {
  const {locale, id} = await params;
  const session = await getAdminSession();

  let leads = await getCrmLeads();
  if (session?.role === 'sales') {
    const salesUser = await getCrmUserByEmail(session.email);
    leads = salesUser ? await getCrmLeads({assignedSalesUserId: salesUser.id}) : [];
  }

  const lead = leads.find((entry) => entry.id.toLowerCase() === id.toLowerCase());

  if (!lead) {
    notFound();
  }

  const signedAttachments = lead.attachments.map((fileName) => {
    const query = createSignedDocQuery({
      leadId: lead.id,
      fileName,
      sessionId: session?.sid || 'anonymous',
      ttlSeconds: 15 * 60,
    });
    return {
      name: fileName,
      url: `/api/crm/docs/${encodeURIComponent(lead.id)}/${encodeURIComponent(fileName)}?${query}`,
    };
  });

  const salesLead = redactLeadForSales({...lead, workLog: [], estimatorData: lead.estimatorData || createEmptyCrmEstimatorData()});

  return <LeadManagementClient locale={locale} lead={salesLead} signedAttachments={signedAttachments} showWorkLog={false} accessScope="sales" />;
}
