'use client';

import {useTranslations} from 'next-intl';
import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {EnvelopeIcon, PhoneIcon} from '@heroicons/react/24/outline';

type FormData = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

export default function ContactSection() {
  const t = useTranslations('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    // Simulate form submission - replace with actual API call
    try {
      // Example: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) })
      console.log('Form data:', data);
      
      setTimeout(() => {
        setSubmitSuccess(true);
        setIsSubmitting(false);
        reset();
        setTimeout(() => setSubmitSuccess(false), 5000);
      }, 1000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <div className="w-20 h-1 bg-primary-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form - Left Side */}
          <div className="bg-gray-50 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t('formTitle') || 'Send us a message'}
            </h3>
            
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                {t('successMessage') || 'Message sent successfully!'}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2 uppercase">
                  {t('form.name')} *
                </label>
                <input
                  {...register('name', { required: true })}
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{t('form.nameError')}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-2 uppercase">
                  {t('form.phone')} *
                </label>
                <input
                  {...register('phone', { required: true })}
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{t('form.phoneError')}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-bold text-gray-900 mb-2 uppercase">
                  {t('form.message')} *
                </label>
                <textarea
                  {...register('message', { required: true })}
                  id="message"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
                {errors.message && (
                  <p className="text-red-600 text-sm mt-1">{t('form.messageError')}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 text-white px-8 py-4 text-sm font-bold uppercase hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (t('form.sending') || 'SENDING...') : (t('form.submit') || 'SEND')}
              </button>
            </form>
          </div>

          {/* Company Information - Right Side */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t('company')}
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <PhoneIcon className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 uppercase text-sm mb-1">Phone</p>
                    <a href="tel:+37125612440" className="text-primary-600 hover:text-primary-700 text-lg font-semibold">
                      +371 25612440
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <EnvelopeIcon className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900 uppercase text-sm mb-1">E-mail</p>
                    <a href="mailto:karlis.uproof@gmail.com" className="text-primary-600 hover:text-primary-700">
                      karlis.uproof@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-primary-800 shadow-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                {t('consultation')}
              </h3>
              <p className="text-primary-100 text-lg">
                {t('cta')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
