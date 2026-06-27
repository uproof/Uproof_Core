import {Suspense} from 'react';
import dynamicImport from 'next/dynamic';
import {useTranslations} from 'next-intl';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import StatsBar from '@/components/StatsBar';
import Footer from '@/components/Footer';
import type {Metadata} from 'next';

// Defer non-critical sections to improve FCP
const DynamicSolutions = dynamicImport(() => import('@/components/Solutions'), {
  loading: () => <div className="h-96 bg-gray-50" />,
  ssr: true,
});

const DynamicHomeClientSections = dynamicImport(() => import('@/components/HomeClientSections'), {
  loading: () => <div className="h-96 bg-gray-50" />,
  ssr: true,
});

const DynamicContactSection = dynamicImport(() => import('@/components/ContactSection'), {
  loading: () => <div className="h-96 bg-gray-50" />,
  ssr: true,
});

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  const canonical = `https://uproof.eu/${locale}`;
  
  const languages: Record<string, string> = {
    lv: 'https://uproof.eu/lv',
    en: 'https://uproof.eu/en',
    'nl-BE': 'https://uproof.eu/nl-BE',
    'x-default': 'https://uproof.eu/lv',
  };

  const titles: Record<string, string> = {
    lv: 'UpRoof | Jumta pakalpojumi, remonts un renovācija Latvijā',
    en: 'Professional Roofing Services in Latvia | UpRoof',
    'nl-BE': 'Professionele Dakdiensten in Letland | UpRoof',
  };

  const descriptions: Record<string, string> = {
    lv: 'Profesionāli jumta pakalpojumi, jumta darbi un jumta remonts Rīgā, Pierīgā un visā Latvijā: būvniecība, renovācija, valcprofils, dakstiņi, noteksistēmas un apkope ar garantiju.',
    en: 'Professional roofing services in Riga and throughout Latvia: construction, renovation, repair, standing seam roofing, tile roofs, gutters and maintenance with warranty.',
    'nl-BE': 'Professionele dakdiensten in Letland: dakbouw, renovatie, reparatie, staande naad, pannendaken, goten en onderhoud met garantie.',
  };

  return {
    title: titles[locale] || titles.lv,
    description: descriptions[locale] || descriptions.lv,
    alternates: {
      canonical,
      languages,
    },
  };
}

