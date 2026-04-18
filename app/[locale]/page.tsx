import {useTranslations} from 'next-intl';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Solutions from '@/components/Solutions';
import StatsBar from '@/components/StatsBar';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import HomeClientSections from '@/components/HomeClientSections';
import type {Metadata} from 'next';

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
    lv: 'UpRoof – Jumta būvniecība, renovācija un remonts Latvijā | Sniega tīrīšana 24/7',
    en: 'UpRoof – Professional Roofing Services in Latvia | Construction, Renovation & Snow Removal 24/7',
    'nl-BE': 'UpRoof – Professionele Dakdiensten in Letland | Renovatie, Reparatie & Sneeuwruiming',
  };

  const descriptions: Record<string, string> = {
    lv: 'UpRoof profesionālie jumta pakalpojumi Rīgā, Pierīgā un visā Latvijā: jaunu jumtu būvniecība, renovācija, remonts, metāla jumti, valcprofila montāža, valcprofila jumta montāža, valcprofila jumts Rīga, metāla jumta montāža, dakstiņu jumti, jumta krāsošana, notekas, sniega tīrīšana 24/7. 10 gadu garantija. +371 25612440',
    en: 'UpRoof professional roofing services in Riga, Jurmala and all Latvia: construction, renovation, repair, metal roofing, tile roofs, painting, gutters, snow & ice removal 24/7. 10-year warranty. +371 25612440',
    'nl-BE': 'UpRoof professionele dakdiensten in Letland: constructie, renovatie, reparatie, metalen daken, pannendaken, coating, goten, sneeuwruiming 24/7. 10 jaar garantie.',
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
    lv: {title: 'Jumta remonts un renovācija — bezmaksas diagnostika', cta: 'Pieteikt apskati'},
    en: {title: 'Roof Repair & Renovation — Free Roof Diagnostics', cta: 'Book inspection'},
    'nl-BE': {title: 'Dakreparatie & renovatie — Gratis dakdiagnose', cta: 'Plan inspectie'},
  };
  const banner = bannerText[locale] || bannerText.lv;

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
  <Services limit={4} />
      <StatsBar stats={statsData[locale] || statsData.lv} />
      <HomeClientSections>
        <Solutions />
      </HomeClientSections>
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
