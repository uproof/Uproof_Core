import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Solutions from '@/components/Solutions';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import nextDynamic from 'next/dynamic';
import type {Metadata} from 'next';
const Reviews = nextDynamic(() => import('@/components/Reviews'), { ssr: false });
const FAQ = nextDynamic(() => import('@/components/FAQ'), { ssr: false });

type Props = {
  params: {locale: string};
};

export function generateMetadata({params}: Props): Metadata {
  const {locale} = params;
  const canonical = `https://uproof.eu/${locale}`;
  
  // Generate hreflang alternates for homepage
  const languages: Record<string, string> = {
    lv: 'https://uproof.eu/lv',
    en: 'https://uproof.eu/en',
    'nl-BE': 'https://uproof.eu/nl-BE',
    'x-default': 'https://uproof.eu/lv', // Default to Latvian
  };

  return {
    alternates: {
      canonical,
      languages,
    },
  };
}

export default function HomePage({params: {locale}}: Props) {
  unstable_setRequestLocale(locale);

  return (
    <main className="min-h-screen">
  <Header showText={false} largeLogo={true} />
  <Hero />
  <Services limit={3} />
      <Reviews />
      <Solutions />
      <FAQ />
      <ContactSection />
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
            aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '27' },
            description: locale === 'nl-BE'
              ? 'Professionele dakdiensten: renovatie, pannendaken, metaal, onderhoud. Gecertificeerde kwaliteit met garantie.'
              : locale === 'en'
              ? 'Professional roofing services: construction, renovation, metal, tiles, maintenance. Certified quality with warranty.'
              : 'Profesionāli jumta pakalpojumi: būvniecība, renovācija, metāla jumti, dakstiņi, apkope. Sertificēta kvalitāte ar garantiju.'
          })
        }}
      />
    </main>
  );
}

// Prefer static generation to reduce TTFB and stabilize LCP
export const dynamic = 'force-static';
export const revalidate = 3600; // Re-generate once per hour
