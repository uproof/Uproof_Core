import {notFound, redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeads} from '@/lib/crmLeadsStore';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {createEmptyCrmEstimatorData} from '@/lib/crmEstimator';
import EstimatorEngineClient from '../EstimatorEngineClient';

type Props = {params: Promise<{locale: string; leadId: string}>};

export default async function EstimatorEnginePage({params}: Props) {
  const {locale, leadId} = await params;
  const session = await getAdminSession();
  if (!session) redirect(`/${locale}/crm/login`);

  let leads = await getCrmLeads();
  if (session.role === 'sales') {
    const user = await getCrmUserByEmail(session.email);
    leads = user ? await getCrmLeads({assignedSalesUserId: user.id}) : [];
  }

  const lead = leads.find((entry) => entry.id.toLowerCase() === leadId.toLowerCase());
  if (!lead) notFound();
  const normalizedLead = {...lead, estimatorData: lead.estimatorData || createEmptyCrmEstimatorData()};
  const backHref = session.role === 'superadmin' ? `/${locale}/admin/crm/sales-crm/lead-board` : `/${locale}/crm/leads/${encodeURIComponent(lead.id)}`;
  return <EstimatorEngineClient locale={locale} lead={normalizedLead} backHref={backHref} />;
}
