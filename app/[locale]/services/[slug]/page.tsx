import {unstable_setRequestLocale} from 'next-intl/server';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

// Service slugs focused on Latvian queries
const SERVICE_SLUGS = [
  'jumta-renovacija',
  'jumta-seguma-montaza',
  'jumta-buvnieciba',
  'jumta-apkope-remonts',
  'noteksistemu-uzstadisana',
  'jumta-krasosana'
];

type PageProps = {
  params: {locale: string; slug: string};
};

export function generateStaticParams() {
  const locales = ['lv','en','nl-BE'];
  return locales.flatMap(locale => SERVICE_SLUGS.map(slug => ({ locale, slug })));
}

// Latvian-centric metadata with geographic keywords for Riga and Latvia
const META: Record<string, {title: string; description: string; keywords: string}> = {
  'jumta-renovacija': {
    title: 'Jumta renovācija Rīgā | Profesionāli jumta risinājumi Latvijā | UpRoof',
    description: 'Pilna cikla jumta renovācija Rīgā un Pierīgā: konstrukciju atjaunošana, siltināšana, jumta seguma nomaiņa, jumta logu uzstādīšana. Sertificēti meistari, 10 gadu garantija. Apkalpojam Rīgu, Jūrmalu, Jelgavu.',
    keywords: 'jumta renovācija Rīgā, jumta renovācija Latvijā, jumta atjaunošana Rīgā, jumta remonts Pierīgā'
  },
  'jumta-seguma-montaza': {
    title: 'Jumta seguma montāža Rīgā | Valcprofils, dakstiņi, skārds | UpRoof',
    description: 'Jumta seguma profesionāla montāža Rīgā un Latvijā: valcprofils, dakstiņi, skārda elementi, hermētiski pieslēgumi. Kvalitatīvi materiāli un pieredzējuši speciālisti Rīgā, Jūrmalā, Pierīgā.',
    keywords: 'jumta seguma montāža Rīgā, jumta segums Latvijā, valcprofila montāža Rīgā, dakstiņu uzstādīšana Rīgā'
  },
  'jumta-buvnieciba': {
    title: 'Jumta būvniecība Rīgā | Konstrukcija, izolācija, montāža | UpRoof',
    description: 'Pilna cikla jumta būvniecība Rīgā no projektēšanas līdz gatavam jumtam: konstrukcija, izolācijas materiāli, segums, noteksistēmas. 10 gadu garantija. Apkalpojam Rīgu, Pierīgu, Jūrmalu, Jelgavu.',
    keywords: 'jumta būvniecība Rīgā, jumtu būvniecība Latvijā, jauna jumta celtniecība Rīgā, jumta konstrukcija Pierīgā'
  },
  'jumta-apkope-remonts': {
    title: 'Jumta apkope un remonts Rīgā | Tīrīšana, bojājumu novēršana | UpRoof',
    description: 'Jumta apkope Rīgā: bojājumu diagnostika, remonts, noteku tīrīšana, sniega un lapu novākšana, skursteņu apdare. Regulāra apkope pagarina jumta mūžu. Serviss Rīgā, Jūrmalā, Pierīgā.',
    keywords: 'jumta apkope Rīgā, jumta remonts Rīgā, jumta tīrīšana Latvijā, jumta serviss Pierīgā'
  },
  'noteksistemu-uzstadisana': {
    title: 'Noteksistēmu uzstādīšana jumtam Rīgā | Efektīva ūdens novadīšana | UpRoof',
    description: 'Kvalitatīva noteksistēmu montāža Rīgā un Latvijā: notekcaurules, renes, savienojumi, jumta drošība un ūdens novadīšana. Pareiza sistēma aizsargā konstrukciju. Pakalpojums Rīgā, Pierīgā, Jūrmalā.',
    keywords: 'noteksistēmu uzstādīšana Rīgā, noteksistēmu montāža jumtam Latvijā, notekcaurules Rīgā, renes uzstādīšana Pierīgā'
  },
  'jumta-krasosana': {
    title: 'Jumta krāsošana Rīgā | Aizsardzība pret koroziju un laikapstākļiem | UpRoof',
    description: 'Profesionāla jumta krāsošana Rīgā un Latvijā: tīrīšana, rūsas apstrāde, grunts, vairākas krāsas kārtas. Atjauno izskatu un pagarina seguma kalpošanas laiku. Apkalpojam Rīgu, Jūrmalu, Pierīgu, Jelgavu.',
    keywords: 'jumta krāsošana Rīgā, jumta krāsošana Latvijā, metāla jumta krāsošana Rīgā, jumta aizsardzība Pierīgā'
  }
};

