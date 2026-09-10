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
        <div className="flex items-center gap-2 text-sm"><Link href={`/${locale}/admin`} className="font-semibold text-sky-700 hover:text-sky-900">Dashboard</Link><span className="text-slate-400">/</span><span className="font-semibold text-slate-700">Projects</span></div>
      </div>

      <div className="mt-6">
        <CmsProjectOverviewClient locale={locale} projects={projects} />
      </div>

    </div>
  );
}