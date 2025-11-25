import {unstable_setRequestLocale} from 'next-intl/server';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import InternalLinks from '@/components/InternalLinks';

// Service slugs focused on Latvian queries
const SERVICE_SLUGS = [
  'jumta-renovacija',
  'valcprofila-montaza',
  'dakstinu-montaza',
  'jumta-logu-montaza',
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

// Multi-locale metadata with geographic keywords per region
const META: Record<string, {title: Record<string, string>; description: Record<string, string>; keywords: string}> = {
  'jumta-renovacija': {
    title: {
      lv: 'Jumta renovācija Rīgā | Profesionāli jumta risinājumi Latvijā | UpRoof',
      en: 'Roof Renovation in Riga | Professional Roofing Solutions Latvia | UpRoof',
      'nl-BE': 'Dakrenovatie in België | Professionele Dakoplossingen | UpRoof'
    },
    description: {
      lv: 'Pilna cikla jumta renovācija Rīgā un Pierīgā: konstrukciju atjaunošana, siltināšana, jumta seguma nomaiņa, jumta logu uzstādīšana. Sertificēti meistari, 10 gadu garantija. Apkalpojam Rīgu, Jūrmalu, Jelgavu.',
      en: 'Full-cycle roof renovation in Riga and Pieriga: structure renewal, insulation, roofing replacement, skylight installation. Certified craftsmen, 10-year warranty. Serving Riga, Jurmala, Jelgava.',
      'nl-BE': 'Volledige dakrenovatie in België: structuurvernieuwing, isolatie, dakbedekkingsvervanging, dakraaminstallatie. Gecertificeerde vakmannen, 10 jaar garantie. Actief in Kortrijk, Gent, Brugge, Antwerpen.'
    },
    keywords: 'jumta renovācija Rīgā, jumta renovācija Latvijā, jumta atjaunošana Rīgā, jumta remonts Pierīgā, roof renovation Riga, dakrenovatie België'
  },
  'valcprofila-montaza': {
    title: {
      lv: 'Valcprofila montāža Rīgā | Metāla jumta segums ar hermētiskajiem savienojumiem | UpRoof',
      en: 'Standing Seam Metal Roofing in Riga | Hermetic Connections | UpRoof',
      'nl-BE': 'Staande naad metalen dakbedekking in België | Hermetische verbindingen | UpRoof'
    },
    description: {
      lv: 'Valcprofila montāža Rīgā un Latvijā ar pilnībā hermētiskiem dubultlocījumu risinājumiem. Profesionāla skārda apstrāde ar precīziem pieslēgumiem pie logiem un skursteņiem. 10 gadu garantija. Apkalpojam Rīgu, Pierīgu, Jūrmalu.',
      en: 'Standing seam metal roofing installation in Riga and Latvia with fully hermetic double-lock solutions. Professional sheet metal work with precise connections to windows and chimneys. 10-year warranty. Serving Riga, Pieriga, Jurmala.',
      'nl-BE': 'Staande naad metalen dakbedekking installatie in België met volledig hermetische dubbele sluitoplossingen. Professioneel plaatwerk met precieze aansluitingen op ramen en schoorstenen. 10 jaar garantie. Actief in Kortrijk, Gent, Brugge.'
    },
    keywords: 'valcprofila montāža Rīgā, metāla jumts Latvijā, standing seam roofing Riga, staande naad dakbedekking België'
  },
  'dakstinu-montaza': {
    title: {
      lv: 'Dakstiņu montāža Rīgā | Māla un betona dakstiņu jumti | UpRoof',
      en: 'Tile Roof Installation in Riga | Clay and Concrete Tiles | UpRoof',
      'nl-BE': 'Pannendak installatie in België | Klei en betonnen pannen | UpRoof'
    },
    description: {
      lv: 'Māla vai betona dakstiņu montāža Rīgā un Latvijā ar pareizu zemseguma ventilāciju un hermētiskiem skārda pieslēgumiem. Ilgmūžīgi un estētiski jumti. 10 gadu garantija uz darbu. Apkalpojam Rīgu, Pierīgu, Jelgavu.',
      en: 'Clay or concrete tile installation in Riga and Latvia with proper underlayment ventilation and hermetic sheet metal connections. Durable and aesthetic roofs. 10-year warranty on workmanship. Serving Riga, Pieriga, Jelgava.',
      'nl-BE': 'Klei of betonnen pannendak installatie in België met juiste onderlaag ventilatie en hermetische plaatwerk aansluitingen. Duurzame en esthetische daken. 10 jaar garantie op vakmanschap. Actief in Kortrijk, Gent, Brugge, Antwerpen.'
    },
    keywords: 'dakstiņu montāža Rīgā, māla dakstiņi Latvijā, tile roof installation Riga, pannendak installatie België'
  },
  'jumta-logu-montaza': {
    title: {
      lv: 'Jumta logu montāža Rīgā | Roto un Velux jumta logi | UpRoof',
      en: 'Skylight Installation in Riga | Roto and Velux Roof Windows | UpRoof',
      'nl-BE': 'Dakraam installatie in België | Roto en Velux dakvensters | UpRoof'
    },
    description: {
      lv: 'Roto un Velux jumta logu montāža Rīgā un Latvijā. Pievienojam papildus gaismu jumta stāvā, nezaudējot jumta funkcionalitāti. Profesionāla hermētiska uzstādīšana ar garantiju. Apkalpojam Rīgu, Pierīgu, Jūrmalu.',
      en: 'Roto and Velux skylight installation in Riga and Latvia. Add extra light to attic spaces without compromising roof functionality. Professional hermetic installation with warranty. Serving Riga, Pieriga, Jurmala.',
      'nl-BE': 'Roto en Velux dakraam installatie in België. Voeg extra licht toe aan zolderruimtes zonder de dakfunctionaliteit in gevaar te brengen. Professionele hermetische installatie met garantie. Actief in Kortrijk, Gent, Brugge, Roeselare.'
    },
    keywords: 'jumta logu montāža Rīgā, Velux logi Latvijā, skylight installation Riga, dakraam installatie België'
  },
  'jumta-buvnieciba': {
    title: {
      lv: 'Jumta būvniecība Rīgā | Konstrukcija, izolācija, montāža | UpRoof',
      en: 'Roof Construction in Riga | Structure, Insulation, Installation | UpRoof',
      'nl-BE': 'Dakbouw in België | Structuur, Isolatie, Installatie | UpRoof'
    },
    description: {
      lv: 'Pilna cikla jumta būvniecība Rīgā no projektēšanas līdz gatavam jumtam: konstrukcija, izolācijas materiāli, segums, noteksistēmas. 10 gadu garantija. Apkalpojam Rīgu, Pierīgu, Jūrmalu, Jelgavu.',
      en: 'Full-cycle roof construction in Riga from design to finished roof: structure, insulation materials, covering, drainage systems. 10-year warranty. Serving Riga, Pieriga, Jurmala, Jelgava.',
      'nl-BE': 'Volledige dakbouw in België van ontwerp tot voltooid dak: structuur, isolatiematerialen, bedekking, afvoersystemen. 10 jaar garantie. Actief in Kortrijk, Gent, Brugge, Antwerpen, Brussel.'
    },
    keywords: 'jumta būvniecība Rīgā, jumtu būvniecība Latvijā, jauna jumta celtniecība Rīgā, roof construction Riga, dakbouw België'
  },
  'jumta-apkope-remonts': {
    title: {
      lv: 'Jumta apkope un remonts Rīgā | Tīrīšana, bojājumu novēršana | UpRoof',
      en: 'Roof Maintenance and Repair in Riga | Cleaning, Damage Prevention | UpRoof',
      'nl-BE': 'Dakonderhoud en reparatie in België | Reiniging, Schadevoorkoming | UpRoof'
    },
    description: {
      lv: 'Jumta apkope Rīgā: bojājumu diagnostika, remonts, noteku tīrīšana, sniega un lapu novākšana, skursteņu apdare. Regulāra apkope pagarina jumta mūžu. Serviss Rīgā, Jūrmalā, Pierīgā.',
      en: 'Roof maintenance in Riga: damage diagnostics, repair, gutter cleaning, snow and leaf removal, chimney finishing. Regular maintenance extends roof lifespan. Service in Riga, Jurmala, Pieriga.',
      'nl-BE': 'Dakonderhoud in België: schadediagnose, reparatie, gootreiniging, sneeuw- en bladverwijdering, schoorsteenafwerking. Regelmatig onderhoud verlengt daklevensduur. Service in Kortrijk, Gent, Brugge, Deinze, Waregem.'
    },
    keywords: 'jumta apkope Rīgā, jumta remonts Rīgā, jumta tīrīšana Latvijā, roof maintenance Riga, dakonderhoud België'
  },
  'noteksistemu-uzstadisana': {
    title: {
      lv: 'Noteksistēmu uzstādīšana jumtam Rīgā | Efektīva ūdens novadīšana | UpRoof',
      en: 'Gutter System Installation in Riga | Effective Water Drainage | UpRoof',
      'nl-BE': 'Gootsysteem installatie in België | Effectieve waterafvoer | UpRoof'
    },
    description: {
      lv: 'Kvalitatīva noteksistēmu montāža Rīgā un Latvijā: notekcaurules, renes, savienojumi, jumta drošība un ūdens novadīšana. Pareiza sistēma aizsargā konstrukciju. Pakalpojums Rīgā, Pierīgā, Jūrmalā.',
      en: 'Quality gutter system installation in Riga and Latvia: downspouts, gutters, connections, roof safety and water drainage. Proper system protects structure. Service in Riga, Pieriga, Jurmala.',
      'nl-BE': 'Kwaliteitsvolle gootsysteem installatie in België: regenpijpen, goten, verbindingen, dakveiligheid en waterafvoer. Correct systeem beschermt structuur. Service in Kortrijk, Gent, Brugge, Oudenaarde, Izegem.'
    },
    keywords: 'noteksistēmu uzstādīšana Rīgā, noteksistēmu montāža jumtam Latvijā, gutter installation Riga, gootsysteem installatie België'
  },
  'jumta-krasosana': {
    title: {
      lv: 'Jumta krāsošana Rīgā | Aizsardzība pret koroziju un laikapstākļiem | UpRoof',
      en: 'Roof Painting in Riga | Protection Against Corrosion and Weather | UpRoof',
      'nl-BE': 'Dakschilderen in België | Bescherming tegen corrosie en weer | UpRoof'
    },
    description: {
      lv: 'Profesionāla jumta krāsošana Rīgā un Latvijā: tīrīšana, rūsas apstrāde, grunts, vairākas krāsas kārtas. Atjauno izskatu un pagarina seguma kalpošanas laiku. Apkalpojam Rīgu, Jūrmalu, Pierīgu, Jelgavu.',
      en: 'Professional roof painting in Riga and Latvia: cleaning, rust treatment, primer, multiple paint coats. Restores appearance and extends covering lifespan. Serving Riga, Jurmala, Pieriga, Jelgava.',
      'nl-BE': 'Professioneel dakschilderen in België: reiniging, roestbehandeling, primer, meerdere verflagen. Herstelt uiterlijk en verlengt bedekking levensduur. Actief in Kortrijk, Gent, Brugge, Roeselare, Antwerpen.'
    },
    keywords: 'jumta krāsošana Rīgā, jumta krāsošana Latvijā, metāla jumta krāsošana Rīgā, roof painting Riga, dakschilderen België'
  }
};

// Service-specific content generator
function getServiceContent(slug: string, locale: string) {
  const content: Record<string, Record<string, {benefits: string[]; process: string[]}>> = {
    'jumta-renovacija': {
      lv: {
        benefits: ['Pilnīga jumta konstrukciju atjaunošana', 'Moderna siltināšanas materiālu izmantošana', 'Garantēta noplūžu novēršana', 'Jumta estētikas uzlabošana'],
        process: ['Jumta stāvokļa diagnostika', 'Veca seguma demontāža', 'Konstrukciju atjaunošana', 'Siltināšanas slāņa ierīkošana', 'Jauna seguma montāža']
      },
      en: {
        benefits: ['Complete roof structure renewal', 'Modern insulation materials usage', 'Guaranteed leak prevention', 'Roof aesthetics improvement'],
        process: ['Roof condition diagnostics', 'Old covering removal', 'Structure renewal', 'Insulation layer installation', 'New covering installation']
      },
      'nl-BE': {
        benefits: ['Volledige dakstructuur vernieuwing', 'Gebruik van moderne isolatiematerialen', 'Gegarandeerde lekpreventie', 'Verbetering dakesthetiek'],
        process: ['Daktoestand diagnose', 'Verwijdering oude bedekking', 'Structuurvernieuwing', 'Isolatielaag installatie', 'Nieuwe bedekking installatie']
      }
    },
    'valcprofila-montaza': {
      lv: {
        benefits: ['Hermētiski dubultlocījumi visos savienojumos', 'Īpaši izturīgs pret laikapstākļiem', '50 gadu ražotāja garantija materiāliem', 'Moderns un estētisks izskats'],
        process: ['Konstrukcijas sagatavošana', 'Zemseguma uzstādīšana ar ventilāciju', 'Valcprofila paneļu izgatavošana', 'Dubultlocījumu savienojumu montāža', 'Skārda apstrāde pie logiem un skursteņiem']
      },
      en: {
        benefits: ['Hermetic double-lock in all connections', 'Highly weather-resistant', '50-year manufacturer warranty on materials', 'Modern and aesthetic appearance'],
        process: ['Structure preparation', 'Underlayment installation with ventilation', 'Standing seam panel fabrication', 'Double-lock joint installation', 'Sheet metal work at windows and chimneys']
      },
      'nl-BE': {
        benefits: ['Hermetische dubbele sluiting in alle verbindingen', 'Zeer weerbestendig', '50 jaar fabrieksgarantie op materialen', 'Modern en esthetisch uiterlijk'],
        process: ['Structuurvoorbereiding', 'Onderlaag installatie met ventilatie', 'Staande naad paneel fabricage', 'Dubbele sluitvoeg installatie', 'Plaatwerk bij ramen en schoorstenen']
      }
    }
  };

  return content[slug]?.[locale] || content[slug]?.lv || {benefits: [], process: []};
}

// Service-specific FAQs
function getServiceFAQs(slug: string, locale: string) {
  const faqs: Record<string, Record<string, Array<{q: string; a: string}>>> = {
    'jumta-renovacija': {
      lv: [
        {q: 'Cik ilgs ir jumta renovācijas process?', a: 'Atkarībā no jumta stāvokļa – vidēji 3–10 darba dienas, iekļaujot demontāžu, konstrukciju atjaunošanu un seguma montāžu.'},
        {q: 'Vai nepieciešams mainīt jumta konstrukciju?', a: 'To nosaka jumta inspekcija. Ja konstrukcija ir bojāta vai neatbilst mūsdienu standartiem, tad atjaunošana ir obligāta drošības un ilgmūžības nodrošināšanai.'},
        {q: 'Kāda garantija tiek sniegta?', a: '10 gadu garantija uz darbu un papildus ražotāja garantija materiāliem (līdz 50 gadiem atkarībā no materiāla).'}
      ],
      en: [
        {q: 'How long does roof renovation take?', a: 'Depending on roof condition – average 3–10 business days, including demolition, structure renewal and covering installation.'},
        {q: 'Is it necessary to replace roof structure?', a: 'Determined by roof inspection. If structure is damaged or does not meet modern standards, renewal is mandatory for safety and durability.'},
        {q: 'What warranty is provided?', a: '10-year warranty on workmanship and additional manufacturer warranty on materials (up to 50 years depending on material).'}
      ],
      'nl-BE': [
        {q: 'Hoe lang duurt dakrenovatie?', a: 'Afhankelijk van daktoestand – gemiddeld 3–10 werkdagen, inclusief sloop, structuurvernieuwing en bedekking installatie.'},
        {q: 'Is het nodig om dakstructuur te vervangen?', a: 'Bepaald door dakinspectie. Als structuur beschadigd is of niet voldoet aan moderne normen, is vernieuwing verplicht voor veiligheid en duurzaamheid.'},
        {q: 'Welke garantie wordt geboden?', a: '10 jaar garantie op vakmanschap en aanvullende fabrieksgarantie op materialen (tot 50 jaar afhankelijk van materiaal).'}
      ]
    },
    'valcprofila-montaza': {
      lv: [
        {q: 'Kāpēc izvēlēties valcprofilu?', a: 'Valcprofils nodrošina maksimālu hermētiskumu pateicoties dubultlocījumiem, ilgmūžību (50+ gadi) un modernu izskatu bez redzamiem skrūvju caurumiem.'},
        {q: 'Vai var montēt valcprofilu ziemā?', a: 'Jā, valcprofila montāžu var veikt visu gadu, taču optimālie apstākļi ir temperatūrā virs -10°C ar minimālu nokrišņu risku.'},
        {q: 'Kāda ir valcprofila garantija?', a: '10 gadu garantija uz montāžas darbu un 50 gadu ražotāja garantija uz materiālu, iekļaujot krāsas noturību un metāla integritāti.'}
      ],
      en: [
        {q: 'Why choose standing seam?', a: 'Standing seam provides maximum hermeticity thanks to double-locks, longevity (50+ years) and modern appearance without visible screw holes.'},
        {q: 'Can standing seam be installed in winter?', a: 'Yes, standing seam can be installed year-round, but optimal conditions are temperatures above -10°C with minimal precipitation risk.'},
        {q: 'What is standing seam warranty?', a: '10-year warranty on installation work and 50-year manufacturer warranty on material, including paint durability and metal integrity.'}
      ],
      'nl-BE': [
        {q: 'Waarom kiezen voor staande naad?', a: 'Staande naad biedt maximale hermeticiteit dankzij dubbele sluitingen, duurzaamheid (50+ jaar) en modern uiterlijk zonder zichtbare schroefgaten.'},
        {q: 'Kan staande naad in winter geïnstalleerd worden?', a: 'Ja, staande naad kan het hele jaar door geïnstalleerd worden, maar optimale omstandigheden zijn temperaturen boven -10°C met minimaal neerslag risico.'},
        {q: 'Wat is de garantie op staande naad?', a: '10 jaar garantie op installatiewerk en 50 jaar fabrieksgarantie op materiaal, inclusief verfbaarheid en metaalintegriteit.'}
      ]
    }
  };

  return faqs[slug]?.[locale] || faqs[slug]?.lv || [
    {q: 'Vai ir garantija?', a: 'Jā, standarta garantija ir 10 gadi uz darbu un atsevišķi uz materiāliem.'},
    {q: 'Cik ilgs ir darba process?', a: 'Atkarībā no projekta apjoma – vidēji 3–10 darba dienas.'}
  ];
}

export function generateMetadata({params}: PageProps): Metadata {
  const {locale, slug} = params;
  const entry = META[slug];
  const canonical = `https://uproof.eu/${locale}/services/${slug}`;
  
  // Generate hreflang alternates for this service page across all locales
  const languages: Record<string, string> = {
    lv: `https://uproof.eu/lv/services/${slug}`,
    en: `https://uproof.eu/en/services/${slug}`,
    'nl-BE': `https://uproof.eu/nl-BE/services/${slug}`,
    'x-default': `https://uproof.eu/lv/services/${slug}`, // Default to Latvian
  };
  
  const title = entry?.title[locale] || entry?.title.lv || 'Jumta pakalpojums Rīgā | UpRoof';
  const description = entry?.description[locale] || entry?.description.lv || 'Profesionāli jumta pakalpojumi Rīgā, Pierīgā un visā Latvijā ar garantiju.';
  
  return {
    title,
    description,
    keywords: entry?.keywords || 'jumta pakalpojumi Rīgā, jumtu būvniecība Latvijā',
    alternates: { 
      canonical,
      languages,
    },
    openGraph: {
      url: canonical,
      title,
      description,
      locale: locale === 'lv' ? 'lv_LV' : locale === 'en' ? 'en_US' : 'nl_BE',
      type: 'website'
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image'
    }
  };
}

export default function ServiceLanding({params: {locale, slug}}: PageProps) {
  unstable_setRequestLocale(locale);
  const meta = META[slug];
  const title = meta?.title[locale] || meta?.title.lv || 'Jumta pakalpojums';
  const h1 = title.split('|')[0]?.trim() || 'Jumta pakalpojums';
  const description = meta?.description[locale] || meta?.description.lv;

  // Locale-specific city lists
  const cities = locale === 'nl-BE' 
    ? ['Kortrijk', 'Gent', 'Brugge', 'Roeselare', 'Deinze', 'Waregem', 'Oudenaarde', 'Izegem', 'Antwerpen', 'Brussel']
    : ['Rīga', 'Jūrmala', 'Jelgava', 'Ogre', 'Salaspils', 'Ķekava', 'Pierīgas rajons'];

  const cityHeading = locale === 'nl-BE' 
    ? '📍 Servicegebieden'
    : locale === 'en'
    ? '📍 Service Areas'
    : '📍 Apkalpojamās teritorijas';

  const cityIntro = locale === 'nl-BE'
    ? 'Wij bieden dakdiensten in heel België met een primaire focus op West-Vlaanderen en Oost-Vlaanderen:'
    : locale === 'en'
    ? 'We provide roofing services throughout Latvia with primary focus on Riga and Pieriga region:'
    : 'Mēs sniedzam jumta pakalpojumus visā Latvijā ar galveno fokusu uz Rīgu un Pierīgas reģionu:';

  const cityFooter = locale === 'nl-BE'
    ? 'Snelle reactie in West-Vlaanderen en Oost-Vlaanderen (1-2 werkdagen). Gratis offerte in alle servicegebieden.'
    : locale === 'en'
    ? 'Fast response in Riga and nearby cities (1-2 business days). Free assessment in all service areas.'
    : 'Ātra reakcija Rīgā un tuvākajās pilsētās (1-2 darba dienas). Bezmaksas novērtējums visās apkalpojamās teritorijās.';

  // Service-specific detailed content
  const serviceContent = getServiceContent(slug, locale);

  // FAQ pairs per service type
  const faqs = getServiceFAQs(slug, locale);

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `https://uproof.eu/${locale}/services/${slug}#service`,
    name: h1,
    serviceType: h1,
    url: `https://uproof.eu/${locale}/services/${slug}`,
    inLanguage: locale === 'lv' ? 'lv-LV' : locale === 'en' ? 'en-US' : 'nl-BE',
    // Locale-specific geographic areas served
    areaServed: locale === 'nl-BE' ? [
      { '@type': 'City', name: 'Kortrijk' },
      { '@type': 'City', name: 'Gent' },
      { '@type': 'City', name: 'Brugge' },
      { '@type': 'City', name: 'Roeselare' },
      { '@type': 'City', name: 'Deinze' },
      { '@type': 'City', name: 'Waregem' },
      { '@type': 'City', name: 'Oudenaarde' },
      { '@type': 'City', name: 'Izegem' },
      { '@type': 'City', name: 'Antwerpen' },
      { '@type': 'City', name: 'Brussel' },
      { '@type': 'Country', name: 'Belgium', '@id': 'https://www.wikidata.org/wiki/Q31' }
    ] : [
      { '@type': 'City', name: 'Rīga', '@id': 'https://www.wikidata.org/wiki/Q1773' },
      { '@type': 'City', name: 'Jūrmala' },
      { '@type': 'City', name: 'Jelgava' },
      { '@type': 'City', name: 'Ogre' },
      { '@type': 'City', name: 'Salaspils' },
      { '@type': 'City', name: 'Ķekava' },
      { '@type': 'AdministrativeArea', name: 'Pierīga' },
      { '@type': 'Country', name: 'Latvia', '@id': 'https://www.wikidata.org/wiki/Q211' }
    ],
    provider: {
      '@type': 'RoofingContractor',
      name: 'UpRoof',
      url: 'https://uproof.eu',
      telephone: '+371-25612440',
      address: {
        '@type': 'PostalAddress',
        addressLocality: locale === 'nl-BE' ? 'Kortrijk' : 'Rīga',
        addressCountry: locale === 'nl-BE' ? 'BE' : 'LV'
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
      areaServed: locale === 'nl-BE' 
        ? 'Kortrijk, Gent, Brugge, Roeselare, België'
        : 'Rīga, Pierīga, Jūrmala, Jelgava, Latvija'
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
              {cityHeading}
            </h2>
            <p className="text-gray-700 mb-3">
              {cityIntro}
            </p>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-700">
              {cities.map((city, idx) => (
                <li key={city} className="flex items-center">
                  {idx === 0 ? <><strong>✓ {city}</strong></> : `✓ ${city}`}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 mt-4">
              {cityFooter}
            </p>
          </div>

          {serviceContent.benefits.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                {locale === 'nl-BE' ? 'Voordelen' : locale === 'en' ? 'Benefits' : 'Priekšrocības'}
              </h2>
              <ul className="space-y-2">
                {serviceContent.benefits.map(benefit => (
                  <li key={benefit} className="flex items-start">
                    <span className="text-primary-600 mr-2">✓</span>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {serviceContent.process.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                {locale === 'nl-BE' ? 'Werkproces' : locale === 'en' ? 'Work Process' : 'Darba process'}
              </h2>
              <ol className="space-y-3">
                {serviceContent.process.map((step, idx) => (
                  <li key={step} className="flex items-start">
                    <span className="font-bold text-primary-600 mr-3">{idx + 1}.</span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="bg-primary-600/10 border-l-4 border-primary-600 p-6 rounded-md mb-8">
            <p className="font-semibold text-primary-800">
              {locale === 'nl-BE' 
                ? 'Gratis eerste consultatie en dakstaat evaluatie. Schrijf of bel: '
                : locale === 'en'
                ? 'Free initial consultation and roof condition assessment. Write or call: '
                : 'Bezmaksas sākotnējā konsultācija un jumta stāvokļa novērtējums Rīgā un Pierīgā. Rakstiet vai zvaniet: '}
              <a href="tel:+37125612440" className="underline">+371 25612440</a>
            </p>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">
            {locale === 'nl-BE' ? 'Veelgestelde vragen' : locale === 'en' ? 'Frequently Asked Questions' : 'Biežāk uzdotie jautājumi'}
          </h2>
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
      <InternalLinks locale={locale} currentSlug={slug} context="service" />
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(serviceSchema)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}} />
    </main>
  );
}