export function generateMetadata({params}: PageProps): Metadata {
  const entry = META[params.slug];
  const canonical = `https://uproof.eu/services/${params.slug}`;
  return {
    title: entry?.title || 'Jumta pakalpojums Rīgā | UpRoof',
    description: entry?.description || 'Profesionāli jumta pakalpojumi Rīgā, Pierīgā un visā Latvijā ar garantiju.',
    keywords: entry?.keywords || 'jumta pakalpojumi Rīgā, jumtu būvniecība Latvijā',
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title: entry?.title || 'Jumta pakalpojums Rīgā | UpRoof',
      description: entry?.description || 'Profesionāli jumta pakalpojumi Rīgā, Pierīgā un visā Latvijā ar garantiju.',
      locale: 'lv_LV',
      type: 'website'
    },
    twitter: {
      title: entry?.title || 'Jumta pakalpojums Rīgā | UpRoof',
      description: entry?.description || 'Profesionāli jumta pakalpojumi Rīgā, Pierīgā un visā Latvijā ar garantiju.',
      card: 'summary_large_image'
    }
  };
}

export default function ServiceLanding({params: {locale, slug}}: PageProps) {
  unstable_setRequestLocale(locale);
  const meta = META[slug];
  const h1 = meta?.title.split('|')[0]?.trim() || 'Jumta pakalpojums';
  const description = meta?.description;

  // FAQ pairs (simplified) for structured data enrichment per service
  const faqs = [
    {q: 'Cik ilgs ir jumta renovācijas process?', a: 'Atkarībā no jumta stāvokļa – vidēji 3–10 darba dienas, iekļaujot demontāžu, konstrukciju atjaunošanu un seguma montāžu.'},
    {q: 'Vai jumta seguma montāžai ir garantija?', a: 'Jā, standarta garantija ir 10 gadi uz darbu un atsevišķi uz materiāliem atbilstoši ražotāja noteikumiem.'},
    {q: 'Kāpēc nepieciešama regulāra jumta apkope?', a: 'Tā pagarina jumta kalpošanas laiku, novērš noplūdes un ļauj savlaicīgi pamanīt bojājumus pirms tie kļūst dārgi.'},
    {q: 'Cik bieži jākrāso metāla jumts?', a: 'Parasti ik pēc 8–12 gadiem, atkarībā no sākotnējās apstrādes un ekspluatācijas apstākļiem.'}
  ];

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: h1,
    serviceType: h1,
    // Multiple geographic areas served
    areaServed: [
      { 
        '@type': 'City', 
        name: 'Rīga',
        '@id': 'https://www.wikidata.org/wiki/Q1773'
      },
      { '@type': 'City', name: 'Jūrmala' },
      { '@type': 'City', name: 'Jelgava' },
      { '@type': 'City', name: 'Ogre' },
      { '@type': 'City', name: 'Salaspils' },
      { '@type': 'AdministrativeArea', name: 'Pierīga' },
      { 
        '@type': 'Country', 
        name: 'Latvia',
        '@id': 'https://www.wikidata.org/wiki/Q211'
      }
    ],
    provider: {
      '@type': 'RoofingContractor',
      name: 'UpRoof',
      url: 'https://uproof.eu',
      telephone: '+371-25612440',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Rīga',
        addressCountry: 'LV'
      }
    },
    description,
    offers: {
      '@type': 'Offer',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'EUR',
        price: '0',
        eligibleQuantity: { '@type': 'QuantitativeValue', value: 1 }
      },
      availability: 'https://schema.org/InStock',
      areaServed: 'Rīga, Pierīga, Jūrmala, Jelgava, Latvija'
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };

  return (
    <main className="min-h-screen">
      <Header />
      <Breadcrumbs />
      <section className="pt-20 pb-10 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{h1}</h1>
          {description && (
            <p className="text-lg text-gray-700 leading-relaxed mb-6">{description}</p>
          )}
          
          {/* Geographic service area highlight */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              📍 Apkalpojamās teritorijas
            </h2>
            <p className="text-gray-700 mb-3">
              Mēs sniedzam jumta pakalpojumus visā Latvijā ar galveno fokusu uz Rīgu un Pierīgas reģionu:
            </p>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-700">
              <li className="flex items-center">✓ <strong className="ml-1">Rīga</strong></li>
              <li className="flex items-center">✓ Jūrmala</li>
              <li className="flex items-center">✓ Jelgava</li>
              <li className="flex items-center">✓ Ogre</li>
              <li className="flex items-center">✓ Salaspils</li>
              <li className="flex items-center">✓ Ķekava</li>
              <li className="flex items-center">✓ Pierīgas rajons</li>
              <li className="flex items-center">✓ Un visa Latvija</li>
            </ul>
            <p className="text-sm text-gray-600 mt-4">
              Ātra reakcija Rīgā un tuvākajās pilsētās (1-2 darba dienas). Bezmaksas novērtējums visās apkalpojamās teritorijās.
            </p>
          </div>

          <div className="bg-primary-600/10 border-l-4 border-primary-600 p-6 rounded-md mb-8">
            <p className="font-semibold text-primary-800">
              Bezmaksas sākotnējā konsultācija un jumta stāvokļa novērtējums Rīgā un Pierīgā. Rakstiet vai zvaniet: <a href="tel:+37125612440" className="underline">+371 25612440</a>
            </p>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Biežāk uzdotie jautājumi</h2>
          <ul className="space-y-4 mb-10">
            {faqs.map(f => (
              <li key={f.q}>
                <h3 className="font-semibold text-gray-900">{f.q}</h3>
                <p className="text-gray-700">{f.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(serviceSchema)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}} />
    </main>
  );
}