export default async function HomePage({params}: Props) {
  const {locale} = await params;

  const bannerText: Record<string, {title: string; cta: string}> = {
    lv: {title: 'Jumta pakalpojumi, jumta darbi un jumta remonts — bezmaksas diagnostika', cta: 'Pieteikt apskati'},
    en: {title: 'Roof Repair & Renovation — Free Roof Diagnostics', cta: 'Book inspection'},
    'nl-BE': {title: 'Dakreparatie & renovatie — Gratis dakdiagnose', cta: 'Plan inspectie'},
  };
  const banner = bannerText[locale] || bannerText.lv;

  const seoIntro: Record<string, string> = {
    lv: 'Mūsu galvenie virzieni ir jumta pakalpojumi, jumta darbi, jumta remonts, jumta renovācija un jumta montāža Rīgā, Pierīgā un visā Latvijā.',
    en: 'Our core focus is roofing services, roof repairs, roof renovation and roof installation in Riga and throughout Latvia.',
    'nl-BE': 'Onze kernfocus ligt op dakdiensten, dakreparatie, dakrenovatie en dakinstallatie in Letland.',
  };

  const statsData: Record<string, {value: string; label: string}[]> = {
    lv: [
      {value: '200+', label: 'Pabeigti projekti'},
      {value: '10+', label: 'Gadu pieredze'},
      {value: '10', label: 'Gadu garantija'},
      {value: '100%', label: 'Klientu apmierinātība'},
    ],
    en: [
      {value: '200+', label: 'Completed Projects'},
      {value: '10+', label: 'Years Experience'},
      {value: '10', label: 'Year Warranty'},
      {value: '100%', label: 'Client Satisfaction'},
    ],
    'nl-BE': [
      {value: '200+', label: 'Voltooide Projecten'},
      {value: '10+', label: 'Jaar Ervaring'},
      {value: '10', label: 'Jaar Garantie'},
      {value: '100%', label: 'Klanttevredenheid'},
    ],
  };

  return (
    <main className="min-h-screen">
  <Header showText={false} largeLogo={true} />
  <Hero />
      <div className="bg-gray-900 text-white py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center">
            <p className="font-semibold text-sm sm:text-base">{banner.title}</p>
            <a href={`/${locale}/services/jumta-apkope-remonts`} className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors">
              {banner.cta}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-center">
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed max-w-4xl mx-auto">
              {seoIntro[locale] || seoIntro.lv}
            </p>
          </div>
        </div>
  <Services limit={4} />
      <StatsBar stats={statsData[locale] || statsData.lv} />
      <Suspense fallback={<div className="h-96 bg-gray-50" />}>
        <DynamicHomeClientSections>
          <DynamicSolutions />
        </DynamicHomeClientSections>
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-gray-50" />}>
        <DynamicContactSection />
      </Suspense>
      <Footer />
      {/* LocalBusiness / Organization schema for Local SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'UpRoof',
            url: `https://uproof.eu/${locale}`,
            image: 'https://uproof.eu/images/og-image.jpg',
            telephone: '+37125612440',
            priceRange: '€€',
            address: {
              '@type': 'PostalAddress',
              addressCountry: locale === 'nl-BE' ? 'BE' : 'LV',
              addressLocality: locale === 'nl-BE' ? 'Kortrijk' : 'Rīga'
            },
            areaServed: locale === 'nl-BE' ? ['Kortrijk','Gent','Brugge','Antwerpen','Brussel'] : ['Rīga','Jūrmala','Jelgava','Ogre','Salaspils','Ķekava'],
            openingHoursSpecification: [
              { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '08:00', closes: '18:00' }
            ],
            sameAs: [
              'https://www.tiktok.com/@uproof',
              'https://www.instagram.com/up_roof',
              'https://www.facebook.com/share/1BgDDjXKHX/',
              'https://www.linkedin.com/company/uproof-jumti/',
            ],
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: locale === 'lv' ? 'Jumta pakalpojumi' : locale === 'nl-BE' ? 'Dakdiensten' : 'Roofing Services',
              itemListElement: [
                {'@type': 'Service', name: locale === 'lv' ? 'Jumta renovācija' : locale === 'nl-BE' ? 'Dakrenovatie' : 'Roof Renovation'},
                {'@type': 'Service', name: locale === 'lv' ? 'Jumta būvniecība' : locale === 'nl-BE' ? 'Dakbouw' : 'Roof Construction'},
                {'@type': 'Service', name: locale === 'lv' ? 'Jumta remonts' : locale === 'nl-BE' ? 'Dakreparatie' : 'Roof Repair'},
                {'@type': 'Service', name: locale === 'lv' ? 'Sniega un ledus tīrīšana no jumta' : locale === 'nl-BE' ? 'Sneeuw- en ijsverwijdering van dak' : 'Snow & Ice Removal from Roof'},
                {'@type': 'Service', name: locale === 'lv' ? 'Jumta apkope' : locale === 'nl-BE' ? 'Dakonderhoud' : 'Roof Maintenance'},
              ],
            },
            description: locale === 'nl-BE'
              ? 'Professionele dakdiensten: renovatie, pannendaken, metaal, onderhoud. Gecertificeerde kwaliteit met garantie.'
              : locale === 'en'
              ? 'Professional roofing services: construction, renovation, metal, tiles, maintenance, snow and ice removal. Certified quality with warranty.'
              : 'Profesionāli jumta pakalpojumi: būvniecība, renovācija, metāla jumti, valcprofila montāža, valcprofila jumta montāža, metāla jumta montāža, dakstiņi, apkope, sniega un ledus tīrīšana no jumta. Sertificēta kvalitāte ar garantiju.'
          })
        }}
      />
    </main>
  );
}

// Prefer static generation to reduce TTFB and stabilize LCP
export const dynamic = 'force-static';
export const revalidate = 3600; // Re-generate once per hour
