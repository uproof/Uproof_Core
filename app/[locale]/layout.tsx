import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {Inter} from 'next/font/google';
import type {Metadata} from 'next';
import {SpeedInsights} from '@vercel/speed-insights/next';
import {Analytics} from '@vercel/analytics/react';
import dynamic from 'next/dynamic';
const CookieConsent = dynamic(() => import('@/components/CookieConsent'), { ssr: false });
const GTM = dynamic(() => import('@/components/GTM'), { ssr: false });
import '../globals.css';

const inter = Inter({ 
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://uproof.eu'),
  title: {
    default: 'Jumta būvniecība un remonts Rīgā | Profesionāli pakalpojumi Latvijā | UpRoof',
    template: '%s | UpRoof'
  },
  description: 'Profesionāli jumta pakalpojumi Rīgā un visā Latvijā: būvniecība, remonts, krāsošana, apkope. 10 gadu garantija. Apkalpojam Rīgu, Pierīgu, Jūrmalu, Jelgavu. Bezmaksas novērtējums!',
  keywords: [
    'jumta būvniecība Rīgā',
    'jumta remonts Rīgā', 
    'jumta krāsošana Rīgā',
    'jumtu būvniecība Latvijā',
    'jumta seguma montāža Rīgā',
    'jumta apkope Pierīgā',
    'noteksistēmu uzstādīšana Rīgā',
    'jumta renovācija Jūrmalā',
    'jumta pakalpojumi Jelgavā',
    'roofing contractor Riga',
    'roof construction Latvia',
    'roof repair Riga',
    'roof painting Latvia'
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
    title: 'Jumta būvniecība un remonts Rīgā | Profesionāli pakalpojumi Latvijā',
    description: 'Profesionāli jumta pakalpojumi Rīgā, Pierīgā un Latvijā: būvniecība, remonts, krāsošana. 10 gadu garantija. Apkalpojam Rīgu, Jūrmalu, Jelgavu.',
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
    title: 'Jumta būvniecība un remonts Rīgā | Profesionāli pakalpojumi Latvijā',
    description: 'Profesionāli jumta pakalpojumi Rīgā, Pierīgā un Latvijā: būvniecība, remonts, krāsošana. 10 gadu garantija.',
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
    google: 'your-google-verification-code', // Add after Google Search Console setup
    yandex: 'your-yandex-verification-code',
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
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
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
      'Profesionāli jumta būvniecības, remonta un apkopes pakalpojumi Rīgā un visā Latvijā. 10 gadu garantija.',
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
            description: 'Profesionāls jumta remonts un apkope Rīgā',
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
      ratingValue: '5',
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
        {/* Preconnect to GTM for faster analytics loading */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* Preload hero poster for faster LCP */}
        <link rel="preload" href="/images/hero-roof.svg" as="image" fetchPriority="high" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgSchema)
          }}
        />
      </head>
      <body className="font-sans">
        <GTM gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
        <NextIntlClientProvider messages={messages}>
          {children}
           <CookieConsent />
        </NextIntlClientProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
