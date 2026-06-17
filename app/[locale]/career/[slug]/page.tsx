import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {getCareerJobs, getCareerJobBySlug} from '@/lib/career';
import {getCareerJobStructuredData, getCareerJobUrl} from '@/lib/careerSeo';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{locale: string; slug: string}>;
};

const pageTitles: Record<string, string> = {
  lv: 'Darbs Jumiķiem Rīgā | UpRoof',
  en: 'Roofing Job at UpRoof | Latvia',
  'nl-BE': 'Dakwerk vacature bij UpRoof | Letland',
};

const pageDescriptions: Record<string, string> = {
  lv: 'Skatiet pilnu vakances aprakstu, darba pienākumus un pieteikšanās informāciju.',
  en: 'View the full job description, responsibilities, and application details.',
  'nl-BE': 'Bekijk de volledige vacature, verantwoordelijkheden en sollicitatie-informatie.',
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;
  const jobs = await getCareerJobs();
  const job = getCareerJobBySlug(jobs, slug);

  if (!job) {
    return {
      title: pageTitles[locale] || pageTitles.lv,
      description: pageDescriptions[locale] || pageDescriptions.lv,
    };
  }

  const title = `${job.title} | ${pageTitles[locale] || pageTitles.lv}`;
  const description = job.summary;
  const canonical = getCareerJobUrl(locale, job);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        lv: `https://uproof.eu/lv/career/${job.slug}`,
        en: `https://uproof.eu/en/career/${job.slug}`,
        'nl-BE': `https://uproof.eu/nl-BE/career/${job.slug}`,
        'x-default': `https://uproof.eu/lv/career/${job.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      siteName: 'UpRoof',
      images: [
        {
          url: '/images/icons/career-header.png',
          width: 1200,
          height: 630,
          alt: job.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/icons/career-header.png'],
    },
  };
}

export default async function CareerJobPage({params}: Props) {
  const {locale, slug} = await params;
  const t = await getTranslations({locale, namespace: 'pages.career'});
  const jobs = await getCareerJobs();
  const job = getCareerJobBySlug(jobs, slug);

  if (!job) {
    notFound();
  }

  const jobUrl = getCareerJobUrl(locale, job);
  const activeJobs = jobs.filter((entry) => entry.active !== false);
  const relatedJobs = activeJobs.filter((entry) => entry.slug !== job.slug).slice(0, 3);
  const structuredData = getCareerJobStructuredData(job, locale, jobUrl);

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <nav aria-label="Breadcrumb" className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href={`/${locale}`} className="hover:text-primary-600">
                {t('heroKicker')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/${locale}/career`} className="hover:text-primary-600">
                {t('jobsLabel')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-gray-900">{job.title}</li>
          </ol>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/75 via-primary-900/60 to-primary-900/80" />
        <div className="absolute inset-0 bg-noise opacity-10" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-300">{t('heroKicker')}</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">{job.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-200">{job.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-white/10 px-4 py-2">{job.type}</span>
              <span className="rounded-full bg-white/10 px-4 py-2">{job.location}</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <h2 className="text-2xl font-bold">{t('formTitle')}</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-200">{t('formIntro')}</p>
            <div className="mt-6 rounded-2xl bg-white p-4 shadow-inner">
              <iframe
                src="https://tally.so/r/zxLx4q?hideTitle=1&alignLeft=1"
                title={t('formTitle')}
                className="h-[980px] w-full border-0 bg-white"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData)}} />

      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
            <p className="mt-4 text-gray-600">{job.description}</p>

            <dl className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-gray-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{t('jobsLabel')}</dt>
                <dd className="mt-2 text-sm font-medium text-gray-900">{job.type}</dd>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Location</dt>
                <dd className="mt-2 text-sm font-medium text-gray-900">{job.location}</dd>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Apply by</dt>
                <dd className="mt-2 text-sm font-medium text-gray-900">{job.validThrough}</dd>
              </div>
            </dl>
          </article>

          <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-gray-900">{t('formPanelTitle')}</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">{t('formPanelIntro')}</p>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li>• {job.summary}</li>
              <li>• {job.type}</li>
              <li>• {job.location}</li>
            </ul>

            {relatedJobs.length > 0 ? (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                  {locale === 'lv' ? 'Citas vakances' : locale === 'nl-BE' ? 'Andere vacatures' : 'Other openings'}
                </h3>
                <ul className="mt-4 space-y-3">
                  {relatedJobs.map((entry) => (
                    <li key={entry.id}>
                      <Link
                        href={`/${locale}/career/${entry.slug}`}
                        className="text-sm font-medium text-primary-700 hover:text-primary-800"
                      >
                        {entry.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}