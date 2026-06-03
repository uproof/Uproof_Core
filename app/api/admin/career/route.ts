import {NextRequest, NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {isAdminAuthenticated} from '@/lib/adminAuth';
import {CareerJob, getCareerJobs, normalizeCareerJob, saveCareerJobs} from '@/lib/career';
import {pingGoogleSitemap, slugifyCareerTitle} from '@/lib/careerSeo';

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

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const jobs = await getCareerJobs();
    return NextResponse.json({jobs});
  } catch (error) {
    console.error('Error reading career jobs:', error);
    return NextResponse.json({error: 'Failed to read career jobs'}, {status: 500});
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  try {
    const body = await request.json();
    const title = String(body.title || '').trim();
    const location = String(body.location || '').trim();
    const type = String(body.type || '').trim();
    const summary = String(body.summary || '').trim();
    const description = String(body.description || '').trim();

    if (!title || !location || !type || !summary || !description) {
      return NextResponse.json({error: 'Missing required fields'}, {status: 400});
    }

    const jobs = await getCareerJobs();
    const id = String(body.id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `job-${Date.now()}`);

    const newJob: CareerJob = normalizeCareerJob({
      id,
      slug: body.slug ? String(body.slug).trim() : slugifyCareerTitle(title),
      title,
      location,
      type,
      summary,
      description,
      active: body.active !== false,
      order: Number(body.order ?? jobs.length + 1),
      datePosted: String(body.datePosted || new Date().toISOString().slice(0, 10)),
      validThrough: String(body.validThrough || '2026-09-01'),
      addressLocality: String(body.addressLocality || 'Riga'),
      addressRegion: String(body.addressRegion || 'Pierīga'),
      addressCountry: String(body.addressCountry || 'LV'),
      updatedAt: new Date().toISOString(),
    });

    const nextJobs = [...jobs, newJob].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    await saveCareerJobs(nextJobs);
    refreshCareerArtifacts(nextJobs);
    await pingGoogleSitemap('https://uproof.eu/career-sitemap.xml');

    return NextResponse.json({job: newJob}, {status: 201});
  } catch (error) {
    console.error('Error creating career job:', error);
    return NextResponse.json({error: 'Failed to create career job'}, {status: 500});
  }
}
