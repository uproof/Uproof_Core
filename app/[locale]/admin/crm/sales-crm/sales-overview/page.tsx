import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeads} from '@/lib/crmLeadsStore';

function normalizeStatus(value: string) {
  return String(value || '').trim().toUpperCase().replace(/[_\s]+/g, ' ');
}

export default async function SalesCrmOverviewPage({params, searchParams}: {params: Promise<{locale: string}>; searchParams?: Promise<{status?: string}>}) {
  const {locale} = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  const resolvedSearchParams = (await searchParams) || {};
  const activeStatus = String(resolvedSearchParams.status || '').trim().toLowerCase();
  const leads = await getCrmLeads();

  const totalLeads = leads.length;
  const newLeads = leads.filter((lead) => normalizeStatus(lead.status) === 'NEW LEAD').length;
  const openLeads = leads.filter((lead) => !['FROZEN', 'DENIED', 'ACCEPTED'].includes(normalizeStatus(lead.status))).length;
  const estimateSent = leads.filter((lead) => normalizeStatus(lead.status) === 'ESTIMATE SENT').length;
  const estimating = leads.filter((lead) => normalizeStatus(lead.status) === 'ESTIMATING').length;

  const statusBuckets = {
    total: leads,
    new: leads.filter((lead) => normalizeStatus(lead.status) === 'NEW LEAD'),
    open: leads.filter((lead) => !['FROZEN', 'DENIED', 'ACCEPTED'].includes(normalizeStatus(lead.status))),
    estimating: leads.filter((lead) => normalizeStatus(lead.status) === 'ESTIMATING'),
    estimateSent: leads.filter((lead) => normalizeStatus(lead.status) === 'ESTIMATE SENT'),
  };

  const snapshot = [
    {key: 'total', label: 'Total', value: totalLeads, leads: statusBuckets.total},
    {key: 'new', label: 'New leads', value: newLeads, leads: statusBuckets.new},
    {key: 'open', label: 'Total open', value: openLeads, leads: statusBuckets.open},
    {key: 'estimating', label: 'Estimating', value: estimating, leads: statusBuckets.estimating},
    {key: 'estimateSent', label: 'Quote sent', value: estimateSent, leads: statusBuckets.estimateSent},
  ];

  const selectedKey = activeStatus && snapshot.some((entry) => entry.key === activeStatus) ? activeStatus : 'total';
  const visibleLeads = snapshot.find((entry) => entry.key === selectedKey)?.leads || leads;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Sales CRM</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Sales overview</h1>
          <p className="mt-2 text-sm text-slate-600">Deal values and lead status totals across the current sales pipeline.</p>
        </div>
        <Link href={`/${locale}/admin/crm/sales-crm`} className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
          Back to Sales CRM
        </Link>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {snapshot.map((entry) => (
          <Link key={entry.key} href={`/${locale}/admin/crm/sales-crm/sales-overview?status=${entry.key}`} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{entry.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{entry.value}</p>
            <p className="mt-2 text-sm text-slate-500">{entry.key === 'total' ? 'Open lead list' : 'Open lead list'}</p>
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{snapshot.find((entry) => entry.key === selectedKey)?.label || 'Total'} leads</h2>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{visibleLeads.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Deal value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Next action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">No leads match this filter.</td>
                </tr>
              ) : (
                visibleLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{lead.customer}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{String(lead.status || 'NEW').replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{lead.owner || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{lead.value || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{lead.nextAction || '—'}</td>
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
