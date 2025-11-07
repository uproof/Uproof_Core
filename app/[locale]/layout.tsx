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
    default: 'Professional Roofing Services Latvia | UpRoof',
    template: '%s | UpRoof'
  },
  description: 'Expert roofing in Latvia: construction, repairs, painting & maintenance. 10-year warranty. Quality workmanship. Get a free quote today!',
  keywords: ['roofing Latvia', 'roof construction', 'roof repair', 'jumta būvniecība', 'jumta remonts', 'jumta krāsošana', 'roofing contractor', 'metal roofing', 'tile roofing', 'roof maintenance Latvia'],
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
    title: 'Professional Roofing Services Latvia | UpRoof',
    description: 'Expert roofing: construction, repairs, painting. 10-year warranty. Quality workmanship in Latvia.',
    siteName: 'UpRoof',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'UpRoof - Professional Roofing Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional Roofing Services Latvia | UpRoof',
    description: 'Expert roofing: construction, repairs, painting. 10-year warranty in Latvia.',
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
    '@type': 'RoofingContractor',
    '@id': 'https://uproof.eu/#organization',
    name: 'UpRoof',
    url: 'https://uproof.eu',
    logo: 'https://uproof.eu/images/logo.png',
    image: 'https://uproof.eu/images/og-image.jpg',
    description:
      'Professional roofing services in Latvia: construction, repairs, painting, and maintenance with 10-year warranty.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'LV',
      addressLocality: 'Rīga',
      addressRegion: 'Rīga'
    },
    telephone: '+371-25612440',
    priceRange: '$$',
    areaServed: {
      '@type': 'Country',
      name: 'Latvia'
    },
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 56.9496,
        longitude: 24.1052
      },
      geoRadius: '100000'
    },
    sameAs,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Roofing Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Roof Construction',
            description: 'Complete roof construction with 10-year warranty'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Roof Repair',
            description: 'Professional roof repair and maintenance services'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Roof Painting',
            description: 'Expert roof painting with durable materials'
          }
        }
      ]
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '47'
    }
  } as const;

  return (
    <html lang={locale} className={inter.variable}>
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
