import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {unstable_setRequestLocale} from 'next-intl/server';
import {Inter} from 'next/font/google';
import type {Metadata} from 'next';
import {SpeedInsights} from '@vercel/speed-insights/next';
import {Analytics} from '@vercel/analytics/react';
import '../globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import LayoutClient from '@/components/LayoutClient';

const inter = Inter({ 
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://uproof.eu'),
  title: {
    default: 'UpRoof – Jumta pakalpojumi Latvijā | Būvniecība, Renovācija, Sniega tīrīšana 24/7',
    template: '%s | UpRoof'
  },
  description: 'UpRoof profesionālie jumta pakalpojumi Rīgā un visā Latvijā: jumta remonts Rīgā, jumta būvniecība, jumta renovācija, valcprofila jumta montāža, metāla jumta montāža un sniega tīrīšana no jumta 24/7. 10 gadu garantija. +371 25612440',
  keywords: [
    'jumta pakalpojumi Latvijā',
    'jumta pakalpojumi Rīgā',
    'profesionālie jumta pakalpojumi',
    'jumta darbi Latvijā',
    'jumta darbi Rīgā',
    'jumta meistari Rīgā',
    'jumta meistari Latvijā',
    'jumta uzņēmums Latvijā',
    'jumta uzņēmums Rīgā',
    'jumta kompānija Latvijā',
    'jumta būvniecība Latvijā',
    'jumta būvniecība Rīgā',
    'jauna jumta būvniecība',
    'jumtu būvniecība Latvijā',
    'jumta uzstādīšana',
    'jumta seguma montāža',
    'jumta seguma uzstādīšana',
    'jumta konstrukcijas izbūve',
    'jumta remonts Latvijā',
    'jumta remonts Rīgā',
    'jumta remonta pakalpojumi',
    'jumta bojājumu remonts',
    'jumta noplūdes remonts',
    'avārijas jumta remonts',
    'steidzams jumta remonts',
    'jumta renovācija Latvijā',
    'jumta renovācija Rīgā',
    'jumta atjaunošana',
    'jumta seguma maiņa',
    'jumta nomaiņa',
    'vecā jumta nomaiņa',
    'jumta rekonstrukcija',
    'sniega tīrīšana no jumta',
    'sniega tīrīšana no jumtiem Rīgā',
    'sniega tīrīšana Latvijā',
    'jumta sniega tīrīšana',
    'ledus tīrīšana no jumta',
    'sniega un ledus tīrīšana no jumtiem',
    'jumta tīrīšana ziemā',
    'sniega tīrīšana no jumtiem 24/7',
    'snow removal from roofs Latvia',
    'roof snow removal Latvia',
    'snow and ice removal Latvia',
    'valcprofila jumta montāža',
    'valcprofila jumts',
    'valcprofila jumta montāža Rīgā',
    'valcprofila jumts Latvijā',
    'stāvošās šuves jumts',
    'stāvošās šuves jumta montāža',
    'stāvošā šuve jumts',
    'metāla jumts',
    'metāla jumta montāža',
    'metāla jumta segums',
    'metāla jumts Latvijā',
    'metāla jumta uzstādīšana',
    'skārda jumts',
    'skārda jumta montāža',
    'skārdnieka darbi',
    'dakstiņu jumts',
    'dakstiņu jumta montāža',
    'māla dakstiņu jumts',
    'noteku montāža',
    'noteksistēmu uzstādīšana',
    'lietus noteku montāža',
    'lietus ūdens notekas',
    'jumta notekas uzstādīšana',
    'jumta apkope',
    'jumta apkope Latvijā',
    'jumta apkope Rīgā',
    'jumta apkope 24/7',
    'jumta inspekcija',
    'jumta pakalpojumi Jūrmalā',
    'jumta remonts Jūrmalā',
    'jumta būvniecība Jūrmalā',
    'jumta pakalpojumi Jelgavā',
    'jumta remonts Jelgavā',
    'jumta būvniecība Jelgavā',
    'jumta pakalpojumi Liepājā',
    'jumta pakalpojumi Daugavpilī',
    'jumta pakalpojumi Ventspilī',
    'jumta pakalpojumi Valmierā',
    'jumta pakalpojumi netālu',
    'jumta meistari netālu',
    'roofing services near me',
    'roofing services Latvia',
    'roofing company Latvia',
    'roof construction Latvia',
    'roof renovation Latvia',
    'roof repair Latvia',
    'emergency roof repair Latvia',
    'roof replacement Latvia',
    'roof installation Latvia',
    'metal roof Latvia',
    'standing seam roof Latvia',
    'gutter installation Latvia'
  ],
  authors: [{ name: 'UpRoof', url: 'https://uproof.eu' }],
  creator: 'UpRoof',
  publisher: 'UpRoof',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'lv_LV',
    alternateLocale: ['en_US', 'nl_BE'],
    url: 'https://uproof.eu',
    title: 'UpRoof – Profesionālie jumta pakalpojumi Latvijā | Būvniecība, Renovācija, Sniega tīrīšana',
    description: 'UpRoof jumta pakalpojumi Rīgā un visā Latvijā: jumta remonts Rīgā, būvniecība, renovācija, valcprofila jumta montāža, metāla jumta montāža, sniega un ledus tīrīšana no jumtiem 24/7. 10 gadu garantija. +371 25612440',
    siteName: 'UpRoof',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'UpRoof - Jumta būvniecība un remonts Rīgā un Latvijā',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UpRoof – Profesionālie jumta pakalpojumi Latvijā | Sniega tīrīšana 24/7',
    description: 'UpRoof jumta pakalpojumi Latvijā: jumta remonts, valcprofila jumta montāža, metāla jumta montāža un sniega tīrīšana no jumtiem 24/7. 10 gadu garantija. +371 25612440',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export function generateStaticParams() {
  return [{locale: 'lv'}, {locale: 'en'}, {locale: 'nl-BE'}];
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  unstable_setRequestLocale(locale);
  const messages = await getMessages();
  // Build Organization schema dynamically to allow small customizations
  const sameAs: string[] = [
    'https://www.facebook.com/uproof',
    'https://www.instagram.com/uproof'
  ];
  if (process.env.NEXT_PUBLIC_GBP_URL) {
    sameAs.push(process.env.NEXT_PUBLIC_GBP_URL);
  }
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': ['RoofingContractor', 'LocalBusiness'],
    '@id': 'https://uproof.eu/#organization',
    name: 'UpRoof',
    url: 'https://uproof.eu',
    logo: 'https://uproof.eu/images/logo.png',
    image: 'https://uproof.eu/images/og-image.jpg',
    description:
      'Profesionāli jumta pakalpojumi Rīgā un visā Latvijā: jumta remonts, jumta būvniecība, valcprofila jumta montāža, metāla jumta montāža un sniega tīrīšana no jumta 24/7. 10 gadu garantija.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rīga',
      addressLocality: 'Rīga',
      addressRegion: 'Rīgas rajons',
      postalCode: 'LV-1000',
      addressCountry: 'LV'
    },
    telephone: '+371-25612440',
    priceRange: '$$',
    // Multiple service areas covering Riga and surrounding regions
    areaServed: [
      {
        '@type': 'City',
        name: 'Rīga',
        '@id': 'https://www.wikidata.org/wiki/Q1773'
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
        '@type': 'City',
        name: 'Ogre'
      },
      {
        '@type': 'City',
        name: 'Salaspils'
      },
      {
        '@type': 'City',
        name: 'Ķekava'
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Pierīga'
      },
      {
        '@type': 'Country',
        name: 'Latvia',
        '@id': 'https://www.wikidata.org/wiki/Q211'
      }
    ],
    // Primary service area centered on Riga (100km radius)
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 56.9496,
        longitude: 24.1052,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Rīga',
          addressCountry: 'LV'
        }
      },
      geoRadius: '100000'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 56.9496,
      longitude: 24.1052
    },
    sameAs,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Jumta pakalpojumi',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Jumta būvniecība',
            description: 'Pilna cikla jumta būvniecība Rīgā un Latvijā ar 10 gadu garantiju',
            areaServed: 'Rīga, Pierīga, Latvija'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Jumta remonts',
            description: 'Profesionāls jumta remonts Rīgā un Latvijā, jumta bojājumu remonts, jumta noplūdes remonts un steidzams avārijas jumta remonts',
            areaServed: 'Rīga, Pierīga, Latvija'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Valcprofila jumta montāža',
            description: 'Valcprofila jumta montāža Rīgā un Latvijā, stāvošās šuves jumta montāža un valcprofila jumta risinājumi',
            areaServed: 'Rīga, Pierīga, Latvija'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Metāla jumta montāža',
            description: 'Metāla jumta montāža un metāla jumta uzstādīšana Rīgā un visā Latvijā',
            areaServed: 'Rīga, Pierīga, Latvija'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Sniega tīrīšana no jumta',
            description: 'Sniega un ledus tīrīšana no jumtiem Rīgā un Latvijā, jumta sniega tīrīšana 24/7 ziemas sezonā',
            areaServed: 'Rīga, Pierīga, Latvija'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Jumta krāsošana',
            description: 'Jumta krāsošana ar ilgnoturīgiem materiāliem Rīgā',
            areaServed: 'Rīga, Pierīga, Latvija'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Noteksistēmu uzstādīšana',
            description: 'Kvalitatīva noteksistēmu montāža jumtam Rīgā',
            areaServed: 'Rīga, Pierīga, Latvija'
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
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00'
    }
  } as const;

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="alternate" hrefLang="lv" href="https://uproof.eu/lv" />
        <link rel="alternate" hrefLang="en" href="https://uproof.eu/en" />
        <link rel="alternate" hrefLang="nl-BE" href="https://uproof.eu/nl-BE" />
        <link rel="alternate" hrefLang="x-default" href="https://uproof.eu/lv" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* DNS-prefetch for GTM (used only when analytics consent given) */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgSchema)
          }}
        />
      </head>
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
          <ErrorBoundary>
            {children}
            <LayoutClient gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
          </ErrorBoundary>
        </NextIntlClientProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
