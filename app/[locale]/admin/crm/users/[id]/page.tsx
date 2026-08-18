import Link from 'next/link';
import {notFound, redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeads} from '@/lib/crmLeadsStore';
import {getCrmUserById} from '@/lib/crmUsersStore';
import {getRecentCrmUserActivity} from '@/lib/crmUserActivityStore';
import CrmUserSecurityActions from '../CrmUserSecurityActions';
import CrmUserDataActions from '../CrmUserDataActions';
import CrmUserWorkLogActions from '../CrmUserWorkLogActions';

type Props = {params: Promise<{locale: string; id: string}>};

function formatRelativeTime(value?: string | null) {
  if (!value) {
    return '—';
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return '—';
  }

  const deltaMs = Date.now() - timestamp;
  const absoluteSeconds = Math.max(0, Math.round(Math.abs(deltaMs) / 1000));

  if (absoluteSeconds < 60) return `${absoluteSeconds}s ago`;

  const minutes = Math.floor(absoluteSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatCallDuration(detail: string) {
  const normalized = detail.trim();
  if (!normalized) {
    return '—';
  }

  const match = normalized.match(/(?:call\s*duration|duration)\s*[:=]?\s*(\d+)\s*(s|sec|secs|second|seconds|m|min|mins|minute|minutes)?/i);
  if (!match) {
    return '—';
  }

  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) {
    return '—';
  }

  const unit = (match[2] || 'm').toLowerCase();
  if (unit.startsWith('s')) {
    return `${amount}s`;
  }

  return `${amount}m`;
}

export default async function AdminCrmUserDashboardPage({params}: Props) {
  const {locale, id} = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  const user = await getCrmUserById(id);
  if (!user || user.role !== 'sales') {
    notFound();
  }

  const leads = await getCrmLeads({assignedSalesUserId: user.id});
  const activity = (await getRecentCrmUserActivity(500)).filter(
    (entry) => entry.actorEmail.toLowerCase() === user.email.toLowerCase()
  );
  const latestActivityByLead = new Map<string, (typeof activity)[number]>();
  for (const entry of activity) {
    const leadKey = entry.leadId.trim().toLowerCase();
    if (leadKey && !latestActivityByLead.has(leadKey)) {
      latestActivityByLead.set(leadKey, entry);
    }
  }

  const leadRows = leads.map((lead) => {
    const latestActivity = latestActivityByLead.get(lead.id.trim().toLowerCase());
    return {
      lead,
      latestActivity,
      leadCreatedAt: lead.createdAtUtc || lead.createdAt || null,
    };
  });
  const leadMap = new Map(leadRows.map(({lead, leadCreatedAt}) => [lead.id.trim().toLowerCase(), leadCreatedAt]));

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-500">Sales User Dashboard</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">{user.name}</h2>
          <p className="text-sm text-slate-600">{user.email}</p>
        </div>
        <Link href={`/${locale}/admin/crm/users`} className="inline-flex items-center rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-50">
          Back to User Management
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
        <div className="mb-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">Access controls</p>
          <p className="mt-1 text-sm text-slate-600">Revoke access here. Download data and delete the account in the section below.</p>
        </div>
        <CrmUserSecurityActions locale={locale} userId={user.id} userName={user.name} />
      </div>

      <div className="mb-6 rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">Data export</p>
        <p className="mt-1 text-sm text-slate-600">Download a snapshot of this sales user&apos;s profile, activity, and assigned lead status before deletion.</p>
        <CrmUserDataActions locale={locale} userId={user.id} userName={user.name} userEmail={user.email} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-sky-100 bg-white p-5">
          <h3 className="text-lg font-semibold text-slate-900">Assigned Leads ({leads.length})</h3>
          <div className="mt-3 space-y-2 max-h-[560px] overflow-auto pr-1">
            {leads.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-500">No assigned leads.</div>
            ) : (
              leadRows.map(({lead, latestActivity, leadCreatedAt}) => (
                <Link key={lead.id} href={`/${locale}/admin/crm/leads/${encodeURIComponent(lead.id)}`} className="block rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700 hover:bg-sky-100">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-900">{lead.customer}</div>
                      <div>{lead.id} · {lead.company}</div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <div>Added {formatRelativeTime(leadCreatedAt)}</div>
                      <div>Last touch {formatRelativeTime(latestActivity?.createdAt)}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>Last action: {latestActivity?.action || '—'}</span>
                    <span>Sales person: {latestActivity?.actorEmail || '—'}</span>
                    <span>Call duration: {formatCallDuration(latestActivity?.detail || '')}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900">Work Logs ({activity.length})</h3>
            <CrmUserWorkLogActions locale={locale} userId={user.id} userName={user.name} />
          </div>
          <div className="mt-3 space-y-2 max-h-[560px] overflow-auto pr-1">
            {activity.length === 0 ? (
              <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-500">No activity found.</div>
            ) : (
              activity.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-xs text-slate-600">
                  <div className="font-semibold text-slate-900">{entry.action}{entry.leadId ? ` · ${entry.leadId}` : ''}</div>
                  <div className="mt-1 flex flex-wrap gap-3 text-slate-500">
                    <span>Sales person: {entry.actorEmail}</span>
                    <span>Added {formatRelativeTime(leadMap.get(entry.leadId.toLowerCase()))}</span>
                    <span>Response {formatRelativeTime(entry.createdAt)}</span>
                    <span>Call duration: {formatCallDuration(entry.detail || '')}</span>
                  </div>
                  <div className="mt-1">{entry.detail || '—'}</div>
                  <div className="text-slate-500">{new Date(entry.createdAt).toLocaleString('en-GB')}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
