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

// Basic Latvian-centric metadata mapping (will fallback for other locales)
const META: Record<string, {title: string; description: string}> = {
  'jumta-renovacija': {
    title: 'Jumta renovācija | Profesionāli jumta risinājumi Latvijā',
    description: 'Pilna cikla jumta renovācija: konstrukciju atjaunošana, siltināšana, jumta seguma nomaiņa, jumta logu uzstādīšana. Sertificēti meistari, 10 gadu garantija.'
  },
  'jumta-seguma-montaza': {
    title: 'Jumta seguma montāža | Valcprofils, dakstiņi, skārds',
    description: 'Jumta seguma profesionāla montāža: valcprofils, dakstiņi, skārda elementi, hermētiski pieslēgumi. Kvalitatīvi materiāli un pieredzējuši speciālisti.'
  },
  'jumta-buvnieciba': {
    title: 'Jumta būvniecība | Konstrukcija, izolācija, montāža',
    description: 'Pilna cikla jumta būvniecība no projektēšanas līdz gatavam jumtam: konstrukcija, izolācijas materiāli, segums, noteksistēmas. 10 gadu garantija.'
  },
  'jumta-apkope-remonts': {
    title: 'Jumta apkope un remonts | Tīrīšana, bojājumu novēršana',
    description: 'Jumta apkope, bojājumu diagnostika, remonts, noteku tīrīšana, sniega un lapu novākšana, skursteņu apdare. Regulāra apkope pagarina jumta mūžu.'
  },
  'noteksistemu-uzstadisana': {
    title: 'Noteksistēmu uzstādīšana | Efektīva ūdens novadīšana',
    description: 'Kvalitatīva noteksistēmu montāža: notekcaurules, renes, savienojumi, jumta drošība un ūdens novadīšana. Pareiza sistēma aizsargā konstrukciju.'
  },
  'jumta-krasosana': {
    title: 'Jumta krāsošana | Aizsardzība pret koroziju un laikapstākļiem',
    description: 'Profesionāla jumta krāsošana: tīrīšana, rūsas apstrāde, grunts, vairākas krāsas kārtas. Atjauno izskatu un pagarina seguma kalpošanas laiku.'
  }
};

export function generateMetadata({params}: PageProps): Metadata {
  const entry = META[params.slug];
  const canonical = `https://uproof.eu/services/${params.slug}`;
  return {
    title: entry?.title || 'Jumta pakalpojums | UpRoof',
    description: entry?.description || 'Profesionāli jumta pakalpojumi Latvijā ar garantiju.',
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title: entry?.title || 'Jumta pakalpojums | UpRoof',
      description: entry?.description || 'Profesionāli jumta pakalpojumi Latvijā ar garantiju.'
    },
    twitter: {
      title: entry?.title || 'Jumta pakalpojums | UpRoof',
      description: entry?.description || 'Profesionāli jumta pakalpojumi Latvijā ar garantiju.'
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
    areaServed: { '@type': 'Country', name: 'Latvia' },
    provider: {
      '@type': 'Organization',
      name: 'UpRoof',
      url: 'https://uproof.eu'
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
      availability: 'https://schema.org/InStock'
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
          <div className="bg-primary-600/10 border-l-4 border-primary-600 p-6 rounded-md mb-8">
            <p className="font-semibold text-primary-800">
              Bezmaksas sākotnējā konsultācija un jumta stāvokļa novērtējums. Rakstiet vai zvaniet: <a href="tel:+37125612440" className="underline">+371 25612440</a>
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
