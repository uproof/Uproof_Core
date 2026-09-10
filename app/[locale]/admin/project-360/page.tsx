import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmProjects} from '@/lib/crmProjectsStore';
import CmsProjectOverviewClient from './CmsProjectOverviewClient';

type Props = {params: Promise<{locale: string}>};

export default async function AdminProject360Page({params}: Props) {
  const {locale} = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  if (session.role !== 'superadmin') {
    redirect(`/${locale}/crm`);
  }

  const projects = await getCrmProjects({limit: 500, includeAll: true});

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Projects</h2>
        </div>
        <Link href={`/${locale}/admin`} className="inline-flex items-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
          Back to Dashboard
        </Link>
      </div>

      <div className="mt-6">
        <CmsProjectOverviewClient locale={locale} projects={projects} />
      </div>

    </div>
  );
}