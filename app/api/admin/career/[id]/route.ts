import {NextRequest, NextResponse} from 'next/server';
import {isAdminAuthenticated} from '@/lib/adminAuth';
import {CareerJob, getCareerJobs, normalizeCareerJob, saveCareerJobs} from '@/lib/career';

export async function PATCH(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const {id} = await params;
    const body = await request.json();
    const jobs = await getCareerJobs();
    const index = jobs.findIndex((job) => job.id === id);

    if (index === -1) {
      return NextResponse.json({error: 'Career job not found'}, {status: 404});
    }

    const current = jobs[index];
    const updated: CareerJob = normalizeCareerJob({
      ...current,
      title: String(body.title ?? current.title).trim(),
      location: String(body.location ?? current.location).trim(),
      type: String(body.type ?? current.type).trim(),
      summary: String(body.summary ?? current.summary).trim(),
      description: String(body.description ?? current.description).trim(),
      active: body.active ?? current.active,
      order: Number(body.order ?? current.order ?? index + 1),
    });

    if (!updated.title || !updated.location || !updated.type || !updated.summary || !updated.description) {
      return NextResponse.json({error: 'Missing required fields'}, {status: 400});
    }

    jobs[index] = updated;
    jobs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    await saveCareerJobs(jobs);

    return NextResponse.json({job: updated});
  } catch (error) {
    console.error('Error updating career job:', error);
    return NextResponse.json({error: 'Failed to update career job'}, {status: 500});
  }
}

export async function DELETE(_: NextRequest, {params}: {params: Promise<{id: string}>}) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const {id} = await params;
    const jobs = await getCareerJobs();
    const nextJobs = jobs.filter((job) => job.id !== id);

    if (nextJobs.length === jobs.length) {
      return NextResponse.json({error: 'Career job not found'}, {status: 404});
    }

    await saveCareerJobs(nextJobs);
    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Error deleting career job:', error);
    return NextResponse.json({error: 'Failed to delete career job'}, {status: 500});
  }
}
