import {unstable_setRequestLocale} from 'next-intl/server';
import {useTranslations} from 'next-intl';
import type {Metadata} from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';

type PageProps = { params: { locale: string } };

const MATERIAL_SLUGS = [
  'valcprofils',
  'pvc-tpo',
  'bitumena-rulli',
  'dakstini',
  'bezazbesta-siferis',
  'ruukki-classic',
  'roof-paint'
];

const MATERIAL_INFO: Record<string, { title: Record<string, string>; description: Record<string, string> }> = {
  'valcprofils': {
    title: { lv: 'Valcprofils (Stāvošā šuve)', en: 'Standing Seam', 'nl-BE': 'Staande naad' },
    description: { lv: 'Profesionāls metāla jumta segums ar hermētiskām šuvēm', en: 'Professional metal roofing with sealed seams', 'nl-BE': 'Professionele metalen dakbedekking met dichte naden' }
  },
  'pvc-tpo': {
    title: { lv: 'PVC / TPO plēves', en: 'PVC / TPO Membrane', 'nl-BE': 'PVC / TPO membraan' },
    description: { lv: 'Plakanajiem jumtiem ar augstu hidroizolāciju', en: 'Flat roof waterproofing solution', 'nl-BE': 'Waterdichte oplossing voor platte daken' }
  },
  'bitumena-rulli': {
    title: { lv: 'Bitumena ruļļi', en: 'Bitumen Rolls', 'nl-BE': 'Bitumen rollen' },
    description: { lv: 'Ekonomisks risinājums plakanajiem jumtiem', en: 'Economical flat roof solution', 'nl-BE': 'Economische oplossing voor platte daken' }
  },
  'dakstini': {
    title: { lv: 'Dakstiņi (keramika/betons)', en: 'Roof Tiles (clay/concrete)', 'nl-BE': 'Dakpannen (klei/beton)' },
    description: { lv: 'Tradicionāls risinājums ar augstu estētiku', en: 'Traditional solution with high aesthetics', 'nl-BE': 'Traditionele oplossing met hoge esthetiek' }
  },
  'bezazbesta-siferis': {
    title: { lv: 'Bezazbesta šīferis', en: 'Non-Asbestos Fibre Cement', 'nl-BE': 'Asbestvrije vezelcement' },
    description: { lv: 'Drošs un videi draudzīgs jumta segums', en: 'Safe and eco-friendly roofing', 'nl-BE': 'Veilige en milieuvriendelijke dakbedekking' }
  },
  'ruukki-classic': {
    title: { lv: 'Ruukki Classic profils', en: 'Ruukki Classic Profile', 'nl-BE': 'Ruukki Classic profiel' },
    description: { lv: 'Premium metāla profils ar klasisku vizuālo izskatu', en: 'Premium metal profile with classic look', 'nl-BE': 'Premium metalen profiel met klassiek uiterlijk' }
  },
  'roof-paint': {
    title: { lv: 'Jumta krāsa', en: 'Roof Paint', 'nl-BE': 'Dakverf' },
    description: { lv: 'Profesionāla jumta aizsargpārklājumu un krāsošana', en: 'Professional roof coating and painting', 'nl-BE': 'Professionele dakcoating en schilderen' }
  }
};

export function generateMetadata({params}: PageProps): Metadata {
  const {locale} = params;
  const canonical = `https://uproof.eu/${locale}/materials`;
  
  const titleMap: Record<string, string> = {
    lv: 'Jumta materiāli | Materiālu katalogs | UpRoof',
    en: 'Roofing Materials | Material Catalog | UpRoof',
    'nl-BE': 'Dakmaterialen | Materiaalcatalogus | UpRoof'
  };
  
  const descMap: Record<string, string> = {
    lv: 'Augstas kvalitātes jumta materiāli: valcprofils, PVC plēves, dakstiņi, bitumens. Profesionāla konsultācija un uzstādīšana.',
    en: 'High-quality roofing materials: standing seam, PVC membranes, tiles, bitumen. Professional consultation and installation.',
    'nl-BE': 'Hoogwaardige dakmaterialen: staande naad, PVC membranen, pannen, bitumen. Professioneel advies en installatie.'
  };
  
  const languages: Record<string, string> = {
    lv: 'https://uproof.eu/lv/materials',
    en: 'https://uproof.eu/en/materials',
    'nl-BE': 'https://uproof.eu/nl-BE/materials',
    'x-default': 'https://uproof.eu/lv/materials'
  };
  
  const title = titleMap[locale] || titleMap.lv;
  const description = descMap[locale] || descMap.lv;
  
  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: { url: canonical, title, description, type: 'website', locale },
    twitter: { title, description, card: 'summary_large_image' }
  };
}

export default function MaterialsPage({params: {locale}}: PageProps) {
  unstable_setRequestLocale(locale);
  const t = useTranslations();

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('materials.title'),
    description: t('materials.description'),
    url: `https://uproof.eu/${locale}/materials`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: MATERIAL_SLUGS.length,
      itemListElement: MATERIAL_SLUGS.map((slug, index) => {
        const info = MATERIAL_INFO[slug];
        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: info.title[locale] || info.title.lv,
            description: info.description[locale] || info.description.lv,
            url: `https://uproof.eu/${locale}/materials/${slug}`
          }
        };
      })
    }
  };

  return (
    <>
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <Breadcrumbs />
          
          <div className="mt-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {locale === 'lv' && 'Jumta materiāli'}
              {locale === 'en' && 'Roofing Materials'}
              {locale === 'nl-BE' && 'Dakmaterialen'}
            </h1>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl">
              {locale === 'lv' && 'Augstas kvalitātes jumta materiāli visiem jumta veidiem. Profesionāla konsultācija un uzstādīšana ar 10 gadu garantiju.'}
              {locale === 'en' && 'High-quality roofing materials for all roof types. Professional consultation and installation with 10-year warranty.'}
              {locale === 'nl-BE' && 'Hoogwaardige dakmaterialen voor alle daktypes. Professioneel advies en installatie met 10 jaar garantie.'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MATERIAL_SLUGS.map(slug => {
                const info = MATERIAL_INFO[slug];
                return (
                  <Link
                    key={slug}
                    href={`/${locale}/materials/${slug}`}
                    className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-300"
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {info.title[locale] || info.title.lv}
                      </h2>
                      <p className="text-gray-600 mb-4">
                        {info.description[locale] || info.description.lv}
                      </p>
                      <div className="flex items-center text-blue-600 font-medium group-hover:translate-x-2 transition-transform">
                        {locale === 'lv' && 'Uzzināt vairāk'}
                        {locale === 'en' && 'Learn more'}
                        {locale === 'nl-BE' && 'Meer info'}
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            
            <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 sm:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {locale === 'lv' && 'Nepieciešama konsultācija?'}
                {locale === 'en' && 'Need consultation?'}
                {locale === 'nl-BE' && 'Advies nodig?'}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {locale === 'lv' && 'Mūsu eksperti palīdzēs izvēlēties piemērotākos materiālus jūsu jumtam un projektam.'}
                {locale === 'en' && 'Our experts will help you choose the most suitable materials for your roof and project.'}
                {locale === 'nl-BE' && 'Onze experts helpen u de meest geschikte materialen voor uw dak en project te kiezen.'}
              </p>
              <a 
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                {locale === 'lv' && 'Sazināties ar mums'}
                {locale === 'en' && 'Contact us'}
                {locale === 'nl-BE' && 'Contacteer ons'}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
