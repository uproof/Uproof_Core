import {unstable_setRequestLocale} from 'next-intl/server';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import InternalLinks from '@/components/InternalLinks';

const MATERIAL_SPECS: Record<string, { title: Record<string,string>; description: Record<string,string>; thickness?: string; finishes?: string[]; typicalUse?: string[]; }> = {
  'valcprofils': {
    title: { lv: 'Valcprofila jumta materiāls', en: 'Standing Seam (Valcprofils) Roofing Material', 'nl-BE': 'Staande naad dakmateriaal' },
    description: {
      lv: 'Profesionāls valcprofila jumta segums ar dubultajām locījuma hermētiskajām šuvēm, piemērots ilgnoturīgiem projektiem.',
      en: 'Professional standing seam metal roofing with double lock seams for longevity and weather resistance.',
      'nl-BE': 'Professionele staande naad metalen dakbedekking met dubbele sluitnaden voor duurzaamheid.'
    },
    thickness: '0.5mm–0.6mm',
    finishes: ['Matte','Semi-matte'],
    typicalUse: ['Residential pitched roofs','Heritage buildings','Complex flashing zones']
  },
  'pvc-tpo': {
    title: { lv: 'PVC / TPO plēves jumts', en: 'PVC / TPO Membrane Roofing', 'nl-BE': 'PVC / TPO dakfolie' },
    description: {
      lv: 'Plakanajiem jumtiem ar augstu hidroizolāciju – PVC un TPO membrānas risinājumi.',
      en: 'Flat roof waterproofing solutions using PVC and TPO membranes.',
      'nl-BE': 'Waterdichte oplossingen voor platte daken met PVC en TPO membranen.'
    },
    thickness: '1.2mm–1.8mm',
    finishes: ['Light Grey','White'],
    typicalUse: ['Flat roofs','Commercial buildings','Energy-efficient retrofits']
  },
  'bitumena-rulli': {
    title: { lv: 'Bitumena ruļļu segums', en: 'Bitumen Roll Roofing', 'nl-BE': 'Bitumen rol dakbedekking' },
    description: {
      lv: 'Ekonomisks risinājums plakanajiem jumtiem ar vairākslāņu hidroizolāciju.',
      en: 'Economical multi-layer waterproofing solution for flat roofs.',
      'nl-BE': 'Economische meerlaagse waterdichting voor platte daken.'
    },
    thickness: '3–5mm (layers)',
    finishes: ['Granulated','Smooth'],
    typicalUse: ['Garages','Outbuildings','Industrial']
  },
  'dakstini': {
    title: { lv: 'Keramikas / betona dakstiņi', en: 'Clay / Concrete Roof Tiles', 'nl-BE': 'Kleien / betonnen dakpannen' },
    description: {
      lv: 'Tradicionāls risinājums ar augstu estētiku un ilgmūžību slīpiem jumtiem.',
      en: 'Traditional pitched roof solution offering durability and aesthetic appeal.',
      'nl-BE': 'Traditionele oplossing voor hellende daken met duurzaamheid en esthetiek.'
    },
    thickness: '10–15mm (tile body)',
    finishes: ['Natural','Glazed'],
    typicalUse: ['Residential pitched roofs','Renovations','Aesthetic builds']
  },
  'bezazbesta-siferis': {
    title: { lv: 'Bezazbesta šīferis', en: 'Non-Asbestos Fibre Cement Slate', 'nl-BE': 'Asbestvrije vezelcement leien' },
    description: {
      lv: 'Drošs un videi draudzīgs slīpo jumtu segums ar labu mehānisku izturību.',
      en: 'Safe, eco-friendly fibre cement slate for pitched roofs with good mechanical resistance.',
      'nl-BE': 'Veilige, milieuvriendelijke vezelcementleien voor hellende daken.'
    },
    thickness: '4–6mm',
    finishes: ['Smooth','Textured'],
    typicalUse: ['Eco-oriented projects','Renovations']
  },
  'ruukki-classic': {
    title: { lv: 'Ruukki Classic profils', en: 'Ruukki Classic Profile', 'nl-BE': 'Ruukki Classic profiel' },
    description: {
      lv: 'Premium metāla profils ar klasisku vizuālo izskatu un ilgu kalpošanas laiku.',
      en: 'Premium metal profile offering classic aesthetics and long service life.',
      'nl-BE': 'Premium metalen profiel met klassiek uiterlijk en lange levensduur.'
    },
    thickness: '0.5mm',
    finishes: ['Matte','Semi-matte'],
    typicalUse: ['High-end residential','Architectural accents']
  },
  'jumta-krasa': {
    title: { lv: 'Jumta krāsas un pārklājumi', en: 'Roof Paints & Coatings', 'nl-BE': 'Dakverf & Coatings' },
    description: {
      lv: 'Profesionāli jumta aizsargpārklājumi un krāsas metāla jumtiem – ilgmūžīga aizsardzība pret koroziju un UV.',
      en: 'Professional roof protective coatings and paints for metal roofs – long-lasting protection against corrosion and UV.',
      'nl-BE': 'Professionele dakbeschermende coatings en verven voor metalen daken – langdurige bescherming tegen corrosie en UV.'
    },
    thickness: '60–120 μm (dry film)',
    finishes: ['Matte', 'Satin', 'Gloss'],
    typicalUse: ['Metal roof restoration', 'Preventive maintenance', 'Color refresh']
  }
};

