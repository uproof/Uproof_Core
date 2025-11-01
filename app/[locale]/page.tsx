import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Solutions from '@/components/Solutions';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
const Reviews = dynamic(() => import('@/components/Reviews'), { ssr: false });
const FAQ = dynamic(() => import('@/components/FAQ'), { ssr: false });

type Props = {
  params: {locale: string};
};

export default function HomePage({params: {locale}}: Props) {
  unstable_setRequestLocale(locale);

  return (
    <main className="min-h-screen">
  <Header showText={false} largeLogo={true} />
  <Hero />
  <Services limit={3} />
      <Reviews />
      <Solutions />
      <FAQ />
      <ContactSection />
      <Footer />
    </main>
  );
}


