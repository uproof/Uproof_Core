import {unstable_setRequestLocale} from 'next-intl/server';
import {useTranslations} from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('pages.about');
  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-24 pb-10 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-4 text-gray-700 max-w-3xl">
            {t('description')}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold mb-2">{t('values.quality.title')}</h3>
            <p className="text-gray-600">{t('values.quality.description')}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold mb-2">{t('values.reliability.title')}</h3>
            <p className="text-gray-600">{t('values.reliability.description')}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold mb-2">{t('values.safety.title')}</h3>
            <p className="text-gray-600">{t('values.safety.description')}</p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
