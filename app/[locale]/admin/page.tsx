import {redirect} from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {getAdminSession} from '@/lib/adminAuth';
import AdminLogout from '@/components/AdminLogout';
import NotificationBell from '@/components/NotificationBell';

type DashboardTile = {
  href: string;
  title: string;
  description: string;
  action: string;
  accent: string;
  iconBg: string;
  iconText: string;
  icon: typeof ClipboardDocumentListIcon;
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
      href: `/${locale}/admin/crm/leads`,
      title: 'Sales lead management',
      description: 'Add, delete, and assign leads',
      action: 'Open Lead Management',
      accent: 'border-sky-100',
      iconBg: 'bg-sky-100 group-hover:bg-sky-200',
      iconText: 'text-sky-700',
      icon: ClipboardDocumentListIcon,
    },
    {
      href: `/${locale}/admin/crm/users`,
      title: 'Sales team management',
      description: 'Create, delete, and manage sales users with individual logs and dashboard access',
      action: 'Open User Management',
      accent: 'border-indigo-100',
      iconBg: 'bg-indigo-100 group-hover:bg-indigo-200',
      iconText: 'text-indigo-700',
      icon: UserGroupIcon,
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
              <Link
                href={`https://uproof.eu/${locale}`}
                target="_blank"
                rel="noreferrer"
                className="order-3 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="hidden sm:inline">View Website</span>
              </Link>
              <div className="order-4">
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
            return (
              <Link key={tile.href} href={tile.href} className="h-full">
                <div className={`group flex h-full min-h-[16rem] flex-col rounded-2xl border bg-white p-6 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl ${tile.accent}`}>
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${tile.iconBg}`}>
                      <Icon className={`h-7 w-7 ${tile.iconText}`} />
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
                      <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Active
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col">
                    <h3 className="text-xl font-bold tracking-tight text-gray-900">{tile.title}</h3>
                    <p className="mt-2 flex-1 text-gray-600">{tile.description}</p>
                    <div className={`mt-6 flex items-center font-semibold ${tile.iconText}`}>
                      {tile.action}
                      <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>


      </main>
    </div>
  );
}
