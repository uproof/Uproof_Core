'use client';

import {useTranslations} from 'next-intl';
import {type FormEvent, useState} from 'react';
import {ValidationError, useForm} from '@formspree/react';
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

const allowedFileTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
]);

export default function CareerSection() {
  const t = useTranslations('pages.career');
  const [submitError, setSubmitError] = useState('');
  const [state, handleSubmit] = useForm('xgoqdodr');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    setSubmitError('');

    const formData = new FormData(event.currentTarget);
    const file = formData.get('cv');

    if (!(file instanceof File)) {
      setSubmitError(t('fields.fileError'));
      return;
    }

    if (!allowedFileTypes.has(file.type) || file.size > 10 * 1024 * 1024) {
      setSubmitError(t('fields.fileError'));
      return;
    }

    await handleSubmit(event);
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white via-gray-50/40 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-start">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm">
              <BriefcaseIcon className="h-4 w-4" />
              {t('eyebrow')}
            </div>

            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
                {t('title')}
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-gray-600 leading-relaxed">
                {t('intro')}
              </p>
              {/* Categories we are hiring for */}
              <div className="mt-4">
                <p className="font-semibold text-gray-800">{t('categoriesTitle')}</p>
                <ul className="mt-2 list-decimal list-inside text-gray-600">
                  <li>{t('categories.one')}</li>
                  <li>{t('categories.two')}</li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-900 text-white p-6 md:p-7 shadow-soft-xl">
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                    {t('benefitsLabel')}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-white">
                    {t('benefitsTitle')}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-gray-300 leading-relaxed">
                    {t('benefitsIntro')}
                  </p>
                </div>

                <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-3 divide-y divide-white/10 sm:divide-y-0 sm:divide-x">
                  <div className="p-5">
                    <ClockIcon className="h-6 w-6 text-gray-200 mb-3" />
                    <p className="text-sm font-semibold text-white">{t('benefits.schedule.title')}</p>
                    <p className="mt-1 text-sm text-gray-300 leading-relaxed">{t('benefits.schedule.description')}</p>
                  </div>
                  <div className="p-5">
                    <CheckBadgeIcon className="h-6 w-6 text-gray-200 mb-3" />
                    <p className="text-sm font-semibold text-white">{t('benefits.work.title')}</p>
                    <p className="mt-1 text-sm text-gray-300 leading-relaxed">{t('benefits.work.description')}</p>
                  </div>
                  <div className="p-5">
                    <MapPinIcon className="h-6 w-6 text-gray-200 mb-3" />
                    <p className="text-sm font-semibold text-white">{t('benefits.latvia.title')}</p>
                    <p className="mt-1 text-sm text-gray-300 leading-relaxed">{t('benefits.latvia.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-elevated border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900">{t('formTitle')}</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">{t('formIntro')}</p>
            <p className="mt-2 text-sm text-gray-500">{t('formHint')}</p>

            {submitError && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {submitError}
              </div>
            )}

            <ValidationError
              errors={state.errors}
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm"
            />

            {state.succeeded && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
                {t('fields.success')}
              </div>
            )}

            <form
              action="https://formspree.io/f/xgoqdodr"
              method="POST"
              encType="multipart/form-data"
              onSubmit={onSubmit}
              className="mt-6 space-y-5"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">{t('fields.fullName')} <span className="text-red-500">*</span></label>
                  <input
                    name="fullName"
                    id="fullName"
                    type="text"
                    required
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-3 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder={t('fields.fullName')}
                  />
                  <ValidationError field="fullName" errors={state.errors} className="mt-1.5 text-sm text-red-500" />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">{t('fields.email')} <span className="text-red-500">*</span></label>
                  <input
                    name="email"
                    id="email"
                    type="email"
                    required
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-3 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="you@example.com"
                  />
                  <ValidationError field="email" errors={state.errors} className="mt-1.5 text-sm text-red-500" />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">{t('fields.phone')}</label>
                  <input
                    name="phone"
                    id="phone"
                    type="tel"
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-3 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="+371 ..."
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">{t('fields.location')}</label>
                  <input
                    name="location"
                    id="location"
                    type="text"
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-3 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder={t('fields.locationPlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">{t('fields.experience')}</label>
                <input
                  name="experience"
                  id="experience"
                  type="text"
                  className="w-full border border-gray-200 bg-gray-50 px-4 py-3 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder={t('fields.experiencePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">{t('fields.message')}</label>
                <textarea
                  name="message"
                  id="message"
                  rows={5}
                  className="w-full resize-none border border-gray-200 bg-gray-50 px-4 py-3 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder={t('fields.messagePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="cv" className="block text-sm font-medium text-gray-700 mb-2">{t('fields.cv')} <span className="text-red-500">*</span></label>
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-5">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <DocumentArrowUpIcon className="h-6 w-6 text-primary-600" />
                    <span>{t('formHint')}</span>
                  </div>
                  <input
                    name="cv"
                    id="cv"
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-700"
                  />
                </div>
                <ValidationError field="cv" errors={state.errors} className="mt-1.5 text-sm text-red-500" />
              </div>

              <button
                type="submit"
                disabled={state.submitting}
                className="btn btn-primary w-full gap-2 px-6 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.submitting ? t('fields.sending') : t('fields.submit')}
                {!state.submitting && <ArrowRightIcon className="h-5 w-5" />}
              </button>
            </form>

          </div>
        </div>
      </div>
    </section>
  );
}