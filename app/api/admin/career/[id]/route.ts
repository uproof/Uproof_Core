import {NextRequest, NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {isAdminAuthenticated} from '@/lib/adminAuth';
import {CareerJob, getCareerJobs, normalizeCareerJob, saveCareerJobs} from '@/lib/career';
import {pingGoogleSitemap} from '@/lib/careerSeo';

function refreshCareerArtifacts(jobs: CareerJob[]) {
  for (const locale of ['lv', 'en', 'nl-BE']) {
    revalidatePath(`/${locale}/career`);
    for (const job of jobs.filter((item) => item.active !== false)) {
      revalidatePath(`/${locale}/career/${job.slug}`);
    }
  }

  revalidatePath('/career-sitemap.xml');
  revalidatePath('/sitemap_index.xml');
}

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
      datePosted: String(body.datePosted ?? current.datePosted ?? new Date().toISOString().slice(0, 10)),
      validThrough: String(body.validThrough ?? current.validThrough ?? '2026-09-01'),
      addressLocality: String(body.addressLocality ?? current.addressLocality ?? 'Riga'),
      addressRegion: String(body.addressRegion ?? current.addressRegion ?? 'Pierīga'),
      addressCountry: String(body.addressCountry ?? current.addressCountry ?? 'LV'),
      updatedAt: new Date().toISOString(),
    });

    if (!updated.title || !updated.location || !updated.type || !updated.summary || !updated.description) {
      return NextResponse.json({error: 'Missing required fields'}, {status: 400});
    }

    jobs[index] = updated;
    jobs.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    await saveCareerJobs(jobs);
    refreshCareerArtifacts(jobs);
    await pingGoogleSitemap('https://uproof.eu/career-sitemap.xml');

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
    refreshCareerArtifacts(nextJobs);
    await pingGoogleSitemap('https://uproof.eu/career-sitemap.xml');
    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Error deleting career job:', error);
    return NextResponse.json({error: 'Failed to delete career job'}, {status: 500});
  }
}
