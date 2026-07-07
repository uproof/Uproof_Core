import Card from '@/components/Card';
import Section from '@/components/Section';
import {getCrmCustomers} from '@/lib/crmCustomersStore';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';

type Props = {params: Promise<{locale: string}>};

export default async function CrmCustomersPage({params}: Props) {
  const {locale} = await params;
  const isLv = locale === 'lv';
  const session = await getAdminSession();
  let customers = await getCrmCustomers();

  if (session?.role === 'sales') {
    const salesUser = await getCrmUserByEmail(session.email);
    customers = salesUser ? await getCrmCustomers({assignedSalesUserId: salesUser.id}) : [];
  }

  return (
    <Section pad="sm" className="px-0 !py-0">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-600">{isLv ? 'Klienti' : 'Customers'}</p>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">{isLv ? 'Klientu ieraksti tiek glabāti atsevišķi no līdiem, lai vienam klientam varētu būt vairāki darbi laika gaitā.' : 'Customer records stay separate from leads so each person or company can have multiple jobs over time.'}</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {customers.map((customer) => (
          <Card key={customer.id} variant="outlined" hover={false}>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">{customer.id}</div>
            <h3 className="mt-2 text-2xl font-bold text-gray-900">{customer.name}</h3>
            <p className="mt-1 text-sm text-gray-600">{customer.company}</p>

            <div className="mt-5 space-y-2 text-sm text-gray-600">
              <div>{customer.phone}</div>
              <div>{customer.email}</div>
              <div>{customer.lastContact}</div>
            </div>

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm">
              <span className="text-gray-600">{isLv ? 'Saistītie līdi' : 'Related leads'}</span>
              <span className="font-semibold text-gray-900">{customer.leads}</span>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
