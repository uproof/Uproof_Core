import {unstable_setRequestLocale} from 'next-intl/server';
import {use} from 'react';
import {useTranslations} from 'next-intl';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import ContactSection from '@/components/ContactSection';

type Props = {
  params: Promise<{locale: string}>;
};

const titles: Record<string, string> = {
  lv: 'Sazinies ar mums | Bezmaksas jumta novērtējums Latvijā | UpRoof',
  en: 'Contact Us | Free Roofing Quote Latvia | UpRoof',
  'nl-BE': 'Contacteer ons | Gratis dakofferte | UpRoof',
};

const descriptions: Record<string, string> = {
  lv: 'Saņemiet bezmaksas jumta novērtējumu Latvijā. Sazinieties ar UpRoof profesionāliem jumta pakalpojumiem. Tālrunis: +371 25612440. Ātra atbilde garantēta.',
  en: 'Get a free roofing quote in Latvia. Contact UpRoof for professional roofing services. Phone: +371 25612440. Fast response guaranteed.',
  'nl-BE': 'Vraag een gratis dakofferte aan. Contacteer UpRoof voor professionele dakdiensten. Tel: +371 25612440. Snelle reactie gegarandeerd.',
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const canonical = `https://uproof.eu/${locale}/contact`;

  return {
    title: titles[locale] || titles.lv,
    description: descriptions[locale] || descriptions.lv,
    alternates: {
      canonical,
      languages: {
        lv: 'https://uproof.eu/lv/contact',
        en: 'https://uproof.eu/en/contact',
        'nl-BE': 'https://uproof.eu/nl-BE/contact',
        'x-default': 'https://uproof.eu/lv/contact',
      },
    },
    openGraph: {
      title: titles[locale] || titles.lv,
      description: descriptions[locale] || descriptions.lv,
      url: canonical,
      type: 'website',
      siteName: 'UpRoof',
    },
  };
}

export default function ContactPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = use(params);
  unstable_setRequestLocale(locale);
  const t = useTranslations('pages.contact');
  return (
    <main className="min-h-screen">
      <Header />
      <Breadcrumbs />
      <section className="pt-24 pb-10 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{t('title')}</h1>
        </div>
      </section>
      <ContactSection />
      <Footer />
    </main>
  );
}
