import Link from 'next/link';
import {redirect} from 'next/navigation';
import {
  ClipboardDocumentListIcon,
  PhoneIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {getAdminSession} from '@/lib/adminAuth';

type Tile = {
  href: string;
  title: string;
  description: string;
  action: string;
  icon: typeof ClipboardDocumentListIcon;
};

export default async function SalesCrmHubPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  const tiles: Tile[] = [
    {
      href: 'lead-board',
      title: 'Lead board',
      description: 'All leads with assignment control and activity tracking for every sales user.',
      action: 'Open lead board',
      icon: ClipboardDocumentListIcon,
    },
    {
      href: 'sales-users',
      title: 'Sales users',
      description: 'Manage sales user profiles, access, and lead ownership from one sales CRM page.',
      action: 'Manage sales users',
      icon: UserGroupIcon,
    },
    {
      href: 'contacts',
      title: 'Contacts',
      description: 'Client email and phone directory for fast follow-up and lead outreach.',
      action: 'Open contacts',
      icon: PhoneIcon,
    },
    {
      href: 'sales-overview',
      title: 'Sales overview',
      description: 'Track deal value and lead status totals with click-through lead lists.',
      action: 'Open sales overview',
      icon: ChartBarIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">Sales CRM</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Sales user and lead management</h1>
            <p className="mt-2 text-sm text-slate-600">One CRM hub for all sales-user operations, lead activity, and contact data.</p>
          </div>
          <Link href={`/${locale}/admin`} className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            Back to CMS
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link key={tile.href} href={`/${locale}/admin/crm/sales-crm/${tile.href}`} className="group block h-full">
                <div className="flex h-full min-h-[190px] flex-col rounded-3xl border border-sky-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h2 className="text-xl font-bold text-slate-900">{tile.title}</h2>
                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{tile.description}</p>
                    <span className="mt-5 inline-flex items-center text-sm font-semibold text-sky-700">
                      {tile.action}
                      <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
