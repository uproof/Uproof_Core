import {unstable_setRequestLocale} from 'next-intl/server';
import {use} from 'react';
import {useTranslations} from 'next-intl';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Services from '@/components/Services';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const canonical = `https://uproof.eu/${locale}/services`;
  const languages = {
    lv: 'https://uproof.eu/lv/services',
    en: 'https://uproof.eu/en/services',
    'nl-BE': 'https://uproof.eu/nl-BE/services',
    'x-default': 'https://uproof.eu/lv/services'
  };

  const titles: Record<string, string> = {
    lv: 'Jumta darbi Rīgā | 24/7 palīdzība, renovācija, montāža | UpRoof',
    en: 'Roofing Services Latvia | Construction, Repair & Snow Removal | UpRoof',
    'nl-BE': 'Dakdiensten | Renovatie, Reparatie & Onderhoud | UpRoof',
  };
  const descriptions: Record<string, string> = {
    lv: 'Pilns jumta darbu klāsts Rīgā un Pierīgā: jumta seguma montāža, nomaiņa, valcprofils, notekas, krāsošana un avārijas palīdzība 24/7. Sertificēti meistari, 10 gadu garantija un bezmaksas apskate.',
    en: 'Complete roofing services: construction, renovation, repairs, metal roof installation, painting, snow and ice removal 24/7. 10-year warranty. Free quotes in Latvia.',
    'nl-BE': 'Complete dakdiensten: renovatie, reparatie, schilderwerk, metalen daken, pannendaken. 10 jaar garantie. Gratis offerte.',
  };

  return {
    title: titles[locale] || titles.lv,
    description: descriptions[locale] || descriptions.lv,
    alternates: {
      canonical,
      languages
    }
  };
}

export default function ServicesPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = use(params);
  unstable_setRequestLocale(locale);
  const t = useTranslations('pages.services');

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'lv' ? 'Sākums' : 'Home',
        item: `https://uproof.eu/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: locale === 'lv' ? 'Pakalpojumi' : locale === 'nl-BE' ? 'Diensten' : 'Services',
        item: `https://uproof.eu/${locale}/services`,
      },
    ],
  };

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}} />
    </main>
  );
}
