import fs from 'fs/promises';
import path from 'path';
import {slugifyCareerTitle} from '@/lib/careerSeo';

export type CareerJob = {
  id: string;
  slug: string;
  title: string;
  location: string;
  addressLocality?: string;
  addressRegion?: string;
  addressCountry?: string;
  type: string;
  summary: string;
  description: string;
  datePosted?: string;
  validThrough?: string;
  updatedAt?: string;
  active?: boolean;
  order?: number;
};

const CAREER_JOBS_FILE = path.join(process.cwd(), 'data', 'career-jobs.json');

const defaultJobs: CareerJob[] = [
  {
    id: 'professional-roofer',
    slug: 'profesionals-jumikis',
    title: 'Profesionāls jumiķis',
    location: 'Rīga, Pierīga un objekti visā Latvijā',
    type: 'Pilna slodze',
    summary: 'Darbs pie kvalitatīviem jumta projektiem ar sakārtotu procesu, drošu darba vidi un stabilu komandu.',
    description: 'Ideāli piemērots pieredzējušam jumiķim, kurš pārzina jumta montāžu, precīzu mezglu izpildi un atbildīgu darbu uz objekta.',
    addressLocality: 'Riga',
    addressRegion: 'Pierīga',
    addressCountry: 'LV',
    datePosted: '2026-06-01',
    validThrough: '2026-09-01',
    updatedAt: '2026-06-01T00:00:00.000Z',
    active: true,
    order: 1,
  },
  {
    id: 'roofing-assistant',
    slug: 'jumika-paligs',
    title: 'Jumiķa palīgs',
    location: 'Rīga, Pierīga un objekti visā Latvijā',
    type: 'Pilna slodze',
    summary: 'Ieejas līmeņa vakance cilvēkam, kurš vēlas mācīties jumta darbus un augt kopā ar pieredzējušu komandu.',
    description: 'Piemērots kandidātam ar atbildīgu attieksmi, vēlmi strādāt fizisku darbu un apgūt jumiķa prasmes praksē.',
    addressLocality: 'Riga',
    addressRegion: 'Pierīga',
    addressCountry: 'LV',
    datePosted: '2026-06-01',
    validThrough: '2026-09-01',
    updatedAt: '2026-06-01T00:00:00.000Z',
    active: true,
    order: 2,
  },
];

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function readCareerText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseCareerJobsFile(content: string): CareerJob[] {
  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(isRecord)
      .filter((job) => {
        return (
          readCareerText(job.title) &&
          readCareerText(job.location) &&
          readCareerText(job.type) &&
          readCareerText(job.summary) &&
          readCareerText(job.description)
        );
      })
      .map((job, index) =>
        normalizeCareerJob({
          id: readCareerText(job.id) || `career-job-${index + 1}`,
          slug: readCareerText(job.slug),
          title: readCareerText(job.title),
          location: readCareerText(job.location),
          addressLocality: readCareerText(job.addressLocality) || undefined,
          addressRegion: readCareerText(job.addressRegion) || undefined,
          addressCountry: readCareerText(job.addressCountry) || undefined,
          type: readCareerText(job.type),
          summary: readCareerText(job.summary),
          description: readCareerText(job.description),
          datePosted: readCareerText(job.datePosted) || undefined,
          validThrough: readCareerText(job.validThrough) || undefined,
          updatedAt: readCareerText(job.updatedAt) || undefined,
          active: typeof job.active === 'boolean' ? job.active : undefined,
          order: typeof job.order === 'number' && Number.isFinite(job.order) ? job.order : undefined,
        }),
      );
  } catch {
    return [];
  }
}

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
  const jobs = parseCareerJobsFile(txt);
  return [...jobs]
    .map((job) => normalizeCareerJob(job))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function saveCareerJobs(jobs: CareerJob[]) {
  await fs.writeFile(CAREER_JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf-8');
}

export function normalizeCareerJob(job: CareerJob): CareerJob {
  const now = new Date();
  return {
    ...job,
    slug: job.slug?.trim() || slugifyCareerTitle(job.title),
    active: job.active ?? true,
    order: Number.isFinite(job.order) ? Number(job.order) : 0,
    addressLocality: job.addressLocality || 'Riga',
    addressRegion: job.addressRegion || 'Pierīga',
    addressCountry: job.addressCountry || 'LV',
    datePosted: job.datePosted || toIsoDate(now),
    validThrough: job.validThrough || toIsoDate(addDays(now, 90)),
    updatedAt: job.updatedAt || now.toISOString(),
  };
}

export function getCareerJobBySlug(jobs: CareerJob[], slug: string) {
  return jobs.find((job) => job.slug === slug);
}
