import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
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
    lv: 'UpRoof jumta pakalpojumi Latvijā | Jumta būvniecība, jumta renovācija, remonts',
    en: 'UpRoof Professional Roofing Services in Latvia | Construction, Renovation, Snow Removal',
    'nl-BE': 'UpRoof Professionele Dakdiensten in Letland | Constructie, Renovatie, Sneeuwruiming',
  };
  const descriptions: Record<string, string> = {
    lv: 'UpRoof jumta pakalpojumi Rīgā, Pierīgā un visā Latvijā: jumta būvniecība, jumta renovācija, jumta remonts, jumta apkope, noteksistēmu uzstādīšana un sniega tīrīšana 24/7. 10 gadu garantija. +371 25612440',
    en: 'UpRoof roofing services in Riga, Jurmala and all Latvia: construction, renovation, repair, metal roofing, tiles, painting, gutters, snow removal 24/7. 10-year warranty. +371 25612440',
    'nl-BE': 'UpRoof dakdiensten in heel Letland: constructie, renovatie, reparatie, metalen daken, pannen, coating, goten, sneeuwruiming 24/7. 10 jaar garantie.',
  };

  return {
    title: titles[locale] || titles.lv,
    description: descriptions[locale] || descriptions.lv,
    keywords: [
      locale === 'en' ? 'roofing services Latvia' : 'jumta pakalpojumi Latvijā',
      locale === 'en' ? 'professional roofing services Latvia' : 'profesionālie jumta pakalpojumi Latvijā',
      locale === 'en' ? 'roofing company Latvia' : 'jumta uzņēmums Latvijā',
      locale === 'en' ? 'roof construction services Latvia' : 'jumta būvniecības pakalpojumi Latvijā',
      locale === 'en' ? 'roof renovation services Latvia' : 'jumta renovācijas pakalpojumi Latvijā',
      locale === 'en' ? 'roof repair services Latvia' : 'jumta remonta pakalpojumi Latvijā',
      locale === 'en' ? 'metal roofing services' : 'metāla jumta pakalpojumi',
      locale === 'en' ? 'snow removal from roofs Latvia' : 'sniega tīrīšana no jumta Latvijā',
      locale === 'en' ? 'roof snow removal services' : 'jumta sniega tīrīšanas pakalpojumi',
      locale === 'en' ? 'emergency roof services Latvia' : 'avārijas jumta pakalpojumi Latvijā',
    ],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      }
    },
    alternates: {
      canonical,
      languages
    },
    openGraph: {
      title: titles[locale] || titles.lv,
      description: descriptions[locale] || descriptions.lv,
      url: canonical,
      type: 'website',
      locale: locale === 'lv' ? 'lv_LV' : locale === 'en' ? 'en_US' : 'nl_BE',
      images: [{
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'UpRoof Professional Roofing Services'
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale] || titles.lv,
      description: descriptions[locale] || descriptions.lv,
      images: ['/images/og-image.jpg'],
    }
  };
}

