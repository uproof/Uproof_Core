'use client';

import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {
  BriefcaseIcon,
  CheckBadgeIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import type {CareerJob} from '@/lib/career';
import {getCareerJobPath} from '@/lib/careerSeo';

const careerFormUrl = 'https://tally.so/r/zxLx4q?hideTitle=1&alignLeft=1';

type Props = {
  jobs: CareerJob[];
  locale: string;
};

export default function CareerSection({jobs, locale}: Props) {
  const t = useTranslations('pages.career');
  const activeJobs = jobs.filter((job) => job.active !== false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-gray-50/60 to-white py-16 md:py-24">
      <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.94fr_1.06fr] items-start">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm">
              <BriefcaseIcon className="h-4 w-4" />
              {t('eyebrow')}
            </div>

            <div className="max-w-3xl space-y-5">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 leading-tight sm:text-5xl md:text-6xl">
                {t('title')}
              </h1>
              <p className="text-lg leading-relaxed text-gray-600">
                {t('intro')}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">{t('jobsLabel')}</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                {t('jobsTitle')}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                {t('jobsIntro')}
              </p>
            </div>

            <div className="space-y-4">
              {activeJobs.length > 0 ? activeJobs.map((job) => (
                <article key={job.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 md:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                      <p className="text-sm font-medium text-gray-500">{job.location}</p>
                    </div>
                    <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                      {job.type}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
                    <p className="text-sm leading-relaxed text-gray-600">{job.summary}</p>
                    <p className="text-sm leading-relaxed text-gray-500">{job.description}</p>
                  </div>

                  <div className="mt-6">
                    <Link
                      href={getCareerJobPath(locale, job)}
                      className="inline-flex items-center text-sm font-semibold text-primary-700 hover:text-primary-800"
                    >
                      Skatīt vakanci
                    </Link>
                  </div>
                </article>
              )) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
                  {t('jobsEmpty')}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                <ClockIcon className="mb-3 h-6 w-6 text-primary-600" />
                <p className="text-sm font-semibold text-gray-900">{t('benefits.schedule.title')}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{t('benefits.schedule.description')}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                <CheckBadgeIcon className="mb-3 h-6 w-6 text-primary-600" />
                <p className="text-sm font-semibold text-gray-900">{t('benefits.work.title')}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{t('benefits.work.description')}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                <MapPinIcon className="mb-3 h-6 w-6 text-primary-600" />
                <p className="text-sm font-semibold text-gray-900">{t('benefits.latvia.title')}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{t('benefits.latvia.description')}</p>
              </div>
            </div>
          </div>

          <div className="card-elevated border border-gray-100 p-5 md:p-6 lg:sticky lg:top-6">
            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm md:p-8 lg:p-10" id="apply">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('formTitle')}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
                {t('formIntro')}
              </p>
              <p className="mt-3 text-sm text-gray-500">{t('formHint')}</p>

              <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white p-4 shadow-inner md:p-6 lg:p-7">
                <iframe
                  src={careerFormUrl}
                  title={t('formTitle')}
                  className="h-[1260px] w-full border-0 bg-white"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
