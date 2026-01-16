import {unstable_setRequestLocale, getTranslations} from 'next-intl/server';
import {useTranslations} from 'next-intl';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import MiersMethod from '@/components/MiersMethod';

export async function generateMetadata({params: {locale}}: {params: {locale: string}}): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: 'pages.about'});
  
  return {
    title: 'About UpRoof | Professional Roofing Company Latvia',
    description: 'UpRoof: certified roofing specialists in Latvia. 10-year warranty, quality materials, expert workmanship. Learn about our MIERS construction method.',
    alternates: {
      canonical: `https://uproof.eu/${locale}/about`
    }
  };
}

export default function AboutPage({params: {locale}}: {params: {locale: string}}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('pages.about');

  const values = ['quality','reliability','certified','guarantee','contract','fixedcost','payment','partners','insurance'];

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Breadcrumbs />
      
      {/* HERO SECTION */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-gray-900 to-gray-900" />
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: "url('/images/services/construction.webp')" }} />
        
        {/* Subtle blur accents */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-20 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-28">
          <div className="max-w-3xl">
            <p className="text-primary-400 font-semibold uppercase tracking-wider text-sm mb-3">
              {locale === 'nl-BE' ? 'Over Ons' : locale === 'en' ? 'About Us' : 'Par Mums'}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">{t('title')}</h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              {t('description')}
            </p>
          </div>
        </div>
        
        {/* Smooth bottom fade */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-20" 
          style={{ 
            background: 'linear-gradient(to top, rgb(255,255,255) 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)' 
          }} 
        />
      </section>

      {/* VALUES SECTION */}
      <section className="pt-10 pb-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {locale === 'nl-BE' ? 'Waarom Kiezen voor UpRoof?' : locale === 'en' ? 'Why Choose UpRoof?' : 'Kāpēc Izvēlēties UpRoof?'}
            </h2>
            <div className="w-16 h-1 bg-primary-600 mx-auto" />
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((key, idx) => (
              <div 
                key={key} 
                className="group bg-gray-50 border border-gray-100 rounded-xl p-6 hover:border-primary-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-700 font-bold rounded-lg flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{t(`values.${key}.title`)}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{t(`values.${key}.description`)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* M-I-E-R-S METHOD */}
      <section className="py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MiersMethod locale={locale} />
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 text-white rounded-2xl p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="font-bold text-2xl sm:text-3xl mb-2">
                  {locale === 'nl-BE' ? 'Klaar om te starten?' : locale === 'en' ? 'Ready to get started?' : 'Gatavs sākt?'}
                </h3>
                <p className="text-gray-400 text-lg">
                  {locale === 'nl-BE' 
                    ? 'Gratis eerste consultatie en offerte zonder verplichtingen.'
                    : locale === 'en'
                    ? 'Free initial consultation and quote with no obligations.'
                    : 'Bezmaksas sākotnējā konsultācija un piedāvājums bez saistībām.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <a 
                  href={`/${locale}/contact`}
                  className="inline-block bg-primary-600 text-white px-8 py-4 text-sm font-bold uppercase hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-600/30"
                >
                  {locale === 'nl-BE' ? 'Offerte aanvragen' : locale === 'en' ? 'Request a Quote' : 'Pieprasīt piedāvājumu'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
