import {unstable_setRequestLocale} from 'next-intl/server';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import InternalLinks from '@/components/InternalLinks';
import MiersMethod from '@/components/MiersMethod';

// Service slugs focused on Latvian queries
const SERVICE_SLUGS = [
  'jumta-renovacija',
  'valcprofila-montaza',
  'dakstinu-montaza',
  'jumta-logu-montaza',
  'jumta-buvnieciba',
  'jumta-apkope-remonts',
  'jumta-remonts',
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
      lv: 'Valcprofila montāža Rīgā | Stāvošā šuve – hermētisks metāla jumts | UpRoof',
      en: 'Standing Seam Metal Roofing in Riga | Hermetic Connections | UpRoof',
      'nl-BE': 'Staande naad metalen dakbedekking in België | Hermetische verbindingen | UpRoof'
    },
    description: {
      lv: 'Stāvošā šuve bez caurumošanas – hermētisks metāla jumts Rīgā un Latvijā. Valcprofila montāža ar dubultlocījumiem, sarežģīti mezgli pie skursteņiem/logiem. Skārdnieka darbi, 50 gadu garantija materiāliem. Apkalpojam Rīgu, Pierīgu, Jūrmalu.',
      en: 'Standing seam metal roofing installation in Riga and Latvia with fully hermetic double-lock solutions. Professional sheet metal work with precise connections to windows and chimneys. 10-year warranty. Serving Riga, Pieriga, Jurmala.',
      'nl-BE': 'Staande naad metalen dakbedekking installatie in België met volledig hermetische dubbele sluitoplossingen. Professioneel plaatwerk met precieze aansluitingen op ramen en schoorstenen. 10 jaar garantie. Actief in Kortrijk, Gent, Brugge.'
    },
    keywords: 'valcprofila montāža Rīgā, stāvošā šuve, valcprofils, metāla jumts Rīgā, skārda jumts, skārdnieka darbi, falcētais jumts, standing seam roofing Riga, staande naad dakbedekking België'
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
      lv: 'Jumta apkope un remonts Rīgā | Ātra palīdzība + Bezmaksas apskate | UpRoof',
      en: 'Roof Maintenance and Repair in Riga | Fast Response + Free Assessment | UpRoof',
      'nl-BE': 'Dakonderhoud en reparatie in België | Reiniging, Schadevoorkoming | UpRoof'
    },
    description: {
      lv: 'Jumts tek vai vajag apkopi? Ātra avārijas reaģēšana, noteku tīrīšana, jumta tīrīšana, bojājumu remonts Rīgā. Drona diagnostika, sniega/lāsteku noņemšana, skursteņa hermetizācija. Bezmaksas novērtējums Rīgā un Pierīgā.',
      en: 'Roof leak or need maintenance? Fast emergency response, gutter cleaning, roof washing, damage repair in Riga. Drone diagnostics, snow/moss removal, chimney sealing. Free assessment in Riga and Pieriga.',
      'nl-BE': 'Dakonderhoud in België: schadediagnose, reparatie, gootreiniging, sneeuw- en bladverwijdering, schoorsteenafwerking. Regelmatig onderhoud verlengt daklevensduur. Service in Kortrijk, Gent, Brugge, Deinze, Waregem.'
    },
    keywords: 'jumta apkope Rīgā, jumta remonts Rīgā, jumts tek, jumta noplūde, noteku tīrīšana Rīgā, jumta tīrīšana, jumta mazgāšana, avārijas remonts, lāsteku noņemšana, sniega tīrīšana jumtiem, skursteņa apdare, roof maintenance Riga, dakonderhoud België'
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
  'jumta-remonts': {
    title: {
      lv: 'Jumta remonts Rīgā | Ātra avārijas reaģēšana 24/7, garantija | UpRoof',
      en: 'Emergency Roof Repair in Riga | Fast 24/7 Response | UpRoof',
      'nl-BE': 'Noodreparatie dak België | Snelle 24/7 reactie | UpRoof'
    },
    description: {
      lv: 'Jumts tek vai noplūst? UpRoof – ātra 24/7 avārijas reaģēšana, diagnostika, lokāls remonts Rīgā un Pierīgā. Sertificēti meistari, 2 gadu garantija. Bezmaksas novērtējums. +371 25612440',
      en: 'Roof leak emergency? Fast 24/7 response, diagnostics, local repair in Riga and Pieriga. Certified specialists, 2-year warranty. Free assessment. Call +371 25612440',
      'nl-BE': 'Daklek noodgeval? Snelle 24/7 reactie, diagnose, lokale reparatie in België. Gecertificeerde vakmensen, 2 jaar garantie. Gratis beoordeling.'
    },
    keywords: 'jumta remonts Rīgā, jumts tek, jumta noplūde avārija, av\u0101rijas rea\u0123\u0113\u0161ana, jumta remonts Pier\u012bg\u0101, emergency roof repair Riga, dak reparatie noodgeval Belgi\u00eb'
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

// Service-specific content generator (Enhanced with overview, service areas, quality guarantee sections)
function getServiceContent(slug: string, locale: string) {
  const content: Record<string, Record<string, {
    overview: string;
    benefits: string[]; 
    process: string[];
    qualityPoints: string[];
    relatedServices: string[];
  }>> = {
    'jumta-renovacija': {
      lv: {
        overview: 'Pilna cikla jumta renovācija ir kapitālais remonts, kas atjauno jumta konstrukciju, izolāciju, siltināšanu un segumu. Mēs nodrošinām, ka jūsu jumts kļūst kā jauns, ar moderniem izolācijas materiāliem un ilgmūžīgiem seguma risinājumiem.',
        benefits: ['Pilnīga jumta konstrukciju atjaunošana', 'Moderna siltināšanas materiālu izmantošana', 'Garantēta noplūžu novēršana', 'Jumta estētikas uzlabošana', 'Enerģijas taupīšana ar labāku izolāciju'],
        process: ['Jumta stāvokļa diagnostika ar UAV', 'Veca seguma demontāža', 'Konstrukciju stiprības pārbaude un atjaunošana', 'Siltināšanas slāņa ierīkošana', 'Jauna seguma montāža ar hermētiskajiem savienojumiem', 'Noteku sistēmas uzstādīšana'],
        qualityPoints: ['10 gadu garantija uz montāžas darbu', 'Sertificēti speciālisti ar 15+ gadu pieredzi', 'ISO 9001 sertificēta kvalitātes vadības sistēma', 'Drošības protokoli atbilst LBN normatīviem'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'noteksistemu-uzstadisana', 'jumta-krasosana']
      },
      en: {
        overview: 'Full-cycle roof renovation is a major overhaul that restores roof structure, insulation, waterproofing and covering. We ensure your roof becomes like new with modern insulation materials and durable roofing solutions.',
        benefits: ['Complete roof structure renewal', 'Modern insulation materials usage', 'Guaranteed leak prevention', 'Roof aesthetics improvement', 'Energy savings with better insulation'],
        process: ['Roof condition diagnostics with UAV', 'Old covering removal', 'Structure strength verification and renewal', 'Insulation layer installation', 'New covering installation with hermetic connections', 'Gutter system installation'],
        qualityPoints: ['10-year warranty on workmanship', 'Certified specialists with 15+ years experience', 'ISO 9001 certified quality management system', 'Safety protocols comply with building regulations'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'noteksistemu-uzstadisana', 'jumta-krasosana']
      },
      'nl-BE': {
        overview: 'Volledige dakrenovatie is een grote opknapbeurt die dakstructuur, isolatie, waterdichting en bedekking herstelt. Wij zorgen dat uw dak als nieuw wordt met moderne isolatiematerialen en duurzame dakbedekkingsoplossingen.',
        benefits: ['Volledige dakstructuur vernieuwing', 'Gebruik van moderne isolatiematerialen', 'Gegarandeerde lekpreventie', 'Verbetering dakesthetiek', 'Energiebesparing met betere isolatie'],
        process: ['Daktoestand diagnose met UAV', 'Verwijdering oude bedekking', 'Structuursterkte verificatie en vernieuwing', 'Isolatielaag installatie', 'Nieuwe bedekking installatie met hermetische verbindingen', 'Gootsysteem installatie'],
        qualityPoints: ['10 jaar garantie op vakmanschap', 'Gecertificeerde specialisten met 15+ jaar ervaring', 'ISO 9001 gecertificeerd kwaliteitsmanagementsysteem', 'Veiligheidsprotocollen voldoen aan bouwvoorschriften'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'noteksistemu-uzstadisana', 'jumta-krasosana']
      }
    },
    'valcprofila-montaza': {
      lv: {
        overview: 'Stāvošā šuve (valcprofils) ir moderns metāla jumta risinājums bez caurumošanas ar skrūvēm, kas nodrošina maksimālu hermētiskumu ar dubultlocījumiem, ilgmūžību un elegantu izskatu. Piemērots jauniem projektiem un renovācijas gadījumiem. Ideāls minimālam slīpumam no 5°.',
        benefits: ['Hermētiski dubultlocījumi visos savienojumos bez skrūvēm', 'Īpaši izturīgs pret laikapstākļiem', '50 gadu ražotāja garantija materiāliem', 'Moderns un estētisks izskats bez redzamiem skrūvju caurumiem', 'Mehāniskais valcējums uz vietas ar profesionālu iekārtu'],
        process: ['Konstrukcijas sagatavošana un niveļošana', 'Difūzijas membrānas/zemseguma uzstādīšana ar ventilāciju', 'Valcprofila paneļu izgatavošana uz vietas', 'Dubultlocījumu savienojumu montāža ar speciāliem rīkiem', 'Precīza skārda apstrāde pie logiem, skursteņiem un sarežģītām tehēm', 'Hermētiskuma pārbaude ar ūdens testu'],
        qualityPoints: ['10 gadu garantija uz darbu', '50 gadu ražotāja garantija uz PVDF/PE krāsu un metāla integritāti', 'Sertificēti instalatori no ražotāja', 'Hermētiskuma pārbaude ar ūdens testa metodiku', 'Profesionāla valcējuma iekārta (nevis uz koka dēlīša)'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'noteksistemu-uzstadisana', 'jumta-logu-montaza']
      },
      en: {
        overview: 'Standing seam metal roofing is a modern roofing solution providing maximum hermeticity with double-locks, longevity and elegant appearance. Suitable for new projects and renovation cases.',
        benefits: ['Hermetic double-lock connections throughout', 'Highly weather-resistant', '50-year manufacturer warranty on materials', 'Modern and aesthetic appearance without visible fasteners'],
        process: ['Structure preparation and leveling', 'Underlayment installation with ventilation', 'Standing seam panel fabrication on-site', 'Double-lock connection installation with specialized tools', 'Precise sheet metal work at windows and chimneys', 'Hermeticity verification'],
        qualityPoints: ['10-year warranty on workmanship', '50-year manufacturer warranty on PVDF/PE colors', 'Certified installers from manufacturer', 'Hermeticity verification with water test methodology'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'noteksistemu-uzstadisana', 'jumta-logu-montaza']
      },
      'nl-BE': {
        overview: 'Staande naad metalen dakbedekking is een moderne dakbedekking die maximale hermeticiteit met dubbele sluitingen, duurzaamheid en elegant uiterlijk biedt. Geschikt voor nieuwe projecten en renovaties.',
        benefits: ['Hermetische dubbele sluitingen overal', 'Zeer weerbestendig', '50 jaar fabrieksgarantie op materialen', 'Modern en esthetisch uiterlijk zonder zichtbare bevestigingen'],
        process: ['Structuurvoorbereiding en nivellering', 'Onderlaag installatie met ventilatie', 'Staande naad paneel fabricage ter plaatse', 'Dubbele sluitvoeg installatie met gespecialiseerde gereedschappen', 'Nauwkeurig plaatwerk bij ramen en schoorstenen', 'Hermeticiteit verificatie'],
        qualityPoints: ['10 jaar garantie op vakmanschap', '50 jaar fabrieksgarantie op PVDF/PE kleuren', 'Gecertificeerde installateurs van fabrikant', 'Hermeticiteit verificatie met watertestmethodologie'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'noteksistemu-uzstadisana', 'jumta-logu-montaza']
      }
    },
    'dakstinu-montaza': {
      lv: {
        overview: 'Māla vai betona dakstiņu montāža nodrošina ilgmūžīgu, estētisku jumta risinājumu ar izcilu siltuma un skaņas izolāciju. Dakstiņi kalpo vairāk nekā 50 gadus un piešķir mājai prestižu izskatu.',
        benefits: ['Ilgmūžība līdz pat 100 gadiem', 'Lieliska skaņas un siltuma izolācija', 'Ugunsdrošs un ekoloģisks materiāls', 'Prestižs un klasisks izskats', 'Mājīgs un videi draudzīgs risinājums'],
        process: ['Jumta konstrukcijas pastiprināšana un aprēķins', 'Elpojošās membrānas ieklāšana', 'Latojuma un kontrlatojuma montāža', 'Dakstiņu precīza ieklāšana un stiprināšana', 'Kores un malu elementu montāža', 'Noteku pieslēgumi'],
        qualityPoints: ['10 gadu garantija uz montāžas darbu', 'Dakstiņu garantija līdz 50 gadiem', 'Ugunsdrošības klase A1', 'Speciālistiem ir sertifikāti dakstiņu montāžai'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'valcprofila-montaza', 'jumta-renovacija']
      },
      en: {
        overview: 'Clay or concrete tile installation provides a durable, aesthetic roofing solution with excellent heat and sound insulation. Tiles last more than 50 years and give your home a prestigious appearance.',
        benefits: ['Longevity up to 100 years', 'Excellent heat and sound insulation', 'Fireproof and ecological material', 'Prestigious and classic appearance', 'Family home and environmentally friendly solution'],
        process: ['Roof structure reinforcement and calculation', 'Breathable membrane installation', 'Batten and counter-batten installation', 'Precise tile laying and fastening', 'Ridge and edge element installation', 'Gutter connections'],
        qualityPoints: ['10-year warranty on workmanship', 'Tile manufacturer warranty up to 50 years', 'Fire safety class A1', 'Specialists are certified for tile installation'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'valcprofila-montaza', 'jumta-renovacija']
      },
      'nl-BE': {
        overview: 'Klei of betonnen pannendak installatie biedt een duurzame, esthetische dakoplossing met uitstekende warmte en geluidsisolatie. Pannen gaan meer dan 50 jaar mee en geven uw huis een prestigieuze uitstraling.',
        benefits: ['Levensduur tot 100 jaar', 'Uitstekende warmte en geluidsisolatie', 'Vuurvast en ecologisch materiaal', 'Prestigieuze en klassieke uitstraling', 'Gezinshuis en milieuvriendelijke oplossing'],
        process: ['Dakstructuurversterking en berekening', 'Ademende membraan installatie', 'Panlatten en tengellatten installatie', 'Nauwkeurig leggen en bevestigen van pannen', 'Nok- en randelementen installatie', 'Gootverbindingen'],
        qualityPoints: ['10 jaar garantie op vakmanschap', 'Pannenfabrikant garantie tot 50 jaar', 'Vuurveiligheidsklas A1', 'Specialisten zijn gecertificeerd voor pannendak installatie'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'valcprofila-montaza', 'jumta-renovacija']
      }
    },
    'jumta-logu-montaza': {
      lv: {
        overview: 'Jumta logu (daklogu) montāža pievieno papildus gaismu un vēdināšanu jumta stāvam bez jumta funkcionālitātes zaudēšanas. Mēs montējam Roto un Velux augstākās kvalitātes logus ar profesionālu hidroizolāciju.',
        benefits: ['Dabiskā apgaismojuma palielināšana jumta stāvā', 'Telpu vēdināšanas uzlabošana ar automātisko vadību', 'Energoefektīvi stikla pakešu risinājumi', 'Profesionāla hidroizolācija un siltināšana', 'Drošas un vieglas vadības sistēmas'],
        process: ['Loga vietas izzāģēšana un sagatavošana', 'Loga rāmja montāža, līmeņošana un pārbaude', 'Hidroizolācijas un siltinājuma pieslēgums', 'Ārējo pieslēgumu un seguma atjaunošana', 'Iekšējās apdares sagatavošana', 'Funkcionalitātes testēšana'],
        qualityPoints: ['10 gadu garantija uz montāžas darbu', 'Roto/Velux garantija uz logiem (5-10 gadi)', 'Hermētiskuma pārbaude pēc montāžas', 'Sertificēti instalatori no ražotāja'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'valcprofila-montaza', 'jumta-renovacija']
      },
      en: {
        overview: 'Skylight (roof window) installation adds extra light and ventilation to attic spaces without compromising roof functionality. We install Roto and Velux high-quality windows with professional waterproofing.',
        benefits: ['Increased natural lighting in attic spaces', 'Improved room ventilation with automated control', 'Energy-efficient glazing solutions', 'Professional waterproofing and insulation', 'Safe and easy-to-use control systems'],
        process: ['Roof opening cutting and preparation', 'Window frame installation, leveling and verification', 'Waterproofing and insulation connection', 'External flashing and covering restoration', 'Internal finish preparation', 'Functionality testing'],
        qualityPoints: ['10-year warranty on workmanship', 'Roto/Velux warranty on windows (5-10 years)', 'Hermeticity verification after installation', 'Certified installers from manufacturer'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'valcprofila-montaza', 'jumta-renovacija']
      },
      'nl-BE': {
        overview: 'Dakraam installatie voegt extra licht en ventilatie toe aan zolderruimtes zonder de dakfunctionaliteit in het gedrang te brengen. We installeren Roto en Velux hoogwaardige ramen met professionele waterdichting.',
        benefits: ['Verhoogde natuurlijke verlichting in zolderruimtes', 'Verbeterde kamerventilatie met geautomatiseerde controle', 'Energie-efficiënte beglazingsoplossingen', 'Professionele waterdichting en isolatie', 'Veilige en gebruiksvriendelijke bedieningssystemen'],
        process: ['Dakraamopening zagen en voorbereiden', 'Raamkader installatie, nivellering en verificatie', 'Waterdichting en isolatie aansluiting', 'Externe gootstukken en bedekking herstel', 'Interne afwerking voorbereiding', 'Functionaliteitstest'],
        qualityPoints: ['10 jaar garantie op vakmanschap', 'Roto/Velux garantie op ramen (5-10 jaar)', 'Hermeticiteit verificatie na installatie', 'Gecertificeerde installateurs van fabrikant'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'valcprofila-montaza', 'jumta-renovacija']
      }
    },
    'jumta-buvnieciba': {
      lv: {
        overview: 'Jumta būvniecība ir komplekss process no projektēšanas līdz gatavajam jumtam, kurā ietilpst konstrukcija, izolācija, siltināšana, segums un noteku sistēmas. Mēs piedāvājam pilna cikla risinājumus ar individuālu projektēšanu.',
        benefits: ['Pilna cikla būvniecība no A līdz Z', 'Sertificēti būvspeciālisti un projektanti', 'Atbilstība visiem Latvijas būvnormatīviem', 'Individuāla projektēšana un tāme', 'Modernie siltinājuma risinājumi ar energoietilpību'],
        process: ['Objekta apsekošana, mērīšana un tāmēšana', 'Projektēšana un būvniecības atļauju ieguves palīdzība', 'Materiālu piegāde un logistika', 'Spāru sistēmas izbūve un nostabilizēšana', 'Siltināšana, plēvju montāža un ventilācija', 'Jumta seguma un noteku uzstādīšana', 'Ūdens hermētiskuma un kvalitātes pārbaude'],
        qualityPoints: ['10 gadu garantija uz visu darbu', 'ISO 9001 sertificēta kvalitātes vadība', 'Būvniecības dokumentācijas sagatavošana', 'Speciālistu sertifikāti un licences'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-logu-montaza', 'noteksistemu-uzstadisana', 'jumta-krasosana']
      },
      en: {
        overview: 'Roof construction is a complex process from design to finished roof, including structure, insulation, waterproofing, covering and drainage systems. We offer full-cycle solutions with individual design.',
        benefits: ['Full-cycle construction from A to Z', 'Certified construction specialists and designers', 'Compliance with all building codes and regulations', 'Individual project design and estimation', 'Modern insulation solutions with energy efficiency'],
        process: ['Site inspection, measurement and estimation', 'Design and assistance with building permits', 'Material supply and logistics', 'Rafter system construction and stabilization', 'Insulation, membrane installation and ventilation', 'Roofing and gutter installation', 'Waterproofing and quality verification'],
        qualityPoints: ['10-year warranty on all work', 'ISO 9001 certified quality management', 'Preparation of building documentation', 'Specialists\' certificates and licenses'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-logu-montaza', 'noteksistemu-uzstadisana', 'jumta-krasosana']
      },
      'nl-BE': {
        overview: 'Dakbouw is een complex proces van ontwerp tot voltooid dak, inclusief structuur, isolatie, waterdichting, bedekking en afvoersystemen. We bieden volledige cyclusoplossingen met individueel ontwerp.',
        benefits: ['Volledige cyclus bouw van A tot Z', 'Gecertificeerde bouwspecialisten en ontwerpers', 'Naleving van alle bouwcodes en voorschriften', 'Individueel projectontwerp en schatting', 'Moderne isolatieoplossingen met energie-efficiëntie'],
        process: ['Locatie inspectie, meting en schatting', 'Ontwerp en hulp bij bouwvergunningen', 'Materiaallevering en logistiek', 'Dakspant systeemconstructie en stabilisering', 'Isolatie, membraan installatie en ventilatie', 'Dakafdekking en goot installatie', 'Waterdichting en kwaliteit verificatie'],
        qualityPoints: ['10 jaar garantie op al het werk', 'ISO 9001 gecertificeerd kwaliteitsbeheer', 'Voorbereiding van bouwdocumentatie', 'Sertifikaten en licenties van specialisten'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-logu-montaza', 'noteksistemu-uzstadisana', 'jumta-krasosana']
      }
    },
    'jumta-apkope-remonts': {
      lv: {
        overview: 'Regulāra jumta apkope un savlaicīgs remonts pagarina jumta mūžu par 10-20 gadiem un novērš dārgus bojājumus. Mēs nodrošinām diagnostiku, tīrīšanu, bojājumu novēršanu un avārijas reaģēšanu.',
        benefits: ['Jumta kalpošanas laika pagarināšana par 10-20 gadiem', 'Noplūžu riska priekšlaicīga novēršana', 'Vizuālā izskata uzlabošana un sūnu noņemšana', 'Ātra avārijas reaģēšana (1-2 stundas)', 'Preventīvā diagnostika ar UAV'],
        process: ['Vizuālā un tehniskā jumta apsekošana', 'Noteku un satekņu tīrīšana ar augstspiedienu', 'Bojāto vietu lokāls remonts vai atjaunošana', 'Sūnu un melno traipu noņemšana bez ķīmijas', 'Skursteņu un noteku pieslēgumu hermētiskuma pārbaude', 'Aizsargpārklājumu atjaunošana'],
        qualityPoints: ['2 gadu garantija uz remontdarbu', '24/7 avārijas reaģēšanas serviss', 'Speciālistiem ir darba drošības apdrošināšana', 'UAV diagnostika ar vizuālajiem pierakstiem'],
        relatedServices: ['jumta-buvnieciba', 'jumta-krasosana', 'noteksistemu-uzstadisana', 'valcprofila-montaza']
      },
      en: {
        overview: 'Regular roof maintenance and timely repair extends roof lifespan by 10-20 years and prevents costly damage. We provide diagnostics, cleaning, repair and emergency response.',
        benefits: ['Extending roof life by 10-20 years', 'Early prevention of leak risks', 'Visual appearance improvement and moss removal', 'Fast emergency response (1-2 hours)', 'Preventive diagnostics with UAV'],
        process: ['Visual and technical roof inspection', 'Gutter and valley cleaning with high-pressure', 'Local repair or renewal of damaged areas', 'Moss and black stain removal without chemicals', 'Chimney and gutter connection hermeticity check', 'Protective coating renewal'],
        qualityPoints: ['2-year warranty on repair work', '24/7 emergency response service', 'Specialists have insurance for dangerous work', 'UAV diagnostics with visual records'],
        relatedServices: ['jumta-buvnieciba', 'jumta-krasosana', 'noteksistemu-uzstadisana', 'valcprofila-montaza']
      },
      'nl-BE': {
        overview: 'Regelmatig dakonderhoud en tijdige reparatie verlengt daklevensduur met 10-20 jaar en voorkomt kostbare schade. Wij bieden diagnose, reiniging, reparatie en noodrespons.',
        benefits: ['Verlenging dakleven met 10-20 jaar', 'Vroege lekkagrisicopreventie', 'Visuele uitstraling verbetering en mosverwijdering', 'Snelle noodrespons (1-2 uur)', 'Preventieve diagnostiek met UAV'],
        process: ['Visuele en technische dakinspectie', 'Goot en kilgootiereiniging met hogedruk', 'Lokale reparatie of vernieuwing beschadigde gebieden', 'Mos- en zwarte vlekkenverwijdering zonder chemicaliën', 'Schoorsteen- en gootverbinding hermeticiteit controle', 'Beschermende coating vernieuwing'],
        qualityPoints: ['2 jaar garantie op reparatiewerk', '24/7 noodrespons service', 'Specialisten hebben verzekering voor gevaarlijk werk', 'UAV diagnostiek met visuele records'],
        relatedServices: ['jumta-buvnieciba', 'jumta-krasosana', 'noteksistemu-uzstadisana', 'valcprofila-montaza']
      }
    },
    'noteksistemu-uzstadisana': {
      lv: {
        overview: 'Noteksistēmas (ūdens noteku sistēmas) nodrošina efektīvu ūdens novadīšanu no jumta un fasādes, aizsargājot fasādes, bāzi un apkārtni. Mēs montējam kvalitātīvas metāla notekas ar garantiju pret rūsēšanu.',
        benefits: ['Efektīva ūdens novadīšana no fasādes un bāzes', 'Plaša krāsu un materiālu izvēle', 'Izturība pret sniega un ledu slodzi', 'Garantija pret rūsēšanu un lūšanu vēl 25 gadus', 'Skaņas adsorbcija ar speciālu izolāciju'],
        process: ['Jumta karnīzes mērīšana un CAD plāna izstrāde', 'Noteku turētāju montāža ar pareizu kritumu', 'Metālisko renu ieklāšana un savienošana', 'Ūdens piltuvju un savienojumu montāža', 'Notekcauruļu un līkumu uzstādīšana', 'Ūdens novadīšanas pārbaude ar ūdens testa metodi'],
        qualityPoints: ['10 gadu garantija uz montāžas darbu', '25 gadu antikorozijas garantija uz materiālu', 'Speciālistiem ir sertifikāti noteku montāžai', 'CAD dizains katram objektam'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'jumta-renovacija', 'valcprofila-montaza']
      },
      en: {
        overview: 'Gutter systems ensure effective water drainage from roof and facade, protecting the facade, foundation and surroundings. We install quality metal gutters with guarantee against rust.',
        benefits: ['Effective water drainage from facade and foundation', 'Wide choice of colors and materials', 'Resistance to snow and ice load', 'Guarantee against rust and cracking for 25 years', 'Sound absorption with special insulation'],
        process: ['Roof eaves measurement and CAD plan development', 'Gutter bracket installation with correct slope', 'Metal gutter laying and connection', 'Water outlet and connector installation', 'Downspout and elbow installation', 'Water drainage verification with water test method'],
        qualityPoints: ['10-year warranty on installation work', '25-year anti-corrosion warranty on materials', 'Specialists are certified for gutter installation', 'CAD design for each project'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'jumta-renovacija', 'valcprofila-montaza']
      },
      'nl-BE': {
        overview: 'Gootsystemen zorgen voor effectieve waterafvoer van dak en gevel en beschermen de gevel, fundering en omgeving. We installeren kwaliteitsmetalen goten met garantie tegen roesten.',
        benefits: ['Effectieve waterafvoer van gevel en fundering', 'Ruime keuze aan kleuren en materialen', 'Weerstand tegen sneeuw- en ijsbelasting', 'Garantie tegen roesten en splintering voor 25 jaar', 'Geluidabsorptie met speciale isolatie'],
        process: ['Dakrandmeting en CAD planontwikkeling', 'Gootbeugel installatie met juiste helling', 'Metalen goot leggen en verbinding', 'Wateruitloop en connector installatie', 'Regenpijp en bocht installatie', 'Waterafvoer verificatie met watertestmethode'],
        qualityPoints: ['10 jaar garantie op installatie', '25 jaar anti-corrosie garantie op materialen', 'Specialisten zijn gecertificeerd voor gootinstallatie', 'CAD ontwerp voor elk project'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'jumta-renovacija', 'valcprofila-montaza']
      }
    },
    'jumta-remonts': {
      lv: {
        overview: 'Ātra jumta avārijas reaģēšana 24/7 Rīgā un Pierīgā. Jumts tek vai noplūst? Mēs novērsam noplūdes, veicam lokālus remontus un diagnozes. Sertificēti meistari, 2 gadu garantija uz remontdarbu.',
        benefits: ['Ātra 24/7 avārijas reaģēšana (1-2 stundas)', 'Diagnoze ar UAV dronu un vizuālo ziņojumu', 'Lokāls remonts bez pilnīgas demontāžas', 'Garantija uz remontdarbu un materiāliem', 'Bezmaksas novērtējums Rīgā un Pierīgā'],
        process: ['Tūlīta jautājumi un pieņemšana', 'Lokācijas apskate un noplūdes diagnostika', 'Novārtējuma sagatavošana un tāmes sniegšana', 'Operatīvs remonts vai noplūdes likvidēšana', 'Hermētiskuma pārbaude ar ūdens testu', 'Dokumentācija un garantijas nodrošināšana'],
        qualityPoints: ['24/7 avārijas reaģēšana pieņemšana', '2 gadu garantija uz remontdarbu', 'Speciālistiem ir darba drošības apdrošināšana', 'UAV diagnostika ar ziņojumiem'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-krasosana', 'valcprofila-montaza', 'jumta-renovacija']
      },
      en: {
        overview: 'Fast emergency roof repair 24/7 in Riga and Pieriga. Roof leaking? We stop leaks, perform local repairs and diagnostics. Certified specialists, 2-year warranty on repair work.',
        benefits: ['Fast 24/7 emergency response (1-2 hours)', 'Drone diagnostics with visual report', 'Local repair without full demolition', 'Warranty on repair work and materials', 'Free assessment in Riga and Pieriga'],
        process: ['Immediate inquiry and site visit scheduling', 'On-site inspection and leak diagnostics', 'Estimate preparation and quote submission', 'Prompt repair or leak elimination', 'Hermeticity verification with water test', 'Documentation and warranty provision'],
        qualityPoints: ['24/7 emergency response availability', '2-year warranty on repair work', 'Specialists have work safety insurance', 'UAV diagnostics with visual reports'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-krasosana', 'valcprofila-montaza', 'jumta-renovacija']
      },
      'nl-BE': {
        overview: 'Snelle daklek noodreparatie 24/7 in België. Dak lekt? Wij stoppen lekken, voeren lokale reparaties en diagnose uit. Gecertificeerde vakmensen, 2 jaar garantie op reparatiewerk.',
        benefits: ['Snelle 24/7 noodrespons (1-2 uur)', 'Drone diagnose met visueel rapport', 'Lokale reparatie zonder volledige sloop', 'Garantie op reparatiewerk en materialen', 'Gratis beoordeling in heel België'],
        process: ['Onmiddellijke informatie en bezoekplanning', 'Ter plaatse inspectie en lekdiagnose', 'Estimaatvoorbereiding en offerteindeling', 'Snelle reparatie of lekbestrijding', 'Hermmeticiteit verificatie met watertest', 'Documentatie en garantieregeling'],
        qualityPoints: ['24/7 noodreparatie beschikbaarheid', '2 jaar garantie op reparatiewerk', 'Specialisten hebben werkverzekerking', 'Drone diagnose met visuele rapporten'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-krasosana', 'valcprofila-montaza', 'jumta-renovacija']
      }
    },
    'jumta-krasosana': {
      lv: {
        overview: 'Jumta krāsošana ir ekonomiska alternatīva jumta nomaiņai, kas pagarina jumta mūžu par 10-15 gadiem, uzlabo izskatu un aizsargā pret koroziju. Mēs krāsojam metāla jumtus, šīferi un betona paneļus.',
        benefits: ['Jumta mūža pagarināšana par 10-15 gadiem', 'Ekonomiska alternatīva nomaiņai (3-4 reizes lētāk)', 'Aizsardzība pret koroziju un sūnām', 'Jebkura pantone toņa izvēle', 'Jumta izskata uzlabošana un moderns izskats'],
        process: ['Augstspiediena mazgāšana (500+ bar)', 'Rūsas apstrāde ar ķīmiskiem pārveidotājiem', 'Pirmo un otro gruntes kārtu uzklāšana', 'Pirmās un otrās krāsas kārtas uzklāšana', 'Detaļu noslīpēšana un stūru apdare', 'Kvalitātes kontrole un skrāpju vietas apstrāde'],
        qualityPoints: ['3 gadu garantija uz krāsu', '10 gadu garantija uz pretkorozijas apstrādi', 'Profesionāli instrumenti un ekvivalentas krāsas', 'Rūsas pārveidotājs garantija'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-buvnieciba', 'jumta-renovacija', 'noteksistemu-uzstadisana']
      },
      en: {
        overview: 'Roof painting is an economical alternative to roof replacement, extending roof life by 10-15 years, improving appearance and protecting against corrosion. We paint metal roofs, slate and concrete panels.',
        benefits: ['Extending roof life by 10-15 years', 'Economical alternative to replacement (3-4 times cheaper)', 'Protection against corrosion and moss', 'Choice of any Pantone color', 'Improved appearance and modern look'],
        process: ['High-pressure washing (500+ bar)', 'Rust treatment with chemical converters', 'First and second primer coat application', 'First and second paint coat application', 'Detail sanding and corner finishing', 'Quality control and scratch area treatment'],
        qualityPoints: ['3-year warranty on paint', '10-year warranty on anti-corrosion treatment', 'Professional tools and equivalent paints', 'Rust converter warranty'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-buvnieciba', 'jumta-renovacija', 'noteksistemu-uzstadisana']
      },
      'nl-BE': {
        overview: 'Dakschilderen is een economisch alternatief voor dakvervanging dat de daklevensduur met 10-15 jaar verlengt, het uiterlijk verbetert en bescherming biedt tegen corrosie. We schilderen metalen daken, leisteen en betonnen panelen.',
        benefits: ['Verlenging dakleven met 10-15 jaar', 'Economisch alternatief voor vervanging (3-4 keer goedkoper)', 'Bescherming tegen corrosie en mos', 'Keuze uit elke Pantone kleur', 'Verbeterde uitstraling en modern uiterlijk'],
        process: ['Hogedrukreiniging (500+ bar)', 'Roestbehandeling met chemische omzetters', 'Eerste en tweede grondlaag aanbrenging', 'Eerste en tweede verflaag aanbrenging', 'Detailslijping en hoekafwerking', 'Kwaliteitscontrole en krasplek behandeling'],
        qualityPoints: ['3 jaar garantie op verf', '10 jaar garantie op anti-corrosie behandeling', 'Professionele gereedschappen en gelijkwaardige verven', 'Roest omzetter garantie'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-buvnieciba', 'jumta-renovacija', 'noteksistemu-uzstadisana']
      }
    }
  };

  return content[slug]?.[locale] || content[slug]?.lv || {overview: '', benefits: [], process: [], qualityPoints: [], relatedServices: []};
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
    },
    'dakstinu-montaza': {
      lv: [
        {q: 'Vai mans jumts izturēs dakstiņu svaru?', a: 'Mēs vienmēr veicam konstrukcijas nestspējas aprēķinu. Ja nepieciešams, veicam spāru pastiprināšanu pirms montāžas.'},
        {q: 'Kāda ir atšķirība starp māla un betona dakstiņiem?', a: 'Māla dakstiņi ir dabīgāki un ilgmūžīgāki (līdz 100 gadiem), bet betona dakstiņi ir ekonomiskāki un precīzāki izmēros.'},
        {q: 'Cik ilgi kalpo dakstiņu jumts?', a: 'Pareizi uzklāts dakstiņu jumts kalpo 50-100 gadus, padarot to par vienu no izdevīgākajiem ieguldījumiem ilgtermiņā.'}
      ],
      en: [
        {q: 'Will my roof support tile weight?', a: 'We always calculate structural load capacity. If necessary, we reinforce rafters before installation.'},
        {q: 'Difference between clay and concrete tiles?', a: 'Clay tiles are more natural and longer-lasting (up to 100 years), while concrete tiles are more economical and precise in dimensions.'},
        {q: 'How long does a tile roof last?', a: 'A properly installed tile roof lasts 50-100 years, making it one of the best long-term investments.'}
      ],
      'nl-BE': [
        {q: 'Zal mijn dak het pannengewicht dragen?', a: 'Wij berekenen altijd de draagkracht. Indien nodig versterken we de spanten voor installatie.'},
        {q: 'Verschil tussen klei en betonnen pannen?', a: 'Kleipannen zijn natuurlijker en gaan langer mee (tot 100 jaar), terwijl betonnen pannen economischer en maatvaster zijn.'},
        {q: 'Hoe lang gaat een pannendak mee?', a: 'Een correct geïnstalleerd pannendak gaat 50-100 jaar mee, wat het een van de beste langetermijninvesteringen maakt.'}
      ]
    },
    'jumta-logu-montaza': {
      lv: [
        {q: 'Vai jumta logi neizraisīs siltuma zudumus?', a: 'Mūsdienu Roto un Velux logi ar 3 stiklu paketēm ir ļoti energoefektīvi un pareizi iestrādāti (ar siltinājuma bloku) tie ir silti.'},
        {q: 'Vai var ielikt logu jau gatavā jumtā?', a: 'Jā, mēs veicam logu iegriešanu un montāžu arī gatavos jumtos, atjaunojot segumu un siltinājumu ap logu.'},
        {q: 'Kādus logus izvēlēties - koka vai plastmasas?', a: 'Mitras telpās (vannas istaba) iesakām plastmasas vai poliuretāna pārklājuma logus, dzīvojamās istabās - koka.'}
      ],
      en: [
        {q: 'Will skylights cause heat loss?', a: 'Modern Roto and Velux windows with triple glazing are very energy efficient and when properly installed (with insulation block) are warm.'},
        {q: 'Can a window be installed in a finished roof?', a: 'Yes, we cut and install windows in finished roofs, restoring covering and insulation around the window.'},
        {q: 'Wood or PVC windows?', a: 'For humid rooms (bathrooms) we recommend PVC or polyurethane coated, for living rooms - wood.'}
      ],
      'nl-BE': [
        {q: 'Zullen dakramen warmteverlies veroorzaken?', a: 'Moderne Roto en Velux ramen met driedubbel glas zijn zeer energiezuinig en bij correcte installatie (met isolatieblok) warm.'},
        {q: 'Kan een raam in een afgewerkt dak?', a: 'Ja, wij zagen en installeren ramen in afgewerkte daken, met herstel van bedekking en isolatie rondom.'},
        {q: 'Hout of PVC ramen?', a: 'Voor vochtige ruimtes (badkamers) raden we PVC of polyurethaan coating aan, voor woonkamers - hout.'}
      ]
    },
    'jumta-buvnieciba': {
      lv: [
        {q: 'Cik maksā jauna jumta izbūve?', a: 'Izmaksas ir atkarīgas no jumta sarežģītības, izvēlētā materiāla un siltinājuma biezuma. Mēs sagatavojam precīzu tāmi pēc objekta apskates.'},
        {q: 'Kādu materiālu labāk izvēlēties?', a: 'Tas atkarīgs no jumta slīpuma un budžeta. Lēzenākiem jumtiem - valcprofils vai bitumens, stāvākiem - dakstiņi vai metāldakstiņi.'},
        {q: 'Vai jūs kārtojat būvniecības dokumentāciju?', a: 'Jā, sadarbībā ar sertificētiem projektētājiem varam palīdzēt ar nepieciešamo dokumentāciju.'}
      ],
      en: [
        {q: 'How much does a new roof cost?', a: 'Costs depend on complexity, material choice, and insulation thickness. We prepare a precise estimate after site inspection.'},
        {q: 'Which material to choose?', a: 'Depends on slope and budget. Flatter roofs - standing seam or bitumen, steeper - tiles or metal tiles.'},
        {q: 'Do you handle construction permits?', a: 'Yes, in cooperation with certified designers we can assist with necessary documentation.'}
      ],
      'nl-BE': [
        {q: 'Wat kost een nieuw dak?', a: 'Kosten hangen af van complexiteit, materiaalkeuze en isolatiedikte. We maken een precieze schatting na inspectie.'},
        {q: 'Welk materiaal kiezen?', a: 'Hangt af van helling en budget. Vlakkere daken - staande naad of bitumen, steilere - pannen of metaalpannen.'},
        {q: 'Regelen jullie bouwvergunningen?', a: 'Ja, in samenwerking met gecertificeerde ontwerpers kunnen we helpen met documentatie.'}
      ]
    },
    'jumta-apkope-remonts': {
      lv: [
        {q: 'Cik bieži jāveic jumta apkope?', a: 'Iesakām veikt apsekošanu un noteku tīrīšanu vismaz 2 reizes gadā - pavasarī un rudenī.'},
        {q: 'Vai jūs braucat uz nelieliem remontdarbiem?', a: 'Jā, mēs veicam arī nelielus remontus, piemēram, vētras bojājumu novēršanu vai atsevišķu lokšņu nomaiņu.'},
        {q: 'Kā cīnīties ar sūnām uz jumta?', a: 'Mēs piedāvājam profesionālu jumta mazgāšanu un apstrādi ar pretsūnu līdzekļiem, kas aizkavē to ataugšanu.'}
      ],
      en: [
        {q: 'How often for roof maintenance?', a: 'We recommend inspection and gutter cleaning at least twice a year - spring and autumn.'},
        {q: 'Do you do small repairs?', a: 'Yes, we perform small repairs like storm damage fix or individual sheet replacement.'},
        {q: 'How to deal with moss?', a: 'We offer professional roof washing and anti-moss treatment to delay regrowth.'}
      ],
      'nl-BE': [
        {q: 'Hoe vaak dakonderhoud?', a: 'We raden inspectie en gootreiniging minstens 2 keer per jaar aan - lente en herfst.'},
        {q: 'Doen jullie kleine reparaties?', a: 'Ja, we voeren kleine reparaties uit zoals stormschade of vervanging van enkele platen.'},
        {q: 'Hoe mos bestrijden?', a: 'We bieden professionele dakreiniging en anti-mos behandeling om hergroei te vertragen.'}
      ]
    },
    'jumta-remonts': {
      lv: [
        {q: 'Cik ātri varat atnākt uz avāriju?', a: 'Mēs garantējam atnākšanu vidēji 1-2 stundās darbalaikos un 2-3 stundās naktī Rīgā un Pierīgā. Avārija pieņemšana 24/7.'},
        {q: 'Vai var veikt remontu bez visa jumta demontāžas?', a: 'Jā, mūsu speciālisti veic noplūdes diagnostiku un lokālos remontus, neremonējot veselu jumtu, ja tas nav nepieciešams. Tas ietaupa 40-60% no biežajiem remontiem.'},
        {q: 'Kāda garantija uz avārijas remontu?', a: '2 gadu garantija uz remontdarbu un materiāliem. Ūdens noplūdes gadījumā garantijas periodā mēs to likvidējam bez maksas.'}
      ],
      en: [
        {q: 'How quickly can you arrive at an emergency?', a: 'We guarantee arrival within 1-2 hours during business hours and 2-3 hours at night in Riga and Pieriga. 24/7 emergency intake.'},
        {q: 'Can you repair without demolishing entire roof?', a: 'Yes, our specialists perform leak diagnostics and local repairs without re-roofing unless necessary. This saves 40-60% on routine repairs.'},
        {q: 'What warranty on emergency repair?', a: '2-year warranty on workmanship and materials. In case of water leak during warranty period, we fix it free of charge.'}
      ],
      'nl-BE': [
        {q: 'Hoe snel kunnen jullie ter plekke zijn bij noodgeval?', a: 'We garanderen aankomst binnen 1-2 uur tijdens werkuren en 2-3 uur \'s nachts in Kortrijk en omgeving. 24/7 noodopvang.'},
        {q: 'Kunnen jullie repareren zonder compleet dak te slopen?', a: 'Ja, onze specialisten voeren lekdiagnose en lokale reparaties uit zonder compleet dak te vervangen tenzij nodig. Dit bespaard 40-60% op routineonderhoud.'},
        {q: 'Wat is de garantie op noodreparatie?', a: '2 jaar garantie op werk en materialen. Bij waterlek tijdens garantieperiode herstellen we het gratis.'}
      ]
    },
    'noteksistemu-uzstadisana': {
      lv: [
        {q: 'Kādas notekas ir labākas - plastmasas vai metāla?', a: 'Metāla (tērauda) notekas ir izturīgākas pret ledu un sauli, tās neizbalē un neplaisā kā plastmasa.'},
        {q: 'Vai var uzstādīt notekas, ja jumts jau gatavs?', a: 'Jā, ir speciāli stiprinājumi, kas ļauj montēt notekas pie karnīzes dēļa arī gatavam jumtam.'},
        {q: 'Cik maksā noteksistēmas uzstādīšana?', a: 'Cena atkarīga no mājas perimetra un stūru skaita. Precīzu tāmi nosakām pēc mērījumiem.'}
      ],
      en: [
        {q: 'Plastic vs Metal gutters?', a: 'Metal (steel) gutters are more resistant to ice and sun, they don\'t fade or crack like plastic.'},
        {q: 'Can gutters be installed on finished roof?', a: 'Yes, special brackets allow mounting to fascia board on finished roofs.'},
        {q: 'Cost of gutter installation?', a: 'Price depends on perimeter and number of corners. Precise estimate after measurements.'}
      ],
      'nl-BE': [
        {q: 'Plastic vs Metalen goten?', a: 'Metalen (stalen) goten zijn beter bestand tegen ijs en zon, ze verbleken of barsten niet zoals plastic.'},
        {q: 'Kunnen goten op afgewerkt dak?', a: 'Ja, speciale beugels maken montage aan boeiboord mogelijk op afgewerkte daken.'},
        {q: 'Kosten gootinstallatie?', a: 'Prijs hangt af van omtrek en aantal hoeken. Precieze schatting na metingen.'}
      ]
    },
    'jumta-krasosana': {
      lv: [
        {q: 'Vai var krāsot jebkuru jumtu?', a: 'Visbiežāk krāso metāla un šīfera jumtus. Dakstiņus parasti mazgā un impregnē. Mēs novērtēsim piemērotību.'},
        {q: 'Cik ilgi turas krāsa?', a: 'Pareizi sagatavota un nokrāsota virsma kalpo 10-15 gadus līdz nākamajai apkopei.'},
        {q: 'Vai krāsošana aptur rūsu?', a: 'Jā, mēs apstrādājam rūsu ar pārveidotāju un grunti, kas aptur korozijas procesu zem krāsas.'}
      ],
      en: [
        {q: 'Can any roof be painted?', a: 'Mostly metal and slate roofs. Tiles are usually washed and impregnated. We assess suitability.'},
        {q: 'How long does paint last?', a: 'Properly prepared and painted surface lasts 10-15 years until next maintenance.'},
        {q: 'Does painting stop rust?', a: 'Yes, we treat rust with converter and primer, stopping corrosion process under paint.'}
      ],
      'nl-BE': [
        {q: 'Kan elk dak geschilderd worden?', a: 'Meestal metalen en leien daken. Pannen worden meestal gewassen en geïmpregneerd. We beoordelen geschiktheid.'},
        {q: 'Hoe lang blijft verf goed?', a: 'Correct voorbereid en geschilderd oppervlak gaat 10-15 jaar mee tot volgend onderhoud.'},
        {q: 'Stopt schilderen roest?', a: 'Ja, we behandelen roest met omvormer en primer, wat corrosieproces onder verf stopt.'}
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

  // Service-specific benefit headings
  const serviceBenefitHeadings: Record<string, Record<string, string>> = {
    'jumta-renovacija': {
      lv: 'Ar UpRoof Jūs saņemat',
      en: 'With UpRoof You Get',
      'nl-BE': 'Met UpRoof krijgt u'
    },
    'valcprofila-montaza': {
      lv: 'Ar UpRoof Jūs saņemat',
      en: 'With UpRoof You Get',
      'nl-BE': 'Met UpRoof krijgt u'
    },
    'dakstinu-montaza': {
      lv: 'Ar UpRoof Jūs saņemat',
      en: 'With UpRoof You Get',
      'nl-BE': 'Met UpRoof krijgt u'
    },
    'jumta-logu-montaza': {
      lv: 'Ar UpRoof Jūs saņemat',
      en: 'With UpRoof You Get',
      'nl-BE': 'Met UpRoof krijgt u'
    },
    'jumta-buvnieciba': {
      lv: 'Ar UpRoof Jūs saņemat',
      en: 'With UpRoof You Get',
      'nl-BE': 'Met UpRoof krijgt u'
    },
    'jumta-apkope-remonts': {
      lv: 'Ar UpRoof Jūs saņemat',
      en: 'With UpRoof You Get',
      'nl-BE': 'Met UpRoof krijgt u'
    },
    'jumta-remonts': {
      lv: 'Ar UpRoof Jūs saņemat',
      en: 'With UpRoof You Get',
      'nl-BE': 'Met UpRoof krijgt u'
    },
    'noteksistemu-uzstadisana': {
      lv: 'Ar UpRoof Jūs saņemat',
      en: 'With UpRoof You Get',
      'nl-BE': 'Met UpRoof krijgt u'
    },
    'jumta-krasosana': {
      lv: 'Ar UpRoof Jūs saņemat',
      en: 'With UpRoof You Get',
      'nl-BE': 'Met UpRoof krijgt u'
    }
  };

  const benefitHeading = serviceBenefitHeadings[slug]?.[locale] || serviceBenefitHeadings[slug]?.lv || `${h1} priekšrocības ar UpRoof`;

  // Locale-specific city lists
  const cities = locale === 'nl-BE' 
    ? ['Kortrijk', 'Gent', 'Brugge', 'Roeselare', 'Deinze', 'Waregem', 'Oudenaarde', 'Izegem', 'Antwerpen', 'Brussel']
    : ['Rīga', 'Jūrmala', 'Jelgava', 'Ogre', 'Salaspils', 'Ķekava', 'Pierīgas rajons'];

  const cityHeading = locale === 'nl-BE' 
    ? 'Servicegebieden'
    : locale === 'en'
    ? 'Service Areas'
    : 'Apkalpojamās teritorijas';

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
          {/* HEADING AND OVERVIEW */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{h1}</h1>
          {serviceContent.overview && (
            <p className="text-lg text-gray-700 leading-relaxed mb-6">{serviceContent.overview}</p>
          )}
          
          {/* GEOGRAPHIC SERVICE AREA */}
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
                  {idx === 0 ? <strong>{city}</strong> : city}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 mt-4">
              {cityFooter}
            </p>
          </div>

          {/* BENEFITS SECTION */}
          {serviceContent.benefits.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                {benefitHeading}
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

          {/* PROCESS SECTION */}
          {serviceContent.process.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">
                {locale === 'nl-BE' ? 'Ons werkproces' : locale === 'en' ? 'Our Work Process' : 'Mūsu darba process'}
              </h2>
              <ol className="space-y-3">
                {serviceContent.process.map((step, idx) => (
                  <li key={step} className="flex items-start">
                    <span className="font-bold text-white bg-primary-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">{idx + 1}</span>
                    <span className="text-gray-700 pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* M-I-E-R-S Method Integration */}
          <MiersMethod locale={locale} variant="compact" />

          {/* CALL TO ACTION */}
          <div className="bg-primary-600/10 border-l-4 border-primary-600 p-6 rounded-md mb-8">
            <p className="font-semibold text-primary-800">
              {locale === 'nl-BE' 
                ? 'Gratis eerste consultatie en dakstaat evaluatie. Schrijf of bel: '
                : locale === 'en'
                ? 'Free initial consultation and roof condition assessment. Write or call: '
                : 'Bezmaksas sākotnējā konsultācija un jumta stāvokļa novērtējums Rīgā un Pierīgā. Rakstiet vai zvaniet: '}
              <a href="tel:+37125612440" className="underline font-bold">+371 25612440</a>
            </p>
          </div>

          {/* FAQ SECTION */}
          <h2 className="text-2xl font-bold mb-4">
            {locale === 'nl-BE' ? 'Veelgestelde vragen' : locale === 'en' ? 'Frequently Asked Questions' : 'Biežāk uzdotie jautājumi'}
          </h2>
          <ul className="space-y-4 mb-10">
            {faqs.map(f => (
              <li key={f.q}>
                <h3 className="font-semibold text-gray-900">❓ {f.q}</h3>
                <p className="text-gray-700 mt-1">{f.a}</p>
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
