import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Solutions from '@/components/Solutions';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

type Props = {
  params: {locale: string};
};

export default function HomePage({params: {locale}}: Props) {
  unstable_setRequestLocale(locale);

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <Solutions />
      <ContactSection />
      <Footer />
    </main>
  );
}
