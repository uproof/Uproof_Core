import {unstable_setRequestLocale} from 'next-intl/server';
import {useTranslations} from 'next-intl';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Services from '@/components/Services';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const canonical = `https://uproof.eu/${locale}/services`;
  const languages = {
    lv: 'https://uproof.eu/lv/services',
    en: 'https://uproof.eu/en/services',
    'nl-BE': 'https://uproof.eu/nl-BE/services',
    'x-default': 'https://uproof.eu/lv/services'
  };

  return {
    title: 'Roofing Services Latvia | Construction & Repair',
    description: 'Complete roofing services: construction, repairs, painting, metal roofing, tile installation. 10-year warranty. Free quotes in Latvia.',
    alternates: {
      canonical,
      languages
    }
  };
}

export default function ServicesPage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('pages.services');
  return (
    <main className="min-h-screen">
      <Header />
      <Breadcrumbs />
      <section className="pt-14 pb-4 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{t('title')}</h1>
        </div>
      </section>
      <Services />
      <Footer />
    </main>
  );
}
