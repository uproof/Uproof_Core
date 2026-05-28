'use client';

import {useTranslations} from 'next-intl';
import {useRef, useState} from 'react';
import {useForm} from 'react-hook-form';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import {sanitizeEmail, sanitizeInput, sanitizePhone} from '@/lib/sanitize';

type CareerFormValues = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  message: string;
  hCaptchaToken: string;
  cv: FileList;
};

const allowedFileTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf',
]);

export default function CareerSection() {
  const t = useTranslations('pages.career');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const captchaRef = useRef<HCaptcha | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: {errors},
  } = useForm<CareerFormValues>();

  const captchaToken = watch('hCaptchaToken');

  const onCaptchaVerify = (token: string) => {
    setValue('hCaptchaToken', token, {shouldValidate: true});
    setSubmitError('');
  };

  const onCaptchaExpire = () => {
    setValue('hCaptchaToken', '', {shouldValidate: true});
  };

  const onSubmit = async (data: CareerFormValues) => {
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    const file = data.cv?.[0];
    if (!file) {
      setSubmitError(t('fields.fileError'));
      setIsSubmitting(false);
      return;
    }

    if (!allowedFileTypes.has(file.type) || file.size > 10 * 1024 * 1024) {
      setSubmitError(t('fields.fileError'));
      setIsSubmitting(false);
      return;
    }

    const payload = new FormData();
    payload.append('_subject', `UpRoof career application - ${sanitizeInput(data.fullName)}`);
    payload.append('_replyto', sanitizeEmail(data.email));
    payload.append('fullName', sanitizeInput(data.fullName));
    payload.append('email', sanitizeEmail(data.email));
    payload.append('phone', sanitizePhone(data.phone));
    payload.append('location', sanitizeInput(data.location));
    payload.append('experience', sanitizeInput(data.experience));
    payload.append('message', sanitizeInput(data.message));
    payload.append('h-captcha-response', data.hCaptchaToken || '');
    payload.append('cv', file, file.name);

    try {
      if (!data.hCaptchaToken) {
        throw new Error(t('fields.captchaError'));
      }

      const response = await fetch('/api/career', {
        method: 'POST',
        body: payload,
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || t('fields.error'));
      }

      setSubmitSuccess(true);
      reset();
      captchaRef.current?.resetCaptcha();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting career application:', error);
      setSubmitError(error instanceof Error ? error.message : t('fields.error'));
      captchaRef.current?.resetCaptcha();
      setValue('hCaptchaToken', '', {shouldValidate: true});
    } finally {
      setIsSubmitting(false);
    }
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

            {submitSuccess && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
                {t('fields.success')}
              </div>
            )}

            {submitError && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">{t('fields.fullName')} <span className="text-red-500">*</span></label>
                  <input
                    {...register('fullName', {required: t('fields.requiredError')})}
                    id="fullName"
                    type="text"
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-3 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder={t('fields.fullName')}
                  />
                  {errors.fullName && <p className="mt-1.5 text-sm text-red-500">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">{t('fields.email')} <span className="text-red-500">*</span></label>
                  <input
                    {...register('email', {
                      required: t('fields.requiredError'),
                      pattern: {value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t('fields.email')},
                    })}
                    id="email"
                    type="email"
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-3 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">{t('fields.phone')}</label>
                  <input
                    {...register('phone')}
                    id="phone"
                    type="tel"
                    className="w-full border border-gray-200 bg-gray-50 px-4 py-3 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="+371 ..."
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">{t('fields.location')}</label>
                  <input
                    {...register('location')}
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
                  {...register('experience')}
                  id="experience"
                  type="text"
                  className="w-full border border-gray-200 bg-gray-50 px-4 py-3 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all"
                  placeholder={t('fields.experiencePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">{t('fields.message')}</label>
                <textarea
                  {...register('message')}
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
                    {...register('cv', {required: t('fields.requiredError')})}
                    id="cv"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-700"
                  />
                </div>
                {errors.cv && <p className="mt-1.5 text-sm text-red-500">{errors.cv.message}</p>}
              </div>

              <input
                type="hidden"
                {...register('hCaptchaToken', {required: t('fields.captchaError')})}
              />
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                <HCaptcha
                  ref={captchaRef}
                  sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2"
                  reCaptchaCompat={false}
                  onVerify={onCaptchaVerify}
                  onExpire={onCaptchaExpire}
                />
                {errors.hCaptchaToken && (
                  <p className="mt-2 text-sm text-red-500">{errors.hCaptchaToken.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !captchaToken}
                className="btn btn-primary w-full gap-2 px-6 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('fields.sending') : t('fields.submit')}
                {!isSubmitting && <ArrowRightIcon className="h-5 w-5" />}
              </button>
            </form>

          </div>
        </div>
      </div>
    </section>
  );
}