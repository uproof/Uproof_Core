import {ReactNode} from 'react';
import {redirect} from 'next/navigation';
import {headers} from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import {ChartBarIcon, ClipboardDocumentListIcon, FolderOpenIcon, HomeIcon, UserGroupIcon, DocumentTextIcon} from '@heroicons/react/24/outline';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AdminLogout from '@/components/AdminLogout';
import {getAdminSession, isAdminAuthenticated} from '@/lib/adminAuth';

export default async function CrmLayout({children, params}: {children: ReactNode; params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const isLv = locale === 'lv';
  const session = await getAdminSession();
  if (!session || session.role !== 'sales') {
    redirect(`/${locale}/crm/login?redirect=/${locale}/crm`);
  }

  const headerStore = await headers();
  const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const navItems = [
    {href: '', label: isLv ? 'Panelis' : 'Dashboard', icon: ChartBarIcon},
    {href: '/leads', label: isLv ? 'Līdi' : 'Leads', icon: ClipboardDocumentListIcon},
    {href: '/customers', label: isLv ? 'Klienti' : 'Customers', icon: UserGroupIcon},
    {href: '/projects', label: isLv ? 'Projekti' : 'Projects', icon: FolderOpenIcon},
    {href: '/quotes', label: isLv ? 'Tāmes' : 'Quotes', icon: DocumentTextIcon},
  ];

  return (
    <div className="min-h-screen bg-white text-[15px] leading-6 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/95 backdrop-blur">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
                <Image src="/logo.svg" alt="UpRoof" width={44} height={44} className="h-full w-full object-contain p-1" priority />
              </div>
              <div>
                <h1 className="text-base font-semibold text-slate-900">UpRoof CRM</h1>
                <p className="text-sm text-slate-500">{isLv ? 'Pārdošanas darba vide' : 'Sales workspace'}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <LanguageSwitcher />
              <Link
                href={`/${locale}`}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-sky-200 hover:bg-sky-50"
              >
                <HomeIcon className="h-4 w-4" />
                {isLv ? 'Mājaslapa' : 'Website'}
              </Link>
              <AdminLogout locale={locale} redirectPath={`/${locale}/crm/login`} />
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6 lg:px-8 lg:py-4">
        <aside className="sticky top-24 h-fit rounded-3xl border border-sky-100 bg-white p-4 shadow-sm lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-auto">
          <div className="mb-5 rounded-2xl bg-sky-50 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-sky-500">{isLv ? 'Navigācija' : 'Navigation'}</p>
            <p className="mt-1 text-base font-semibold text-slate-900">{isLv ? 'Līdu pārskats' : 'Lead board'}</p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={`/${locale}/crm${item.href}`}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
                >
                  <Icon className="h-5 w-5 text-sky-500" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 lg:pr-2">{children}</main>
      </div>
    </div>
  );
}
