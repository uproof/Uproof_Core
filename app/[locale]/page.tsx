import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Solutions from '@/components/Solutions';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import StatsBar from '@/components/StatsBar';
import FAQ from '@/components/FAQ';

type Props = {
  params: {locale: string};
};

export default function HomePage({params: {locale}}: Props) {
  unstable_setRequestLocale(locale);

  // Stats matching Roofmaster style - update with real data
  const stats = [
    {value: '22+', label: 'Years Experience'},
    {value: '662', label: 'Projects Completed'},
    {value: '98%', label: 'Client Satisfaction'},
    {value: '68', label: 'Cities Served'},
  ];

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <StatsBar stats={stats} />
      <Solutions />
      <FAQ />
      <ContactSection />
      <Footer />
    </main>
  );
}
