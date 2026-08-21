import {ReactNode} from 'react';
import {headers} from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import {HomeIcon} from '@heroicons/react/24/outline';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import AdminLogout from '@/components/AdminLogout';
import {requireSalesWorkspace} from '@/lib/internalAccess';

export default async function CrmLayout({children, params}: {children: ReactNode; params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const isLv = locale === 'lv';
  await requireSalesWorkspace(locale);

  const headerStore = await headers();
  const ip = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
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
                <p className="text-sm text-slate-500">Dashboard</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <LanguageSwitcher />
              <Link
                href={`https://uproof.eu/${locale}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-sky-100 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-sky-200 hover:bg-sky-50"
              >
                <HomeIcon className="h-4 w-4" />
                {isLv ? 'Mājaslapa' : 'Website'}
              </Link>
              <AdminLogout locale={locale} redirectPath={`/${locale}/login`} />
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 sm:px-6 lg:px-8 lg:py-4">
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
