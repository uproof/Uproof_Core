import {unstable_setRequestLocale} from 'next-intl/server';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import InternalLinks from '@/components/InternalLinks';
import MiersMethod from '@/components/MiersMethod';
import { getCityContent } from '@/data/citiesContent';
import {citiesByLocale, locales, belgiumCities} from '@/lib/cities';

const BELGIUM_CITY_SET = new Set<string>(belgiumCities);

export function generateStaticParams() {
  return locales.flatMap((locale) => (citiesByLocale[locale] ?? []).map((city) => ({ locale, city })));
}

function cityName(slug: string, locale: string) {
  const map: Record<string, Record<string,string>> = {
    riga: { lv: 'Rīga', en: 'Riga', 'nl-BE': 'Riga' },
    jurmala: { lv: 'Jūrmala', en: 'Jurmala', 'nl-BE': 'Jurmala' },
    jelgava: { lv: 'Jelgava', en: 'Jelgava', 'nl-BE': 'Jelgava' },
    ogre: { lv: 'Ogre', en: 'Ogre', 'nl-BE': 'Ogre' },
    salaspils: { lv: 'Salaspils', en: 'Salaspils', 'nl-BE': 'Salaspils' },
    kekava: { lv: 'Ķekava', en: 'Kekava', 'nl-BE': 'Ķekava' },
    brussel: { lv: 'Brisele', en: 'Brussels', 'nl-BE': 'Brussel' },
    antwerpen: { lv: 'Antverpene', en: 'Antwerp', 'nl-BE': 'Antwerpen' },
    gent: { lv: 'Gente', en: 'Ghent', 'nl-BE': 'Gent' },
    brugge: { lv: 'Brige', en: 'Bruges', 'nl-BE': 'Brugge' },
    leuven: { lv: 'Levene', en: 'Leuven', 'nl-BE': 'Leuven' },
    mechelen: { lv: 'Mehelene', en: 'Mechelen', 'nl-BE': 'Mechelen' }
  };
  return map[slug]?.[locale] || map[slug]?.lv || slug;
}

export async function generateMetadata({params}: {params: Promise<{locale: string; city: string}>}): Promise<Metadata> {
  const {locale, city} = await params;
  const name = cityName(city, locale);
  const isBelgiumCity = BELGIUM_CITY_SET.has(city);
  const countryLabel = isBelgiumCity ? (locale === 'lv' ? 'Beļģijā' : locale === 'nl-BE' ? 'in België' : 'in Belgium') : (locale === 'nl-BE' ? 'in Letland' : locale === 'en' ? 'in Latvia' : 'Latvijā');
  const canonical = `https://uproof.eu/${locale}/cities/${city}`;
  const languages: Record<string,string> = {
    lv: `https://uproof.eu/lv/cities/${city}`,
    en: `https://uproof.eu/en/cities/${city}`,
    'nl-BE': `https://uproof.eu/nl-BE/cities/${city}`,
    'x-default': `https://uproof.eu/lv/cities/${city}`
  };
  const titleMap: Record<string,string> = {
    lv: `Jumta pakalpojumi ${name} | Būvniecība, remonts, apkope | UpRoof`,
    en: `Roofing Services in ${name} | Construction, Repair & Maintenance | UpRoof`,
    'nl-BE': `Dakdiensten in ${name} | Constructie, Renovatie & Onderhoud | UpRoof`
  };
  const descMap: Record<string,string> = {
    lv: `Profesionāli jumta pakalpojumi ${name} ${countryLabel}: jumta būvniecība, jumta renovācija, jumta remonts, valcprofils, noteksistēmas un jumta logi. 10 gadu garantija. Bezmaksas novērtējums.`,
    en: `Professional roofing services in ${name} ${countryLabel}: roof construction, roof renovation, roof repair, standing seam, gutters and skylights. 10-year warranty. Free assessment.`,
    'nl-BE': `Professionele dakdiensten in ${name} ${countryLabel}: dakbouw, dakrenovatie, dakreparatie, staande naad, goten en dakramen. 10 jaar garantie. Gratis evaluatie.`
  };
  const title = titleMap[locale] || titleMap.lv;
  const description = descMap[locale] || descMap.lv;
  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true
      }
    },
    alternates: { canonical, languages },
    openGraph: { url: canonical, title, description, locale, type: 'website' },
    twitter: { title, description, card: 'summary_large_image' }
  };
}

