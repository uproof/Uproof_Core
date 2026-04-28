'use client';

import {useLocale, useMessages, useTranslations} from 'next-intl';
import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {EnvelopeIcon, PhoneIcon} from '@heroicons/react/24/outline';
import {sanitizeInput, sanitizeEmail, sanitizePhone} from '@/lib/sanitize';

type FormData = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

export default function ContactSection() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const messages = useMessages() as {
    contact?: {
      intro?: string;
    };
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const introByLocale: Record<string, string> = {
    en: "Have a project in mind? We'd love to hear from you.",
    lv: 'Ir kāds projekts prātā? Mēs labprāt par to uzzinātu.',
    'nl-BE': 'Heeft u een project in gedachten? We horen graag van u.'
  };

  const contactIntro = messages.contact?.intro || introByLocale[locale] || introByLocale.en;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    // Sanitize all inputs
    const sanitizedData = {
      name: sanitizeInput(data.name),
      email: sanitizeEmail(data.email),
      phone: sanitizePhone(data.phone || ''),
      message: sanitizeInput(data.message)
    };
    
    // Validate required fields (name, email, message are required)
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.message) {
      alert('Please fill in all required fields correctly.');
      setIsSubmitting(false);
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedData.email)) {
      alert('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }
    
    // Validate API key is configured
    const apiKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
    
    if (!apiKey || apiKey === 'YOUR_WEB3FORMS_KEY_HERE') {
      alert('Contact form is not configured yet. Please contact us directly at karlis.uproof@gmail.com or call +371 25612440');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Save to admin contact messages database
      const msgResponse = await fetch('/api/admin/contact-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: sanitizedData.name,
          email: sanitizedData.email,
          phone: sanitizedData.phone || undefined,
          subject: sanitizedData.name + ' - Contact Form Submission',
          message: sanitizedData.message,
        })
      });

      // Using Web3Forms API - FREE service to receive emails
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: apiKey,
          name: sanitizedData.name,
          phone: sanitizedData.phone,
          email: sanitizedData.email,
          message: sanitizedData.message,
          subject: 'New Contact Form Submission from UpRoof Website'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setSubmitSuccess(true);
        setIsSubmitting(false);
        reset();
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
      alert('There was an error sending your message. Please try again or contact us directly at karlis.uproof@gmail.com or +371 25612440');
    }
  };

  return (
    <section id="contact" className="py-20 md:py-24 bg-gradient-to-b from-white via-gray-50/30 to-white">
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            {t('title')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {contactIntro}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form - Left Side */}
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-card border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {t('formTitle') || 'Send us a message'}
            </h3>
            
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('successMessage') || 'Message sent successfully!'}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.name')} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name', { required: true })}
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  placeholder={t('form.namePlaceholder') || 'Your name'}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1.5">{t('form.nameError')}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.phone')}
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  placeholder="+371 XXXXXXXX"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1.5">{t('form.phoneError')}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.email')} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('email', { 
                    required: true,
                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
                  })}
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1.5">{t('form.emailError') || 'Valid email is required'}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.message')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('message', { required: true })}
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white transition-all duration-200 resize-none"
                  placeholder={t('form.messagePlaceholder') || 'Tell us about your project...'}
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1.5">{t('form.messageError')}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 text-white px-8 py-4 font-semibold hover:bg-primary-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('form.sending') || 'Sending...'}
                  </>
                ) : (
                  <>
                    {t('form.submit') || 'Send Message'}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Company Information - Right Side */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {t('company')}
              </h3>
              
              <div className="space-y-5">
                <a href="tel:+37125612440" className="flex items-center gap-4 p-4 rounded-xl bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-all duration-300 group shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-primary-600 border border-primary-600 flex items-center justify-center transition-colors group-hover:bg-primary-500 group-hover:border-primary-500">
                    <PhoneIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-600 mb-0.5 font-medium">Phone</p>
                    <p className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-primary-900">
                      +371 25612440
                    </p>
                  </div>
                </a>

                <a href="mailto:karlis.uproof@gmail.com" className="flex items-center gap-4 p-4 rounded-xl bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-all duration-300 group shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-primary-600 border border-primary-600 flex items-center justify-center transition-colors group-hover:bg-primary-500 group-hover:border-primary-500">
                    <EnvelopeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-600 mb-0.5 font-medium">Email</p>
                    <p className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-primary-900">
                      karlis.uproof@gmail.com
                    </p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white rounded-2xl shadow-xl relative overflow-hidden">
              {/* Subtle pattern */}
              <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
              
              <div className="relative">
                <h3 className="text-xl font-bold mb-3">
                  {t('consultation')}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {t('cta')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
