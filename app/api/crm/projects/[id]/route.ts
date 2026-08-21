import {NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {getCrmProjects} from '@/lib/crmProjectsStore';

export async function GET(_: Request, {params}: {params: Promise<{id: string}>}) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  const {id} = await params;
  const salesUser = session.role === 'sales' ? await getCrmUserByEmail(session.email) : null;

  const projects = session.role === 'sales'
    ? salesUser
      ? await getCrmProjects({assignedSalesUserId: salesUser.id, limit: 500})
      : []
    : await getCrmProjects({limit: 500});

  const project = projects.find((candidate) => candidate.id === id);

  if (!project) {
    return NextResponse.json({ok: false, error: 'Project not found'}, {status: 404});
  }

  return NextResponse.json({ok: true, project});
}