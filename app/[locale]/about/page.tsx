import {unstable_setRequestLocale, getTranslations} from 'next-intl/server';
import {useTranslations} from 'next-intl';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import MiersMethod from '@/components/MiersMethod';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: 'pages.about'});
  
  return {
    title: 'About UpRoof | Professional Roofing Company Latvia',
    description: 'UpRoof: certified roofing specialists in Latvia. 10-year warranty, quality materials, expert workmanship. Learn about our MIERS construction method.',
    alternates: {
      canonical: `https://uproof.eu/${locale}/about`
    }
  };
}

export default function AboutPage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('pages.about');
  return (
    <main className="min-h-screen">
      <Header />
      <Breadcrumbs />
      <section className="pt-24 pb-10 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-4 text-gray-700 max-w-3xl">
            {t('description')}
          </p>
          {/* M-I-E-R-S method window for all languages */}
          <MiersMethod locale={locale} />
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          {['quality','reliability','certified','guarantee','contract','fixedcost','payment','partners','insurance'].map((key) => (
            <div key={key} className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-xl font-extrabold mb-2 uppercase tracking-wide">{t(`values.${key}.title`)}</h3>
              <p className="text-gray-600">{t(`values.${key}.description`)}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
