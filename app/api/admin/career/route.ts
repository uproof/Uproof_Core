import {NextRequest, NextResponse} from 'next/server';
import {isAdminAuthenticated} from '@/lib/adminAuth';
import fs from 'fs/promises';
import path from 'path';
import {CareerJob, getCareerJobs, normalizeCareerJob, saveCareerJobs} from '@/lib/career';

const CAREER_JOBS_FILE = path.join(process.cwd(), 'data', 'career-jobs.json');

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
      title,
      location,
      type,
      summary,
      description,
      active: body.active !== false,
      order: Number(body.order ?? jobs.length + 1),
    });

    const nextJobs = [...jobs, newJob].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    await saveCareerJobs(nextJobs);

    return NextResponse.json({job: newJob}, {status: 201});
  } catch (error) {
    console.error('Error creating career job:', error);
    return NextResponse.json({error: 'Failed to create career job'}, {status: 500});
  }
}
