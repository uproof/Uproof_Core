import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {Inter} from 'next/font/google';
import type {Metadata} from 'next';
import '../globals.css';

const inter = Inter({ 
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'UpRoof | Professional Roofing Services | Jumtu būvniecība',
  description: 'Professional roofing services in Latvia. Roof construction, painting, maintenance, and repairs. Expert roofing solutions from A to Z. Profesionāli jumta risinājumi Latvijā.',
  keywords: 'roofing, roof construction, roof painting, roof maintenance, Latvia, Latvija, jumtu būvniecība, jumta krāsošana, jumta apkope',
  authors: [{name: 'UpRoof'}],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'UpRoof | Professional Roofing Services',
    description: 'Expert roofing solutions - construction, painting, and maintenance',
    type: 'website',
    locale: 'lv_LV',
    alternateLocale: ['en_US', 'nl_BE'],
    siteName: 'UpRoof',
  },
  robots: {
    index: true,
    follow: true,
  },
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
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
