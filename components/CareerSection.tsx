'use client';

import {useTranslations} from 'next-intl';
import {
  BriefcaseIcon,
  CheckBadgeIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const careerFormUrl = 'https://tally.so/r/zxLx4q?hideTitle=1&transparentBackground=1&alignLeft=1';

export default function CareerSection() {
  const t = useTranslations('pages.career');

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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <UserGroupIcon className="h-5 w-5 text-primary-600" />
                  <p className="text-sm font-semibold text-gray-900">{t('categoriesTitle')}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700">
                    {t('categories.one')}
                  </span>
                  <span className="rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700">
                    {t('categories.two')}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <SparklesIcon className="h-5 w-5 text-primary-600" />
                  <p className="text-sm font-semibold text-gray-900">{t('benefitsLabel')}</p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{t('benefitsIntro')}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">{t('benefitsLabel')}</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                {t('benefitsTitle')}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                {t('benefitsIntro')}
              </p>
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
            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm md:p-8 lg:p-10">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t('formTitle')}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
                {t('formIntro')}
              </p>
              <p className="mt-3 text-sm text-gray-500">{t('formHint')}</p>

              <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-gray-200 bg-gray-50 p-3 shadow-inner md:p-5 lg:p-6">
                <iframe
                  src={careerFormUrl}
                  title={t('formTitle')}
                  className="h-[1450px] w-full border-0 bg-white"
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
