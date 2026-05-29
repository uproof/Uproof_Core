import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import CareerSection from '@/components/CareerSection';
import {getCareerJobs} from '@/lib/career';

type Props = {
  params: Promise<{locale: string}>;
};

const titles: Record<string, string> = {
  // Latvian title uses 'Darbs' instead of 'Karjera'
  lv: 'Darbs UpRoof | Profesionāli jumiķi un jumiķa palīgi',
  en: 'Careers at UpRoof | Professional Roofers and Assistants',
  'nl-BE': 'Werken bij UpRoof | Dakwerkers en assistenten',
};

const descriptions: Record<string, string> = {
  lv: 'Apskati vakances profesionāliem jumiķiem un jumiķa palīgiem UpRoof komandā. Aizpildi pieteikumu un pievieno savu CV.',
  en: 'See open jobs for professional roofers and roofing assistants at UpRoof. Fill out the application and attach your CV.',
  'nl-BE': 'Bekijk vacatures voor dakwerkers en assistenten bij UpRoof. Vul het formulier in en voeg je cv toe.',
};

const keywords: Record<string, string[]> = {
  lv: [
    'darbs jumiķiem',
    'profesionāli jumiķi',
    'jumiķa palīgi',
    'vakances jumta nozarē',
    'darbs jumta nozarē Latvijā',
    'jumiķu vakances',
  ],
  en: [
    'roofing jobs Latvia',
    'professional roofers',
    'roofing assistants',
    'roofing vacancies',
  ],
  'nl-BE': [
    'dakwerk vacatures',
    'dakwerkers',
    'assistent dakwerker',
    'jobs in de daksector',
  ],
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const canonical = `https://uproof.eu/${locale}/career`;

  return {
    title: titles[locale] || titles.lv,
    description: descriptions[locale] || descriptions.lv,
    keywords: keywords[locale] || keywords.lv,
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

export default async function CareerPage({params}: Props) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'pages.career'});
  const canonical = `https://uproof.eu/${locale}/career`;
  const jobs = await getCareerJobs();
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: titles[locale] || titles.lv,
    description: descriptions[locale] || descriptions.lv,
    inLanguage: locale === 'lv' ? 'lv-LV' : locale === 'en' ? 'en-US' : 'nl-BE',
    about: [
      {
        '@type': 'Thing',
        name: locale === 'lv' ? 'Profesionāli jumiķi' : 'Professional roofers',
      },
      {
        '@type': 'Thing',
        name: locale === 'lv' ? 'Jumiķa palīgi' : 'Roofing assistants',
      },
    ],
    isPartOf: {
      '@type': 'WebSite',
      '@id': 'https://uproof.eu/#website',
      url: 'https://uproof.eu',
      name: 'UpRoof',
    },
  };

  const jobListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: titles[locale] || titles.lv,
    itemListElement: jobs
      .filter((job) => job.active !== false)
      .map((job, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'JobPosting',
          title: job.title,
          description: job.summary,
          datePosted: new Date().toISOString().slice(0, 10),
          employmentType: job.type,
          hiringOrganization: {
            '@type': 'Organization',
            '@id': 'https://uproof.eu/#organization',
            name: 'UpRoof',
            sameAs: 'https://uproof.eu',
          },
          jobLocation: {
            '@type': 'Place',
            address: {
              '@type': 'PostalAddress',
              addressLocality: job.location,
              addressCountry: 'LV',
            },
          },
        },
      })),
  };

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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(pageSchema)}}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jobListSchema)}}
      />

      <CareerSection jobs={jobs} />
      <Footer />
    </main>
  );
}