export default async function CityLanding({params}: {params: Promise<{locale: string; city: string}>}) {
  const {locale, city} = await params;
  unstable_setRequestLocale(locale);
  const displayName = cityName(city, locale);
  const content = getCityContent(city, locale as any);

  // Basic service bullet points reused per city
  const services = locale === 'nl-BE'
    ? ['Dakrenovatie','Staande naad montage','Pannendaken','Dakramen','Dakonderhoud','Gootsystemen']
    : locale === 'en'
    ? ['Roof renovation','Standing seam install','Tile roofing','Skylight installation','Roof maintenance','Gutter systems']
    : ['Jumta renovācija','Valcprofila montāža','Dakstiņu jumti','Jumta logu montāža','Jumta apkope','Noteksistēmas'];

  return (
    <main className="min-h-screen">
      <Header />
      <Breadcrumbs />
      <section className="pt-24 pb-12 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {content?.hero?.heading || (locale === 'nl-BE' ? 'Dakdiensten in ' : locale === 'en' ? 'Roofing services in ' : 'Jumta pakalpojumi ') + displayName}
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            {content?.hero?.subheading || (locale === 'nl-BE'
              ? `Volledige dakoplossingen in ${displayName} en omliggende regio: renovatie, bouw, onderhoud en gespecialiseerde premium montage.`
              : locale === 'en'
              ? `Complete roofing solutions in ${displayName} and surrounding area: construction, renovation, maintenance and premium system installation.`
              : `Pilns jumta pakalpojumu spektrs ${displayName} un apkārtnē: būvniecība, renovācija, apkope un speciālās premium montāžas.`)}
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <h2 className="text-2xl font-semibold mb-4">
                {locale === 'nl-BE' ? 'Pakalpojumi' : locale === 'en' ? 'Services' : 'Pakalpojumi'}
              </h2>
              <ul className="space-y-2">
                {services.map(s => (
                  <li key={s} className="flex items-start"><span className="text-primary-600 mr-2">•</span><span>{s}</span></li>
                ))}
              </ul>
            </div>
            <div className="bg-primary-600/10 rounded-xl p-6 border border-primary-200">
              <h2 className="text-2xl font-semibold mb-4">
                {locale === 'nl-BE' ? 'Waarom UpRoof?' : locale === 'en' ? 'Why UpRoof?' : 'Kāpēc UpRoof?'}
              </h2>
              <ul className="space-y-2 text-gray-800">
                <li>{locale === 'nl-BE' ? '10 jaar garantie op vakwerk' : locale === 'en' ? '10-year warranty on workmanship' : '10 gadu garantija uz darbu'}</li>
                <li>{locale === 'nl-BE' ? 'Gecertificeerde specialisten' : locale === 'en' ? 'Certified specialists' : 'Sertificēti speciālisti'}</li>
                <li>{locale === 'nl-BE' ? 'Snelle reactie & duidelijke offerte' : locale === 'en' ? 'Fast response & clear estimate' : 'Ātra reakcija & skaidra tāme'}</li>
                <li>{locale === 'nl-BE' ? 'Premium materialen (Ruukki, Velux)' : locale === 'en' ? 'Premium materials (Ruukki, Velux)' : 'Premium materiāli (Ruukki, Velux)'}</li>
              </ul>
            </div>
          </div>
          <MiersMethod locale={locale} variant="compact" />
          {/* City-specific sections */}
          {content && (
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <h2 className="text-2xl font-semibold mb-2">{content.climate.title}</h2>
                <p className="text-gray-700">{content.climate.body}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <h2 className="text-2xl font-semibold mb-2">{content.regulations.title}</h2>
                <p className="text-gray-700">{content.regulations.body}</p>
              </div>
              {content.examples && content.examples.length > 0 && (
                <div className="md:col-span-2 bg-primary-50 rounded-xl p-6 border border-primary-200">
                  <h2 className="text-2xl font-semibold mb-4">Projecten / Projekti</h2>
                  <ul className="grid md:grid-cols-2 gap-4">
                    {content.examples.map((ex, idx) => (
                      <li key={idx} className="bg-white rounded-lg p-4 border border-gray-100">
                        <p className="font-semibold">{ex.title}</p>
                        <p className="text-gray-700 text-sm">{ex.summary}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {content.faqs && content.faqs.length > 0 && (
                <div className="md:col-span-2 bg-white rounded-xl shadow p-6 border border-gray-100">
                  <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
                  <ul className="space-y-3">
                    {content.faqs.map((f, i) => (
                      <li key={i}>
                        <p className="font-medium">{f.q}</p>
                        <p className="text-gray-700">{f.a}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className="bg-primary-600/10 border-l-4 border-primary-600 p-6 rounded-md mb-10">
            <p className="font-semibold text-primary-800">
              {locale === 'nl-BE' ? 'Gratis eerste evaluatie. Schrijf of bel: ' : locale === 'en' ? 'Free initial assessment. Write or call: ' : 'Bezmaksas sākotnējais novērtējums. Rakstiet vai zvaniet: '} 
              <a href="tel:+37125612440" className="underline">+371 25612440</a>
            </p>
          </div>
        </div>
      </section>
      <InternalLinks locale={locale} context="service" />
      <Footer />
      {/* City specific LocalBusiness schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'UpRoof',
            url: `https://uproof.eu/${locale}/cities/${city}`,
            areaServed: displayName,
            serviceArea: displayName,
            knowsAbout: content?.recommendedSystems || undefined,
            telephone: '+37125612440',
            image: 'https://uproof.eu/images/og-image.jpg',
            description: (content?.hero?.subheading || `${displayName} roofing services by certified specialists.`)
          })
        }}
      />
    </main>
  );
}