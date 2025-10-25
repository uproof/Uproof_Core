import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {Inter} from 'next/font/google';
import type {Metadata} from 'next';
import {SpeedInsights} from '@vercel/speed-insights/next';
import {Analytics} from '@vercel/analytics/react';
import CookieConsent from '@/components/CookieConsent';
import GTM from '@/components/GTM';
import '../globals.css';

const inter = Inter({ 
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://uproof.lv'), // Replace with your actual domain
  title: {
    default: 'UpRoof | Professional Roofing Services in Latvia | Jumtu būvniecība',
    template: '%s | UpRoof'
  },
  description: 'Professional roofing services in Latvia. Roof construction, painting, maintenance, and repairs. Expert roofing solutions from A to Z. Profesionāli jumta risinājumi Latvijā. ✓ Quality ✓ Reliability ✓ Safety',
  keywords: ['roofing', 'roof construction', 'roof repair', 'Latvia', 'jumta būvniecība', 'jumta remonts', 'jumta krāsošana', 'jumta apkope', 'roofing Latvia', 'Latvian roofing company', 'professional roofers'],
  authors: [{ name: 'UpRoof', url: 'https://uproof.lv' }],
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
    url: 'https://uproof.lv',
    title: 'UpRoof | Professional Roofing Services in Latvia',
    description: 'Expert roofing construction, painting, and maintenance services. Quality workmanship with guaranteed results.',
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
    title: 'UpRoof | Professional Roofing Services',
    description: 'Expert roofing solutions in Latvia. Construction, painting, and maintenance.',
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

  return (
    <html lang={locale} className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
