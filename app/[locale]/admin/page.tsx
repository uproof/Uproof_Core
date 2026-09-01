import {redirect} from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ClipboardDocumentListIcon,
  FolderOpenIcon,
  BriefcaseIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {getAdminSession} from '@/lib/adminAuth';
import AdminLogout from '@/components/AdminLogout';
import NotificationBell from '@/components/NotificationBell';

type DashboardTile = {
  href?: string;
  title: string;
  description: string;
  action: string;
  accent: string;
  iconBg: string;
  iconText: string;
  icon: typeof ClipboardDocumentListIcon;
  disabled?: boolean;
};

export default async function AdminDashboard({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const session = await getAdminSession();
  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  const tiles: DashboardTile[] = [
    {
      href: `/${locale}/admin/crm/sales-crm`,
      title: 'Sales CRM',
      description: 'Manage sales users, lead board, contacts, overview, and connected project workflows',
      action: 'Open Sales CRM',
      accent: 'border-sky-100',
      iconBg: 'bg-sky-100 group-hover:bg-sky-200',
      iconText: 'text-sky-700',
      icon: ClipboardDocumentListIcon,
    },
    {
      href: `/${locale}/admin/project-360`,
      title: 'Project 360',
      description: 'Access OCR, estimator, and project files from connected Google Sheets data',
      action: 'Open Project 360',
      accent: 'border-emerald-100',
      iconBg: 'bg-emerald-100 group-hover:bg-emerald-200',
      iconText: 'text-emerald-700',
      icon: FolderOpenIcon,
    },
    {
      title: 'HR',
      description: 'HR requests and employee onboarding will be enabled here once the workflow is ready.',
      action: 'Coming soon',
      accent: 'border-slate-200',
      iconBg: 'bg-slate-100',
      iconText: 'text-slate-500',
      icon: UserGroupIcon,
      disabled: true,
    },
    {
      href: `/${locale}/admin/financials`,
      title: 'Financials',
      description: 'Google Sheets-backed financial dashboard for budgets, cash flow, and reporting.',
      action: 'Open Financials',
      accent: 'border-violet-100',
      iconBg: 'bg-violet-100 group-hover:bg-violet-200',
      iconText: 'text-violet-700',
      icon: CurrencyDollarIcon,
    },
    {
      title: 'Growth',
      description: 'Growth tracking and expansion metrics are planned for a future release.',
      action: 'Inactive',
      accent: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-700',
      icon: ArrowTrendingUpIcon,
      disabled: true,
    },
    {
      title: 'Inventory',
      description: 'Inventory control and stock tracking will be added later as a separate module.',
      action: 'Inactive',
      accent: 'border-cyan-200',
      iconBg: 'bg-cyan-100',
      iconText: 'text-cyan-700',
      icon: ArchiveBoxIcon,
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
                <Image src="/logo.svg" alt="UpRoof" width={44} height={44} className="h-full w-full object-contain p-1" priority />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">UpRoof Operations</h1>
                <p className="text-xs sm:text-sm text-gray-600">Internal CRM and project operations</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="order-1">
                <LanguageSwitcher />
              </div>
              <div className="order-2">
                <NotificationBell locale={locale} />
              </div>
              <div className="order-3">
                <AdminLogout locale={locale} email={session.email} securityHref={`/${locale}/admin/settings/security`} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Manage sales operations. Project 360 modules will be added here.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr items-stretch">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            const content = (
              <div className={`group flex h-full min-h-[16rem] flex-col rounded-2xl border bg-white p-6 shadow-md transition-all ${tile.disabled ? 'opacity-70' : 'hover:-translate-y-0.5 hover:shadow-xl'} ${tile.accent}`}>
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${tile.iconBg}`}>
                    <Icon className={`h-7 w-7 ${tile.iconText}`} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col">
                  <h3 className="text-xl font-bold tracking-tight text-gray-900">{tile.title}</h3>
                  <p className="mt-2 flex-1 text-gray-600">{tile.description}</p>
                  <div className={`mt-6 flex items-center font-semibold ${tile.iconText}`}>
                    {tile.action}
                    {!tile.disabled ? <span className="ml-2 transition-transform group-hover:translate-x-1">→</span> : null}
                  </div>
                </div>
              </div>
            );

            if (tile.disabled || !tile.href) {
              return <div key={tile.title} className="h-full">{content}</div>;
            }

            return <Link key={tile.href} href={tile.href} className="h-full">{content}</Link>;
          })}
        </div>


      </main>
    </div>
  );
}
