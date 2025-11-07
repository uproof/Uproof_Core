import {unstable_setRequestLocale} from 'next-intl/server';
import {useTranslations} from 'next-intl';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import ContactSection from '@/components/ContactSection';

export const metadata: Metadata = {
  title: 'Contact Us | Free Roofing Quote Latvia',
  description: 'Get a free roofing quote in Latvia. Contact UpRoof for professional roofing services. Phone: +371 25612440. Fast response guaranteed.',
  alternates: {
    canonical: 'https://uproof.eu/contact'
  }
};

export default function ContactPage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('pages.contact');
  return (
    <main className="min-h-screen">
      <Header />
      <Breadcrumbs />
      <section className="pt-24 pb-10 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{t('title')}</h1>
        </div>
      </section>
      <ContactSection />
      <Footer />
    </main>
  );
}