export default async function ServicesPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations('pages.services');

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

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'RoofingContractor', 'LocalBusiness'],
    '@id': 'https://uproof.eu/#organization',
    name: 'UpRoof',
    url: 'https://uproof.eu',
    logo: 'https://uproof.eu/images/logo.png',
    image: 'https://uproof.eu/images/og-image.jpg',
    description: locale === 'lv' 
      ? 'Profesionāli jumta pakalpojumi Rīgā un Latvijā: jumta būvniecība, jumta renovācija, jumta remonts, jumta apkope, noteksistēmas un sniega tīrīšana'
      : 'Professional roofing services in Riga, Latvia: construction, renovation, repair, metal roofing, snow removal',
    priceRange: '€€',
    telephone: '+371-25612440',
    email: 'contact@uproof.eu',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rīga',
      addressLocality: 'Rīga',
      addressRegion: 'Rīgas apriņķis',
      postalCode: 'LV-1000',
      addressCountry: 'LV'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 56.9496,
      longitude: 24.1052
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Rīga'
      },
      {
        '@type': 'City',
        name: 'Jūrmala'
      },
      {
        '@type': 'City',
        name: 'Jelgava'
      },
      {
        '@type': 'State',
        name: 'Latvia'
      }
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: locale === 'lv' ? 'Jumta pakalpojumi' : 'Roofing Services',
      itemListElement: [
        {
          '@type': 'Service',
          name: locale === 'lv' ? 'Jumta būvniecība' : 'Roof Construction',
          description: locale === 'lv' ? 'Jaunu jumtu būvniecība un montāža' : 'New roof construction and installation'
        },
        {
          '@type': 'Service',
          name: locale === 'lv' ? 'Jumta renovācija' : 'Roof Renovation',
          description: locale === 'lv' ? 'Jumta atjaunošana un modernizācija' : 'Roof restoration and modernization'
        },
        {
          '@type': 'Service',
          name: locale === 'lv' ? 'Jumta remonts' : 'Roof Repair',
          description: locale === 'lv' ? 'Jumta labošana un remontdarbi' : 'Roof fixing and repair work'
        },
        {
          '@type': 'Service',
          name: locale === 'lv' ? 'Metāla jumts' : 'Metal Roofing',
          description: locale === 'lv' ? 'Metāla jumta montāža un uzstādīšana' : 'Metal roof installation and setup'
        },
        {
          '@type': 'Service',
          name: locale === 'lv' ? 'Sniega tīrīšana' : 'Snow Removal',
          description: locale === 'lv' ? 'Sniega un ledus tīrīšana no jumtiem 24/7' : 'Snow and ice removal from roofs 24/7'
        }
      ]
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '09:00',
        closes: '15:00'
      }
    ],
    sameAs: [
      'https://www.facebook.com/uproof',
      'https://www.instagram.com/uproof'
    ]
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: locale === 'lv' ? 'Jumta pakalpojumi' : 'Roofing Services',
    provider: {
      '@id': 'https://uproof.eu/#organization'
    },
    areaServed: {
      '@type': 'Country',
      name: 'Latvia'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: locale === 'lv' ? 'Profesionālie jumta pakalpojumi' : 'Professional Roofing Services',
      itemListElement: [
        {
          '@type': 'Service',
          name: locale === 'lv' ? 'Jumta būvniecība' : 'Roof Construction Services'
        },
        {
          '@type': 'Service',
          name: locale === 'lv' ? 'Jumta renovācija' : 'Roof Renovation Services'
        },
        {
          '@type': 'Service',
          name: locale === 'lv' ? 'Jumta remonts' : 'Roof Repair Services'
        }
      ]
    }
  };

  return (
    <main className="min-h-screen">
      <Header />
      <Breadcrumbs />
      <section className="relative overflow-hidden bg-gray-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-gray-900 to-gray-900" />
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('/images/services/construction.webp')" }} />
        <div className="absolute -left-16 top-16 h-48 w-48 rounded-full bg-primary-500/15 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-56 w-56 rounded-full bg-primary-400/10 blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28">
          <div className="max-w-3xl">
            <p className="text-primary-400 font-semibold uppercase tracking-wider text-sm mb-3">
              {locale === 'lv' && 'Jumta pakalpojumi'}
              {locale === 'en' && 'Roofing Services'}
              {locale === 'nl-BE' && 'Dakdiensten'}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">
              {locale === 'lv' && 'UpRoof profesionālie jumta pakalpojumi Latvijā'}
              {locale === 'en' && 'UpRoof Professional Roofing Services in Latvia'}
              {locale === 'nl-BE' && 'UpRoof professionele dakdiensten in Letland'}
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              {locale === 'lv' && 'Pilns spektrs profesionālu jumta pakalpojumu Rīgā, Pierīgā un visā Latvijā: jumta būvniecība, jumta renovācija, jumta remonts, jumta apkope, noteksistēmu uzstādīšana un sniega tīrīšana 24/7. Sertificēti meistari ar 10 gadu garantiju.'}
              {locale === 'en' && 'A full range of professional roofing services across Riga, Jurmala, and Latvia, including construction, renovation, repair, metal roofing, tile roofs, painting, gutter systems, and 24/7 snow and ice removal. Certified specialists with a 10-year warranty.'}
              {locale === 'nl-BE' && 'Volledig scala aan professionele dakdiensten in heel Letland: constructie, renovatie, reparatie, metalen daken, pannendaken, coating, goten, sneeuwruiming 24/7. Gecertificeerde specialisten met 10 jaar garantie.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`/${locale}/services/seasonal`}
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg shadow-white/20"
              >
                {locale === 'lv' ? 'Pavasara jumta pārbaude' : locale === 'nl-BE' ? 'Voorjaarscheck' : 'Spring roof care'}
              </a>
              <a
                href={`/${locale}/contact`}
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-3 rounded-lg font-semibold hover:bg-primary-400 transition-colors shadow-lg shadow-primary-500/25"
              >
                {locale === 'lv' ? 'Pieteikt vizīti' : locale === 'nl-BE' ? 'Bezoek plannen' : 'Schedule visit'}
              </a>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-28"
          style={{
            background: 'linear-gradient(to top, rgb(255,255,255) 0%, rgba(255,255,255,0.96) 18%, rgba(255,255,255,0.82) 36%, rgba(255,255,255,0.58) 58%, rgba(255,255,255,0.24) 78%, rgba(255,255,255,0) 100%)'
          }}
        />
      </section>
      <Services />
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(localBusinessSchema)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(serviceSchema)}} />
    </main>
  );
}
