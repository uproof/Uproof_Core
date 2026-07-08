import Card from '@/components/Card';
import Section from '@/components/Section';
import CrmWatermark from '@/components/crm/CrmWatermark';
import {getCrmCustomers} from '@/lib/crmCustomersStore';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {maskEmail, maskPhone, maskText} from '@/lib/sensitiveMask';

type Props = {params: Promise<{locale: string}>};

export default async function CrmCustomersPage({params}: Props) {
  const {locale} = await params;
  const isLv = locale === 'lv';
  const session = await getAdminSession();
  const isSalesView = session?.role === 'sales';
  let customers = await getCrmCustomers();

  if (session?.role === 'sales') {
    const salesUser = await getCrmUserByEmail(session.email);
    customers = salesUser ? await getCrmCustomers({assignedSalesUserId: salesUser.id}) : [];
  }

  return (
    <Section pad="sm" className="relative overflow-hidden px-0 !py-0">
      <CrmWatermark brand="UpRoof" userId={session?.email || 'guest'} generatedAt={new Date().toISOString()} />
      <div className="relative z-10">
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-600">{isLv ? 'Klienti' : 'Customers'}</p>
          <p className="mt-1 max-w-3xl text-sm text-gray-600">{isLv ? 'Klientu ieraksti tiek glabāti atsevišķi no līdiem, lai vienam klientam varētu būt vairāki darbi laika gaitā.' : 'Customer records stay separate from leads so each person or company can have multiple jobs over time.'}</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {customers.map((customer) => (
            <Card key={customer.id} variant="outlined" hover={false} className="relative overflow-hidden">
              <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(2,132,199,0.14),transparent_40%)]" />
              </div>
              <div className="relative z-10">
                <div className="text-sm font-semibold uppercase tracking-[0.14em] text-primary-600">
                  {isSalesView ? maskText(customer.id) : customer.id}
                </div>
                <h3 className="mt-2 text-base font-semibold text-gray-900">
                  {isSalesView ? maskText(customer.name) : customer.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {isSalesView ? maskText(customer.company) : customer.company}
                </p>

                <div className="mt-5 space-y-2 text-sm text-gray-600">
                  <div>{isSalesView ? maskPhone(customer.phone) : customer.phone}</div>
                  <div>{isSalesView ? maskEmail(customer.email) : customer.email}</div>
                  <div>{isSalesView ? maskText(customer.lastContact) : customer.lastContact}</div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm">
                  <span className="text-gray-600">{isLv ? 'Saistītie līdi' : 'Related leads'}</span>
                  <span className="font-semibold text-gray-900">{customer.leads}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}
