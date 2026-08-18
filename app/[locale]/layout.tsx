import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {Inter} from 'next/font/google';
import type {Metadata} from 'next';
import '../globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://crm.uproof.eu'),
  title: {
    default: 'UpRoof Operations',
    template: '%s | UpRoof Operations',
  },
  description: 'Internal UpRoof CRM and project operations workspace.',
  robots: {
    index: false,
    follow: false,
  },
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
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const htmlLang = locale === 'nl-BE' ? 'nl' : locale;
  const messages = await getMessages({locale});

  return (
    <html lang={htmlLang} className={inter.variable} suppressHydrationWarning>
      <body className="font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
