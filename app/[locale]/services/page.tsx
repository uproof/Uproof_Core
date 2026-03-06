import {unstable_setRequestLocale, getTranslations} from 'next-intl/server';
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
  unstable_setRequestLocale(locale);
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
    email: 'info@uproof.eu',
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
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'lv' ? 'Jumta būvniecība' : 'Roof Construction',
            description: locale === 'lv' ? 'Jaunu jumtu būvniecība un montāža' : 'New roof construction and installation'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'lv' ? 'Jumta renovācija' : 'Roof Renovation',
            description: locale === 'lv' ? 'Jumta atjaunošana un modernizācija' : 'Roof restoration and modernization'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'lv' ? 'Jumta remonts' : 'Roof Repair',
            description: locale === 'lv' ? 'Jumta labošana un remontdarbi' : 'Roof fixing and repair work'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'lv' ? 'Metāla jumts' : 'Metal Roofing',
            description: locale === 'lv' ? 'Metāla jumta montāža un uzstādīšana' : 'Metal roof installation and setup'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'lv' ? 'Sniega tīrīšana' : 'Snow Removal',
            description: locale === 'lv' ? 'Sniega un ledus tīrīšana no jumtiem 24/7' : 'Snow and ice removal from roofs 24/7'
          }
        }
      ]
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '47',
      bestRating: '5',
      worstRating: '1'
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
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'lv' ? 'Jumta būvniecība' : 'Roof Construction Services'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'lv' ? 'Jumta renovācija' : 'Roof Renovation Services'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: locale === 'lv' ? 'Jumta remonts' : 'Roof Repair Services'
          }
        }
      ]
    }
  };

  return (
    <main className="min-h-screen">
      <Header />
      <Breadcrumbs />
      <section className="pt-14 pb-4 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            {locale === 'lv' && 'UpRoof profesionālie jumta pakalpojumi Latvijā'}
            {locale === 'en' && 'UpRoof Professional Roofing Services in Latvia'}
            {locale === 'nl-BE' && 'UpRoof professionele dakdiensten in Letland'}
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl">
            {locale === 'lv' && 'Pilns spektrs profesionālu jumta pakalpojumu Rīgā, Pierīgā un visā Latvijā: jumta būvniecība, jumta renovācija, jumta remonts, jumta apkope, noteksistēmu uzstādīšana un sniega tīrīšana 24/7. Sertificēti meistari ar 10 gadu garantiju.'}
            {locale === 'en' && 'Complete range of professional roofing services in Riga, Jurmala and all Latvia: construction, renovation, repair, metal roofing, tile roofs, painting, gutter systems, snow and ice removal 24/7. Certified specialists with 10-year warranty.'}
            {locale === 'nl-BE' && 'Volledig scala aan professionele dakdiensten in heel Letland: constructie, renovatie, reparatie, metalen daken, pannendaken, coating, goten, sneeuwruiming 24/7. Gecertificeerde specialisten met 10 jaar garantie.'}
          </p>
        </div>
      </section>
      <Services />
      {locale === 'lv' && (
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Jumta renovācija un jumta būvniecība Latvijā
            </h2>
            <p className="mt-4 text-lg text-gray-700 max-w-4xl">
              UpRoof komanda specializējas darbos, kur galvenais fokuss ir jumta renovācija un jumta būvniecība privātmājām, daudzdzīvokļu ēkām un komercobjektiem.
              Ja jums nepieciešama profesionāla jumta renovācija vai pilna cikla jumta būvniecība, mēs nodrošinām precīzu tāmi, sertificētu brigādi un ilgtermiņa garantiju.
            </p>
            <ul className="mt-6 space-y-3 text-gray-700">
              <li>- Jumta būvniecība no projekta līdz gatavam jumtam ar pilnu tehnisko uzraudzību.</li>
              <li>- Jumta renovācija esošiem objektiem, ieskaitot seguma nomaiņu un konstrukciju atjaunošanu.</li>
              <li>- Jumta būvniecība Rīgā, Pierīgā un visā Latvijā ar materiālu un mezglu kvalitātes kontroli.</li>
              <li>- Jumta renovācija Rīgā un Latvijas pilsētās ar skaidriem termiņiem un garantiju.</li>
              <li>- Kombinēti risinājumi, kuros jumta renovācija tiek apvienota ar jaunu mezglu izbūvi un jumta būvniecība tiek plānota pa etapiem.</li>
            </ul>
            <p className="mt-6 text-base text-gray-600">
              Pieprasiet bezmaksas novērtējumu: palīdzēsim izvēlēties, vai konkrētajam objektam izdevīgāka ir jumta renovācija vai pilna jumta būvniecība.
            </p>
          </div>
        </section>
      )}
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbSchema)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(localBusinessSchema)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(serviceSchema)}} />
    </main>
  );
}
