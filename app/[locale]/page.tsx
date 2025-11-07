import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Solutions from '@/components/Solutions';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import nextDynamic from 'next/dynamic';
import type {Metadata} from 'next';
const Reviews = nextDynamic(() => import('@/components/Reviews'), { ssr: false });
const FAQ = nextDynamic(() => import('@/components/FAQ'), { ssr: false });

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

// Prefer static generation to reduce TTFB and stabilize LCP
export const dynamic = 'force-static';
export const revalidate = 3600; // Re-generate once per hour

// Homepage canonical (layout canonical removed to avoid duplication)
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://uproof.eu/'
  }
};


