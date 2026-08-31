import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeads} from '@/lib/crmLeadsStore';

export default async function SalesCrmContactsPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  const leads = await getCrmLeads();
  const contacts = leads
    .filter((lead) => lead.email || lead.phone)
    .map((lead) => ({
      customer: lead.customer || lead.company || 'Unknown client',
      company: lead.company || '—',
      email: lead.email || '—',
      phone: lead.phone || '—',
      owner: lead.owner || 'Unassigned',
    }));

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Sales CRM</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Contacts</h1>
          <p className="mt-2 text-sm text-slate-600">Client email and phone list for quick follow-up and outreach.</p>
        </div>
        <Link href={`/${locale}/admin/crm/sales-crm`} className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
          Back to Sales CRM
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No contact records yet.</td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={`${contact.customer}-${contact.email}-${contact.phone}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{contact.customer}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{contact.company}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{contact.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{contact.phone}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{contact.owner}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