export function generateStaticParams() {
  return Object.keys(MATERIAL_SPECS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const {slug, locale} = await params;
  const spec = MATERIAL_SPECS[slug];
  const title = spec?.title[locale] || slug;
  const description = spec?.description[locale] || '';
  return {
    title: `${title} | UpRoof`,
    description,
    alternates: {
      canonical: `https://uproof.eu/${locale}/materials/${slug}`,
      languages: {
        lv: `https://uproof.eu/lv/materials/${slug}`,
        en: `https://uproof.eu/en/materials/${slug}`,
        'nl-BE': `https://uproof.eu/nl-BE/materials/${slug}`,
        'x-default': `https://uproof.eu/lv/materials/${slug}`,
      },
    }
  };
}

export default async function MaterialSpecPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const {slug, locale} = await params;
  unstable_setRequestLocale(locale);
  const spec = MATERIAL_SPECS[slug];
  if (!spec) return <main><p>Material not found</p></main>;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: spec.title[locale],
    description: spec.description[locale],
    material: slug,
    additionalProperty: [
      spec.thickness && { '@type': 'PropertyValue', name: 'thickness', value: spec.thickness },
      spec.finishes && { '@type': 'PropertyValue', name: 'finishes', value: spec.finishes.join(', ') },
    ].filter(Boolean),
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: `${spec.title[locale]} installation`,
    areaServed: locale === 'nl-BE'
      ? ['Belgium']
      : ['Latvia'],
    provider: { '@id': 'https://uproof.eu/#organization' }
  };

  return (
    <main className="min-h-screen">
      <Header />
      <Breadcrumbs />
      <section className="pt-24 pb-12 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{spec.title[locale]}</h1>
          <p className="text-lg text-gray-700 mb-6">{spec.description[locale]}</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-5">
              <h2 className="font-semibold mb-2">Specification</h2>
              <ul className="text-sm text-gray-700 space-y-1">
                {spec.thickness && <li><strong>Thickness:</strong> {spec.thickness}</li>}
                {spec.finishes && <li><strong>Finishes:</strong> {spec.finishes.join(', ')}</li>}
              </ul>
            </div>
            <div className="bg-white shadow rounded-lg p-5">
              <h2 className="font-semibold mb-2">Typical Use Cases</h2>
              <ul className="text-sm text-gray-700 space-y-1">
                {spec.typicalUse?.map(u => <li key={u}>{u}</li>)}
              </ul>
            </div>
            <div className="bg-white shadow rounded-lg p-5">
              <h2 className="font-semibold mb-2">Installation & Service</h2>
              <p className="text-sm text-gray-700">We provide professional installation of {spec.title[locale]} with precision flashing and moisture control best practices.</p>
            </div>
          </div>
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-5">
              <h2 className="font-semibold mb-2">Overview</h2>
              <p className="text-sm text-gray-700">{locale==='lv'?'Materiāla priekšrocības, ierobežojumi un piemērotība konkrētam jumta tipam.':'Material advantages, limitations, and suitability for specific roof types.'}</p>
              <ul className="text-sm text-gray-700 list-disc pl-5 mt-2 space-y-1">
                <li>{locale==='lv'?'Izturība pret laikapstākļiem':'Weather resistance'}</li>
                <li>{locale==='lv'?'Savienojumu hermētiskums':'Joint watertightness'}</li>
                <li>{locale==='lv'?'Apkope un kalpošanas laiks':'Maintenance and service life'}</li>
              </ul>
            </div>
            <div className="bg-white shadow rounded-lg p-5">
              <h2 className="font-semibold mb-2">Installation Steps</h2>
              <ol className="text-sm text-gray-700 list-decimal pl-5 space-y-1">
                <li>{locale==='lv'?'Pamatu un slīpuma novērtējums':'Base and slope assessment'}</li>
                <li>{locale==='lv'?'Tvaika un hidroizolācijas slāņi':'Vapour and waterproofing layers'}</li>
                <li>{locale==='lv'?'Savienojumu un pieslēgumu izpilde pie sienām/korēm':'Wall/ridge flashing and junctions'}</li>
                <li>{locale==='lv'?'Noteksistēmu integrācija':'Gutter system integration'}</li>
              </ol>
            </div>
            <div className="md:col-span-2 bg-primary-50 border border-primary-200 rounded-lg p-5">
              <h2 className="font-semibold mb-2">FAQs</h2>
              <ul className="text-sm text-gray-700 space-y-2">
                <li><strong>{locale==='lv'?'Vai iespējams ziemas darbs?':'Winter work possible?'}</strong> {locale==='lv'?'Neatliekamus remontdarbus veicam visa gada garumā ar atbilstošām tehnoloģijām.':'Emergency repairs are performed year-round with appropriate techniques.'}</li>
                <li><strong>{locale==='lv'?'Kā novērst kondensāciju?':'How to prevent condensation?'}</strong> {locale==='lv'?'Pareiza ventilācija un precīzi skārda/folijas pieslēgumi.':'Proper ventilation and precise sheet/membrane connections.'}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <InternalLinks locale={locale} currentSlug={slug} context="material" />
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
    </main>
  );
}
