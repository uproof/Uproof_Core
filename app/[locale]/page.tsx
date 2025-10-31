import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Solutions from '@/components/Solutions';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import Reviews from '@/components/Reviews';
import FAQ from '@/components/FAQ';

type Props = {
  params: {locale: string};
};

export default function HomePage({params: {locale}}: Props) {
  unstable_setRequestLocale(locale);

  return (
    <main className="min-h-screen">
  <Header showText={false} largeLogo={true} />
      <Hero />
      <Services />
      <Reviews />
      <Solutions />
      <FAQ />
      <ContactSection />
      <Footer />
    </main>
  );
}


