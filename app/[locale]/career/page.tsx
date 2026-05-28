import {use} from 'react';
import type {Metadata} from 'next';
import {useTranslations} from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import CareerSection from '@/components/CareerSection';

type Props = {
  params: Promise<{locale: string}>;
};

const titles: Record<string, string> = {
  lv: 'Karjera UpRoof | Vakances jumta nozarē Latvijā',
  en: 'Careers at UpRoof | Roofing Jobs in Latvia',
  'nl-BE': 'Werken bij UpRoof | Dakvacatures in Letland',
};

const descriptions: Record<string, string> = {
  lv: 'Pievienojies UpRoof komandai un piesakiies vakancēm jumta nozarē. Aizpildi pieteikumu, pievieno savu CV un mēs sazināsimies ar kandidātiem.',
  en: 'Join the UpRoof team and apply for roofing jobs in Latvia. Fill out the application, attach your CV, and we will contact shortlisted candidates.',
  'nl-BE': 'Sluit je aan bij het UpRoof-team en solliciteer naar dakvacatures in Letland. Vul het formulier in, voeg je cv toe en wij nemen contact op met geselecteerde kandidaten.',
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const canonical = `https://uproof.eu/${locale}/career`;

  return {
    title: titles[locale] || titles.lv,
    description: descriptions[locale] || descriptions.lv,
    alternates: {
      canonical,
      languages: {
        lv: 'https://uproof.eu/lv/career',
        en: 'https://uproof.eu/en/career',
        'nl-BE': 'https://uproof.eu/nl-BE/career',
        'x-default': 'https://uproof.eu/lv/career',
      },
    },
    openGraph: {
      title: titles[locale] || titles.lv,
      description: descriptions[locale] || descriptions.lv,
      url: canonical,
      type: 'website',
      siteName: 'UpRoof',
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale] || titles.lv,
      description: descriptions[locale] || descriptions.lv,
    },
  };
}

export default function CareerPage({params}: Props) {
  const {locale} = use(params);
  const t = useTranslations('pages.career');

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Breadcrumbs />

      <section 
        className="relative overflow-hidden bg-gray-900 text-white bg-cover bg-center"
        style={{backgroundImage: 'url(/images/icons/career-header.png)', minHeight: '500px'}}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/70 via-primary-900/60 to-primary-900/50" />
        <div className="absolute inset-0 bg-noise opacity-10" />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-primary-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary-300">
              {t('heroKicker')}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              {t('title')}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-gray-300 leading-relaxed">
              {t('heroIntro')}
            </p>
          </div>
        </div>
      </section>

      <CareerSection />
      <Footer />
    </main>
  );
}