import type {CareerJob} from '@/lib/career';

export const CAREER_LOCALES = ['lv', 'en', 'nl-BE'] as const;

export function slugifyCareerTitle(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getCareerJobPath(locale: string, job: Pick<CareerJob, 'slug'>) {
  return `/${locale}/career/${job.slug}`;
}

export function getCareerJobUrl(locale: string, job: Pick<CareerJob, 'slug'>) {
  return `https://uproof.eu${getCareerJobPath(locale, job)}`;
}

export function getCareerJobStructuredData(job: CareerJob, locale: string, jobUrl?: string) {
  const url = jobUrl || getCareerJobUrl(locale, job);

  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    '@id': `${url}#jobposting`,
    title: job.title,
    description: `${job.summary} ${job.description}`.trim(),
    datePosted: job.datePosted,
    validThrough: job.validThrough,
    employmentType: normalizeEmploymentType(job.type),
    hiringOrganization: {
      '@type': 'Organization',
      '@id': 'https://uproof.eu/#organization',
      name: 'UpRoof',
      sameAs: 'https://uproof.eu',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rīga',
        addressLocality: job.addressLocality || 'Riga',
        addressRegion: job.addressRegion || 'Pierīga',
        postalCode: 'LV-1000',
        addressCountry: job.addressCountry || 'LV',
      },
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'EUR',
      value: 'competitive salary',
    },
    url,
  };
}

export function normalizeEmploymentType(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes('pilna') || normalized.includes('full')) {
    return 'FULL_TIME';
  }

  if (normalized.includes('part') || normalized.includes('daļ')) {
    return 'PART_TIME';
  }

  return 'FULL_TIME';
}

export function getCareerSitemapEntries(jobs: CareerJob[]) {
  return CAREER_LOCALES.flatMap((locale) =>
    jobs
      .filter((job) => job.active !== false)
      .map((job) => ({
        url: `https://uproof.eu${getCareerJobPath(locale, job)}`,
        lastmod: job.updatedAt || job.validThrough || job.datePosted || new Date().toISOString(),
      })),
  );
}

export async function pingGoogleSitemap(sitemapUrl: string) {
  try {
    await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, {
      method: 'GET',
      cache: 'no-store',
    });
  } catch {
    // Best-effort ping only.
  }
}