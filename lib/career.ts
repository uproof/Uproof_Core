import fs from 'fs/promises';
import path from 'path';

export type CareerJob = {
  id: string;
  title: string;
  location: string;
  type: string;
  summary: string;
  description: string;
  active?: boolean;
  order?: number;
};

const CAREER_JOBS_FILE = path.join(process.cwd(), 'data', 'career-jobs.json');

const defaultJobs: CareerJob[] = [
  {
    id: 'professional-roofer',
    title: 'Profesionāls jumiķis',
    location: 'Rīga, Pierīga un objekti visā Latvijā',
    type: 'Pilna slodze',
    summary: 'Darbs pie kvalitatīviem jumta projektiem ar sakārtotu procesu, drošu darba vidi un stabilu komandu.',
    description: 'Ideāli piemērots pieredzējušam jumiķim, kurš pārzina jumta montāžu, precīzu mezglu izpildi un atbildīgu darbu uz objekta.',
    active: true,
    order: 1,
  },
  {
    id: 'roofing-assistant',
    title: 'Jumiķa palīgs',
    location: 'Rīga, Pierīga un objekti visā Latvijā',
    type: 'Pilna slodze',
    summary: 'Ieejas līmeņa vakance cilvēkam, kurš vēlas mācīties jumta darbus un augt kopā ar pieredzējušu komandu.',
    description: 'Piemērots kandidātam ar atbildīgu attieksmi, vēlmi strādāt fizisku darbu un apgūt jumiķa prasmes praksē.',
    active: true,
    order: 2,
  },
];

async function ensureCareerJobsFile() {
  try {
    await fs.access(CAREER_JOBS_FILE);
  } catch {
    await fs.writeFile(CAREER_JOBS_FILE, JSON.stringify(defaultJobs, null, 2), 'utf-8');
  }
}

export async function getCareerJobs(): Promise<CareerJob[]> {
  await ensureCareerJobsFile();
  const txt = await fs.readFile(CAREER_JOBS_FILE, 'utf-8');
  const jobs = JSON.parse(txt) as CareerJob[];
  return [...jobs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function saveCareerJobs(jobs: CareerJob[]) {
  await fs.writeFile(CAREER_JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf-8');
}

export function normalizeCareerJob(job: CareerJob): CareerJob {
  return {
    ...job,
    active: job.active ?? true,
    order: Number.isFinite(job.order) ? Number(job.order) : 0,
  };
}
