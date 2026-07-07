import Card from '@/components/Card';
import Section from '@/components/Section';
import {getCrmProjects} from '@/lib/crmProjectsStore';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';

type Props = {params: Promise<{locale: string}>};

export default async function CrmProjectsPage({params}: Props) {
  const {locale} = await params;
  const isLv = locale === 'lv';
  const session = await getAdminSession();
  let projects = await getCrmProjects();

  if (session?.role === 'sales') {
    const salesUser = await getCrmUserByEmail(session.email);
    projects = salesUser ? await getCrmProjects({assignedSalesUserId: salesUser.id}) : [];
  }

  return (
    <Section pad="sm" className="px-0 !py-0">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-600">{isLv ? 'Projekti' : 'Projects'}</p>
        <p className="mt-1 max-w-3xl text-sm text-gray-600">{isLv ? 'Šie ir dzīvi projekti, kas sinhronizējas no līdu tāmju datiem.' : 'These are live projects synced from saved lead estimate data.'}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} variant="outlined" hover={false} className="border-sky-100 bg-white">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">{project.id}</div>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{project.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{project.phase}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div>{isLv ? 'Atbildīgais' : 'Owner'}: {project.owner}</div>
              <div>{isLv ? 'Budžets' : 'Budget'}: {project.budget}</div>
              <div>{isLv ? 'Termiņš' : 'Due'}: {project.dueDate}</div>
            </div>
            <div className="mt-5 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">{isLv ? 'Estimator dati' : 'Estimator data'}</div>
              <div className="space-y-2">
                {project.estimatorData.map((row) => (
                  <div key={`${project.id}-${row.label}-${row.measurement}-${row.notes}`} className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-slate-700">
                    <div className="font-semibold text-slate-900">{row.label || '—'}</div>
                    <div>{row.measurement || '—'}</div>
                    <div className="text-slate-500">{row.notes || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
