import {unstable_setRequestLocale} from 'next-intl/server';
import type {Metadata} from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import InternalLinks from '@/components/InternalLinks';
import MiersMethod from '@/components/MiersMethod';
import Section from '@/components/Section';
import Card from '@/components/Card';
import Grid from '@/components/Grid';

// Service slugs focused on Latvian queries
const SERVICE_SLUGS = [
  'jumta-renovacija',
  'valcprofila-montaza',
  'dakstinu-montaza',
  'jumta-logu-montaza',
  'jumta-buvnieciba',
  'jumta-konstrukciju-montaza',
  'jumta-apkope-remonts',
  'jumta-remonts',
  'noteksistemu-uzstadisana',
  'jumta-krasosana',
  'saules-dakstini'
];

type PageProps = {
  params: Promise<{locale: string; slug: string}>;
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
    keywords: 'jumta renovācija Rīgā, jumta nomaiņa Rīgā, jumta seguma maiņa, jumta renovācija Latvijā, jumta atjaunošana Rīgā, jumta remonts Pierīgā, roof renovation Riga, dakrenovatie België'
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
    keywords: 'valcprofila montāža Rīgā, metāla jumta montāža Rīgā, stāvošā šuve, valcprofils, metāla jumts Rīgā, skārda jumts, skārdnieka darbi, jumta ieklāšana, falcētais jumts, standing seam roofing Riga, staande naad dakbedekking België'
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
    keywords: 'dakstiņu montāža Rīgā, jumta ieklāšana, jumta seguma montāža, māla dakstiņi Latvijā, tile roof installation Riga, pannendak installatie België'
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
    keywords: 'jumta būvniecība Rīgā, jumta darbi Rīgā, jumta seguma montāža, jumta ieklāšana Rīgā, jumtu būvniecība Latvijā, jauna jumta celtniecība Rīgā, roof construction Riga, dakbouw België'
  },
  'jumta-konstrukciju-montaza': {
    title: {
      lv: 'Jumta konstrukciju montāža Rīgā | Jumta kopnes un spāres | UpRoof',
      en: 'Roof Truss Installation in Riga | Load-bearing Timber Structure | UpRoof',
      'nl-BE': 'Dakconstructie montage in België | Dakspanten & sporen | UpRoof'
    },
    description: {
      lv: 'Jumta konstrukciju montāža Rīgā un Latvijā: gatavo jumta kopņu uzstādīšana, jumta spāru montāža, mūrlatas montāža un jumta krēsla montāža. Precīza jumta koka konstrukciju izbūve ar drošiem mezgliem un garantiju.',
      en: 'Roof truss installation in Riga and Latvia: prefabricated roof truss installation, on-site rafter assembly, wall plate installation and roof frame. Precise load-bearing timber structure with accurate geometry, secure fasteners, and load-verified connections built to building standards.',
      'nl-BE': 'Dakconstructie montage in België: plaatsing van prefab dakspanten, sporen, muurplaten en dakstoel. Nauwkeurige houten dakconstructie met veilige verbindingen en garantie.'
    },
    keywords: 'jumta konstrukciju montāža, jumta kopnes, jumta spāru montāža, mūrlatas montāža, jumta krēsla montāža, jumta koka konstrukcijas, jumta karkass, spāru sistēma, roof truss installation, timber roof structure, dakspanten montage'
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
    keywords: 'jumta apkope Rīgā, jumta remonts Rīgā, jumta darbi, jumts tek, jumta noplūde, noteku tīrīšana Rīgā, noteku montāža, jumta tīrīšana, jumta mazgāšana, avārijas remonts, lāsteku noņemšana, sniega tīrīšana jumtiem, skursteņa apdare, roof maintenance Riga, dakonderhoud België'
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
    keywords: 'noteksistēmu uzstādīšana Rīgā, noteku montāža Rīgā, noteksistēmu montāža jumtam Latvijā, noteku uzstādīšana, gutter installation Riga, gootsysteem installatie België'
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
    keywords: 'jumta remonts Rīgā, jumta darbi Rīgā, jumts tek, jumta noplūde avārija, avārijas reaģēšana, jumta remonts Pierīgā, emergency roof repair Riga, dak reparatie noodgeval België'
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
  },
  'saules-dakstini': {
    title: {
      lv: 'Saules jumta dakstiņi Rīgā | Integrēti saules paneļu dakstiņi | UpRoof',
      en: 'Solar Roof Tiles in Riga | Integrated Solar Roofing | UpRoof',
      'nl-BE': 'Zonnedakpannen in België | Geïntegreerde zonne-dakoplossing | UpRoof'
    },
    description: {
      lv: 'Integrētie saules dakstiņi – elegants risinājums, kas apvieno jumta segumu un saules enerģijas ražošanu. Estētiski, hermētiski un droši Latvijas klimatā. Projektēšana, uzstādīšana un garantija.',
      en: 'Integrated solar roof tiles combine roofing and energy generation in one elegant system. Aesthetic, weatherproof and safe for Baltic climate. Design, installation and warranty.',
      'nl-BE': 'Geïntegreerde zonnedakpannen combineren dakbedekking en energieopwekking in één elegant systeem. Esthetisch, weerbestendig en veilig. Ontwerp, installatie en garantie.'
    },
    keywords: 'saules dakstiņi Rīgā, saules jumta dakstiņi, solar roof tiles Riga, integrated solar roofing, zonnedakpannen België'
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
        overview: 'Pilna cikla jumta renovācija un jumta nomaiņa ir kapitālais remonts, kas atjauno jumta konstrukciju, izolāciju, siltināšanu un segumu. Mēs veicam pilnīgu jumta seguma montāžu un jumta ieklāšanu, nodrošinot, ka jūsu jumts kļūst kā jauns ar moderniem izolācijas materiāliem un ilgmūžīgiem seguma risinājumiem.',
        benefits: ['Pilnīga jumta konstrukciju atjaunošana', 'Moderna siltināšanas materiālu izmantošana', 'Garantēta noplūžu novēršana', 'Jumta estētikas uzlabošana', 'Enerģijas taupīšana ar labāku izolāciju'],
        process: ['Jumta stāvokļa diagnostika ar dronu un tehniskā izpēte', 'Veca jumta seguma un bojāto elementu demontāža', 'Jumta konstrukcijas stiprības pārbaude, bojāto spāru un paneļu nomaiņa', 'Skursteņu atjaunošana, renovācija un hermētiskās sistēmas uzstādīšana', 'Jumta siltināšanas darbi ar mūsdienīgiem termoizolācijas materiāliem', 'Difūzijas membrānas/zemseguma uzstādīšana ar ventilācijas sistēmu', 'Latojuma un kontrlatojuma montāža ar precīzu līmeņošanu', 'Jumta noteksistēmas montāža ar teknes āķu iestrādāšanu', 'Jauna jumta seguma montāža ar hermētiskiem savienojumiem un pieslēgumiem', 'Jumta drošības elementu un aksesuāru montāža - sniega barjeras, laipas, ventilācija', 'Vēja kastes, apmalēm un apdares elementu montāža', 'Būvniecības atkritumu utilizācija, darba vietas satīrīšana un jumta funkcionalitātes pārbaude'],
        qualityPoints: ['10 gadu garantija uz montāžas darbu', 'Sertificēti speciālisti ar 15+ gadu pieredzi', 'ISO 9001 sertificēta kvalitātes vadības sistēma', 'Drošības protokoli atbilst Latvijas būvnormatīviem'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'noteksistemu-uzstadisana', 'jumta-krasosana']
      },
      en: {
        overview: 'Full-cycle roof renovation is a major overhaul that restores roof structure, insulation, waterproofing and covering. We ensure your roof becomes like new with modern insulation materials and durable roofing solutions.',
        benefits: ['Complete roof structure renewal', 'Modern insulation materials usage', 'Guaranteed leak prevention', 'Roof aesthetics improvement', 'Energy savings with better insulation'],
        process: ['Roof condition diagnostics with drone and technical investigation', 'Old roof covering and damaged elements demolition', 'Roof structure strength verification, damaged rafters and panels replacement', 'Chimney renovation, restoration and hermetic system installation', 'Roof insulation work with modern thermal insulation materials', 'Diffusion membrane/underlayment installation with ventilation system', 'Batten and counter-batten installation with precise leveling', 'Gutter system installation with gutter bracket embedding', 'New roof covering installation with hermetic connections and attachments', 'Roof safety elements and accessories installation - snow guards, walkways, ventilation', 'Wind box, edges and trim elements installation', 'Construction waste disposal, work site cleaning and roof functionality verification'],
        qualityPoints: ['10-year warranty on workmanship', 'Certified specialists with 15+ years experience', 'ISO 9001 certified quality management system', 'Safety protocols comply with building regulations'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'noteksistemu-uzstadisana', 'jumta-krasosana']
      },
      'nl-BE': {
        overview: 'Volledige dakrenovatie is een grote opknapbeurt die dakstructuur, isolatie, waterdichting en bedekking herstelt. Wij zorgen dat uw dak als nieuw wordt met moderne isolatiematerialen en duurzame dakbedekkingsoplossingen.',
        benefits: ['Volledige dakstructuur vernieuwing', 'Gebruik van moderne isolatiematerialen', 'Gegarandeerde lekpreventie', 'Verbetering dakesthetiek', 'Energiebesparing met betere isolatie'],
        process: ['Daktoestand diagnose met drone en technisch onderzoek', 'Oude dakbedekking en beschadigde elementen sloop', 'Dakstructuur sterkte verificatie, beschadigde spanten en panelen vervanging', 'Schoorsteen renovatie, herstel en hermetische systeem installatie', 'Dakisolatiewerk met moderne thermische isolatiematerialen', 'Diffusiemembraan/onderlaag installatie met ventilatiesysteem', 'Panlat en tengellat installatie met nauwkeurige nivellering', 'Gootsysteem installatie met gootbeugel inbouw', 'Nieuwe dakbedekking installatie met hermetische verbindingen en bevestigingen', 'Dak veiligheidselementen en accessoires installatie - sneeuwvangers, loopplanken, ventilatie', 'Windveer, randen en afwerkelementen installatie', 'Bouwafval verwijdering, werkplaats reiniging en dak functionaliteit verificatie'],
        qualityPoints: ['10 jaar garantie op vakmanschap', 'Gecertificeerde specialisten met 15+ jaar ervaring', 'ISO 9001 gecertificeerd kwaliteitsmanagementsysteem', 'Veiligheidsprotocollen voldoen aan bouwvoorschriften'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'noteksistemu-uzstadisana', 'jumta-krasosana']
      }
    },
    'valcprofila-montaza': {
      lv: {
        overview: 'Latvijas skarbajos laikapstākļos ar krasajām temperatūras maiņām un lielo mitrumu vispiemērotākie ir metāla valcprofila jumti. Metāla jumta montāža ar valcprofila segumu nodrošina maksimālu hermētiskumu ar dubultlocījumiem, ilgmūžību un elegantu izskatu. Piemērots gan jaunbūvēm, gan jumta nomaiņai.',
        benefits: ['Pilnīgs hermētiskums - dubultā metāla locīšana izveido pilnībā hermētiskus savienojumus', 'Laikapstākļu noturība - spēj izplesties un sarauties temperatūras maiņas rezultātā, nesaplaisā pēc daudzkārtējas temperatūras maiņas', 'Viegla kopšana ziemas apstākļos - var droši pārvietoties un apkopot, tīrīt sniegu un ledu', 'Ilgmūžība 50+ gadi - vienīgais drauds ir rūsa, ko novērš ar pārkrāsošanu ik pēc 5-10 gadiem', 'Vēsturisks pierādījums - Latvijas arhitektūrā kalpo jau simtiem gadu ar pareizu apkopi'],
        process: ['Vecā jumta demontāža un jumta konstrukcijas sagatavošana', 'Jumta konstrukcijas izbūve ar gatavām kopņu konstrukcijām vai montējot spāres un jumta krēslu uz vietas', 'Skursteņu atjaunošana un izbūve', 'Jumta siltināšanas darbi', 'Difūzijas membrānas/zemseguma uzstādīšana paredzot zemseguma ventilāciju', 'Latojuma montāža un līmeņošana', 'Jumta noteksistēmas montāža, teknes āķus iestrādājot uz spārēm zem jumta seguma', 'Valcprofila seguma montāža un visu nepieciešamo pieslēgumu montāža ar dubultlocījumiem', 'Jumta aksesuāru un papildus elementu montāža - sniega barjeras, jumta drošības laipas, jumta ventilācijas izvadi un citi jumta elementi', 'Vēja kastes un koka fasādes montāža ar dekoratīviem apdares dēļiem vai vēja kastes skārda paneļiem', 'Būvniecības laikā radušos atkritumu utilizācija un darba vietas satīrīšana', 'Jumta funkcionalitātes un hermētiskuma pārbaude'],
        qualityPoints: ['10 gadu garantija uz darbu', '50 gadu ražotāja garantija uz krāsu pārklājumu un metāla integritāti', 'Sertificēti instalatori no ražotāja', 'Hermētiskuma pārbaude ar ūdens testa metodiku', 'Profesionāla valcējuma iekārta'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'noteksistemu-uzstadisana', 'jumta-logu-montaza']
      },
      en: {
        overview: 'In harsh Baltic weather conditions with extreme temperature changes and high humidity, metal standing seam roofs are the most suitable. Standing seam metal roofing provides maximum hermeticity with double-locks, longevity and elegant appearance. Suitable for new construction and renovations.',
        benefits: ['Complete hermeticity - double metal folding creates fully hermetic connections', 'Weather resistance - expands and contracts with temperature changes without cracking after repeated temperature fluctuations', 'Easy winter maintenance - safe to walk on and maintain, clear snow and ice without damage concerns', '50+ year durability - only threat is rust, prevented by repainting every 5-10 years', 'Historical proof - serving Latvian architecture for centuries with proper maintenance'],
        process: ['Old roof demolition and roof structure preparation', 'Roof structure construction with pre-made truss structures or installing rafters and roof chair on-site', 'Chimney renovation and construction', 'Roof insulation work', 'Diffusion membrane/underlayment installation with ventilation provision', 'Batten installation and leveling', 'Gutter system installation, embedding gutter brackets on rafters under the roof covering', 'Standing seam covering installation and all necessary connections with double-locks', 'Roof accessories and additional elements installation - snow guards, roof safety walkways, roof ventilation outlets and other roof elements', 'Wind box and wooden facade installation with decorative trim boards or wind box metal panels', 'Construction waste disposal and work site cleaning', 'Roof functionality and hermeticity verification'],
        qualityPoints: ['10-year warranty on workmanship', '50-year manufacturer warranty on paint coating and metal integrity', 'Certified installers from manufacturer', 'Hermeticity verification with water test methodology'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'noteksistemu-uzstadisana', 'jumta-logu-montaza']
      },
      'nl-BE': {
        overview: 'In harde Baltische weersomstandigheden met extreme temperatuurwisselingen en hoge luchtvochtigheid zijn metalen staande naad daken het meest geschikt. Staande naad metalen dakbedekking biedt maximale hermeticiteit met dubbele sluitingen, duurzaamheid en elegant uiterlijk. Geschikt voor nieuwbouw en renovaties.',
        benefits: ['Volledige hermeticiteit - dubbele metaalvouwen creëren volledig hermetische verbindingen', 'Weerbestendigheid - zet uit en krimpt bij temperatuurveranderingen zonder scheuren na herhaalde temperatuurschommelingen', 'Gemakkelijk winteronderhoud - veilig begaanbaar en onderhoudbaar, sneeuw en ijs verwijderen zonder schade', '50+ jaar duurzaamheid - enige bedreiging is roest, voorkomen door elke 5-10 jaar opnieuw te schilderen', 'Historisch bewijs - dient Baltische architectuur al eeuwenlang met goed onderhoud'],
        process: ['Oude dak sloop en dakstructuur voorbereiding', 'Dakstructuur constructie met kant-en-klare spantconstructies of installatie van spanten en dakstoel ter plaatse', 'Schoorsteenrenovatie en -bouw', 'Dakisolatiewerk', 'Diffusiemembraan/onderlaag installatie met ventilatie voorziening', 'Panlat installatie en nivellering', 'Gootsysteem installatie, gootbeugels inbouwen op spanten onder dakbedekking', 'Staande naad bedekking installatie en alle noodzakelijke aansluitingen met dubbele sluitingen', 'Daktoebehoren en extra elementen installatie - sneeuwvangers, dak veiligheidsloopplanken, dak ventilatie-uitgangen en andere dakelementen', 'Windveer en houten gevelbekleding installatie met decoratieve afwerkplanken of windveer metalen panelen', 'Bouwafval verwijdering en werkplaats reiniging', 'Dak functionaliteit en hermeticiteit verificatie'],
        qualityPoints: ['10 jaar garantie op vakmanschap', '50 jaar fabrieksgarantie op verflaag en metaalintegriteit', 'Gecertificeerde installateurs van fabrikant', 'Hermeticiteit verificatie met watertestmethodologie'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'noteksistemu-uzstadisana', 'jumta-logu-montaza']
      }
    },
    'dakstinu-montaza': {
      lv: {
        overview: 'Māla vai betona dakstiņu montāža nodrošina ilgmūžīgu, estētisku jumta risinājumu ar izcilu siltuma un skaņas izolāciju. Dakstiņi kalpo vairāk nekā 50 gadus un piešķir mājai prestižu izskatu.',
        benefits: [
          'Ražotāja noteikts kalpošanas laiks 50+ gadi, ja ievēro uzstādīšanas un apkopes prasības',
          'Ļoti laba siltuma un skaņas izolācija, atbilst Latvijas un Eiropas Savienības prasībām',
          'Nededzināms materiāls (ugunsdrošības klase A1)',
          'Ventilēta jumta konstrukcija samazina kondensāta un pelējuma risku',
          'Stiprinājumi un klipši ir aprēķināti sniega un vēja zonām, ar precīzu nestspējas aprēķinu',
          'Darbi ar līgumu, garantiju un dokumentāciju; piemēro Latvijas un Eiropas Savienības patērētāju tiesības'
        ],
        process: ['Vecā jumta demontāža un jumta konstrukcijas sagatavošana', 'Jumta konstrukcijas pastiprināšana un nestspējas aprēķins dakstiņu svaram', 'Skursteņu atjaunošana un izbūve', 'Jumta siltināšanas darbi un termoizolācijas slāņa izbūve', 'Elpojošās membrānas/zemseguma uzstādīšana ar ventilācijas spraugu', 'Latojuma un kontrlatojuma precīza montāža un līmeņošana', 'Jumta noteksistēmas montāža un teknes āķu iestrādāšana', 'Māla vai betona dakstiņu precīza ieklāšana, ventilējamas kores vai vesturiskas kores montāža', 'Kores, vējmalu elementu montāža ar hermētiskiem pieslēgumiem', 'Jumta drošības elementu montāža - sniega barjeras, jumta kāpnes, laipas', 'Vēja kastes un apdares elementu montāža', 'Būvniecības atkritumu utilizācija, darba vietas sakārtošana un jumta hermētiskuma pārbaude'],
        qualityPoints: ['10 gadu garantija uz montāžas darbu', 'Dakstiņu garantija līdz 50 gadiem', 'Ugunsdrošības klase A1', 'Speciālistiem ir sertifikāti dakstiņu montāžai'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'valcprofila-montaza', 'jumta-renovacija']
      },
      en: {
        overview: 'Clay or concrete tile installation provides a durable, aesthetic roofing solution with excellent heat and sound insulation. Tiles last more than 50 years and give your home a prestigious appearance.',
        benefits: [
          'Manufacturer-rated service life of 50+ years when installation and maintenance requirements are followed',
          'Strong thermal and acoustic performance that meets Latvia and European Union standards',
          'Non-combustible material (fire class A1)',
          'Ventilated build-up reduces condensation and mould risk',
          'Fastening plan with clips and screws sized for local wind and snow loads and verified load calculations',
          'Documented contract and warranty; work complies with Latvia and European Union building and consumer protection rules'
        ],
        process: ['Old roof demolition and roof structure preparation', 'Roof structure reinforcement and load capacity calculation for tile weight', 'Chimney renovation and construction', 'Roof insulation work and thermal insulation layer construction', 'Breathable membrane/underlayment installation with ventilation gap', 'Batten and counter-batten precise installation and leveling', 'Gutter system installation and gutter bracket embedding', 'Precise tile laying, fastening with tile clips and ridge tape installation', 'Ridge, edge and wind element installation with hermetic connections', 'Roof safety elements installation - snow guards, ladders, walkways', 'Wind box and trim elements installation', 'Construction waste disposal, work site organization and roof hermeticity verification'],
        qualityPoints: ['10-year warranty on workmanship', 'Tile manufacturer warranty up to 50 years', 'Fire safety class A1', 'Specialists are certified for tile installation'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'valcprofila-montaza', 'jumta-renovacija']
      },
      'nl-BE': {
        overview: 'Klei of betonnen pannendak installatie biedt een duurzame, esthetische dakoplossing met uitstekende warmte en geluidsisolatie. Pannen gaan meer dan 50 jaar mee en geven uw huis een prestigieuze uitstraling.',
        benefits: [
          'Fabrikant opgegeven levensduur van 50+ jaar bij correcte plaatsing en onderhoud',
          'Sterke thermische en akoestische prestaties volgens de normen van Letland en de Europese Unie',
          'Onbrandbaar materiaal (brandklasse A1)',
          'Geventileerde opbouw vermindert condens- en schimmelrisico',
          'Bevestigingsplan met klemmen en schroeven afgestemd op wind- en sneeuwzones, draagkracht berekend',
          'Werk met contract, garantie en documentatie; conform de bouw- en consumentenregels van Letland en de Europese Unie'
        ],
        process: ['Oude dak sloop en dakstructuur voorbereiding', 'Dakstructuurversterking en draagkrachtberekening voor pannengewicht', 'Schoorsteenrenovatie en -bouw', 'Dakisolatiewerk en thermische isolatielaag constructie', 'Ademend membraan/onderlaag installatie met ventilatiespouw', 'Panlatten en tengellatten nauwkeurige installatie en nivellering', 'Gootsysteem installatie en gootbeugel inbouw', 'Nauwkeurig pannen leggen, bevestigen met pannenklemmen en nokband installatie', 'Nok-, rand- en windelementen installatie met hermetische verbindingen', 'Dak veiligheidselementen installatie - sneeuwvangers, ladders, loopplanken', 'Windveer en afwerkelementen installatie', 'Bouwafval verwijdering, werkplaats organisatie en dak hermeticiteit verificatie'],
        qualityPoints: ['10 jaar garantie op vakmanschap', 'Pannenfabrikant garantie tot 50 jaar', 'Vuurveiligheidsklas A1', 'Specialisten zijn gecertificeerd voor pannendak installatie'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'valcprofila-montaza', 'jumta-renovacija']
      }
    },
    'jumta-logu-montaza': {
      lv: {
        overview: 'Jumta logu (daklogu) montāža pievieno papildus gaismu un vēdināšanu jumta stāvam bez jumta funkcionālitātes zaudēšanas. Mēs montējam Roto un Velux augstākās kvalitātes logus ar profesionālu hidroizolāciju.',
        benefits: ['Dabiskā apgaismojuma palielināšana jumta stāvā', 'Telpu vēdināšanas uzlabošana ar automātisko vadību', 'Energoefektīvi stikla pakešu risinājumi', 'Profesionāla hidroizolācija un siltināšana', 'Drošas un vieglas vadības sistēmas'],
        process: ['Jumta konstrukcijas izpēte un loga izvietojuma plānošana', 'Loga atveres precīza izzāģēšana jumta segumā un latojumā', 'Jumta konstrukcijas pastiprināšana un apkārtējo spāru atbalsta sistēmas uzstādīšana', 'Loga rāmja montāža ar precīzu līmeņošanu un fiksāciju', 'Iekšējās hidroizolācijas un siltinājuma pieslēguma izbūve', 'Difūzijas membrānas un ārējās hidroizolācijas savienojums', 'Ārējās apdares plates un seguma pieslēguma montāža', 'Jumta seguma atjaunošana ap logu ar hermētiskiem savienojumiem', 'Loga stikla paketes un vēramo mehānismu uzstādīšana', 'Iekšējās apdares un finiera paneļu montāža', 'Automātikas un vadības sistēmu pieslēgšana (ja nepieciešams)', 'Funkcionalitātes testēšana un hermētiskuma pārbaude ar ūdens testu'],
        qualityPoints: ['10 gadu garantija uz montāžas darbu', 'Roto/Velux garantija uz logiem (5-10 gadi)', 'Hermētiskuma pārbaude pēc montāžas', 'Sertificēti instalatori no ražotāja'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'valcprofila-montaza', 'jumta-renovacija']
      },
      en: {
        overview: 'Skylight (roof window) installation adds extra light and ventilation to attic spaces without compromising roof functionality. We install Roto and Velux high-quality windows with professional waterproofing.',
        benefits: ['Increased natural lighting in attic spaces', 'Improved room ventilation with automated control', 'Energy-efficient glazing solutions', 'Professional waterproofing and insulation', 'Safe and easy-to-use control systems'],
        process: ['Roof structure investigation and window placement planning', 'Precise window opening cutting in roof covering and battens', 'Roof structure reinforcement and surrounding rafter support system installation', 'Window frame installation with precise leveling and fixation', 'Internal waterproofing and insulation connection construction', 'Diffusion membrane and external waterproofing connection', 'External flashing plate and covering connection installation', 'Roof covering restoration around window with hermetic connections', 'Window glass unit and opening mechanism installation', 'Internal trim and veneer panel installation', 'Automation and control systems connection (if required)', 'Functionality testing and hermeticity verification with water test'],
        qualityPoints: ['10-year warranty on workmanship', 'Roto/Velux warranty on windows (5-10 years)', 'Hermeticity verification after installation', 'Certified installers from manufacturer'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'valcprofila-montaza', 'jumta-renovacija']
      },
      'nl-BE': {
        overview: 'Dakraam installatie voegt extra licht en ventilatie toe aan zolderruimtes zonder de dakfunctionaliteit in het gedrang te brengen. We installeren Roto en Velux hoogwaardige ramen met professionele waterdichting.',
        benefits: ['Verhoogde natuurlijke verlichting in zolderruimtes', 'Verbeterde kamerventilatie met geautomatiseerde controle', 'Energie-efficiënte beglazingsoplossingen', 'Professionele waterdichting en isolatie', 'Veilige en gebruiksvriendelijke bedieningssystemen'],
        process: ['Dakstructuur onderzoek en raamplaatsing planning', 'Nauwkeurige raamopening zagen in dakbedekking en panlatten', 'Dakstructuurversterking en omringende spant ondersteuningssysteem installatie', 'Raamkader installatie met nauwkeurige nivellering en fixatie', 'Interne waterdichting en isolatie aansluiting constructie', 'Diffusiemembraan en externe waterdichting verbinding', 'Externe gootplaat en bedekking aansluiting installatie', 'Dakbedekking herstel rond raam met hermetische verbindingen', 'Raamglas eenheid en openingsmechanisme installatie', 'Interne trim en fineer paneel installatie', 'Automatisering en besturingssystemen aansluiting (indien vereist)', 'Functionaliteitstest en hermeticiteit verificatie met watertest'],
        qualityPoints: ['10 jaar garantie op vakmanschap', 'Roto/Velux garantie op ramen (5-10 jaar)', 'Hermeticiteit verificatie na installatie', 'Gecertificeerde installateurs van fabrikant'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'valcprofila-montaza', 'jumta-renovacija']
      }
    },
    'jumta-buvnieciba': {
      lv: {
        overview: 'Jumta būvniecība un jumta darbi ir komplekss process no projektēšanas līdz gatavajam jumtam, kurā ietilpst konstrukcija, izolācija, siltināšana, jumta seguma montāža, jumta ieklāšana un noteku montāža. Mēs piedāvājam pilna cikla risinājumus ar individuālu projektēšanu.',
        benefits: ['Pilna cikla būvniecība no A līdz Z', 'Sertificēti būvspeciālisti un jumtu projektētāji', 'Atbilstība visiem Latvijas būvnormatīviem', 'Individuāla projektēšana un tāme', 'Ilgtspējīgi un hermētiski jumta risinājumi'],
        process: ['Objekta apsekošana, mērīšana un tāmēšana', 'Projektēšana un būvniecības atļauju ieguves palīdzība', 'Jumta konstrukcijas izbūve ar gatavām kopņu konstrukcijām vai montējot spāres un jumta krēslu uz vietas', 'Skursteņu atjaunošana un izbūve', 'Jumta siltināšanas darbi un termiskās izolācijas sistēmas uzstādīšana', 'Difūzijas membrānas/zemseguma uzstādīšana paredzot zemseguma ventilāciju', 'Latojuma montāža un līmeņošana', 'Jumta noteksistēmas montāža, teknes āķus iestrādājot uz spārēm', 'Jumta seguma montāža un visu nepieciešamo pieslēgumu hermētiska izbūve', 'Jumta aksesuāru un drošības elementu montāža - sniega barjeras, jumta laipas, ventilācijas izvadi', 'Vēja kastes un fasādes apdares darbi ar kvalitatīviem materiāliem', 'Būvniecības atkritumu utilizācija, darba vietas satīrīšana un jumta funkcionalitātes pārbaude'],
        qualityPoints: ['10 gadu garantija uz visu darbu', 'ISO 9001 sertificēta kvalitātes vadība', 'Būvniecības dokumentācijas sagatavošana', 'Speciālistu sertifikāti un licences'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-logu-montaza', 'noteksistemu-uzstadisana', 'jumta-krasosana']
      },
      en: {
        overview: 'Roof construction is a complex process from design to finished roof, including structure, insulation, waterproofing, covering and drainage systems. We offer full-cycle solutions with individual design.',
        benefits: ['Full-cycle construction from A to Z', 'Certified construction specialists and designers', 'Compliance with all building codes and regulations', 'Individual project design and estimation', 'Modern insulation solutions with energy efficiency'],
        process: ['Site inspection, measurement and estimation', 'Design and assistance with building permits', 'Roof structure construction with pre-made truss structures or installing rafters and roof chair on-site', 'Chimney renovation and construction', 'Roof insulation work and thermal insulation system installation', 'Diffusion membrane/underlayment installation with ventilation provision', 'Batten installation and leveling', 'Gutter system installation, embedding gutter brackets on rafters', 'Roof covering installation and hermetic construction of all necessary connections', 'Roof accessories and safety elements installation - snow guards, roof walkways, ventilation outlets', 'Wind box and facade finishing works with quality materials', 'Construction waste disposal, work site cleaning and roof functionality verification'],
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
    'jumta-konstrukciju-montaza': {
      lv: {
        overview: 'Jumta konstrukciju montāža nozīmē precīzu nesošo elementu izbūvi un stabilu jumta karkasu. Mēs montējam gatavas jumta kopnes, veicam jumta spāru montāžu, mūrlatas montāžu un jumta krēsla montāžu uz vietas. Pareiza konstrukcijas ģeometrija, stīvinājumi un savienojumi nodrošina ilgmūžību un drošību jebkuram jumta segumam.',
        benefits: ['Ātra montāža ar gatavām jumta kopnēm', 'Precīza ģeometrija un nestspēja', 'Vienmērīgs līmenis visā jumta karkasā', 'Droši mezgli, kvalitatīvi stiprinājumi un enkurošana', 'Sagatavots pamats jebkuram jumta segumam un siltināšanai', 'Saskaņoti risinājumi ar projektu un slodžu aprēķiniem', 'Sertificēta un pieredzējusi brigāde', 'Precīza darbu dokumentācija un kontrole', 'Skaidra tāme un termiņi pirms darbu sākuma'],
        process: ['Objekta uzmērīšana, slodžu un laidumu izvērtēšana', 'Konstrukciju risinājuma saskaņošana un kopņu vai kokmateriālu piegādes plāns', 'Mūrlatas montāža, hidroizolācija un enkurošana pie nesošajām sienām', 'Jumta kopņu uzstādīšana vai jumta spāru montāža uz vietas', 'Jumta krēsla montāža, saišu nostiprināšana un savilcēji', 'Vējstiepņu, atgāžņu, diagonāļu un savienojumu montāža', 'Karnīžu līniju, koru un slīpumu ģeometrijas pārbaude', 'Latojuma un kontrlatojuma sagatavošana seguma montāžai', 'Stiprinājumu un mezglu kvalitātes kontrole', 'Sagatavošana jumta seguma un ventilācijas sistēmu montāžai', 'Gala pārbaude un pieņemšana ar jumta seguma montāžu'],
        qualityPoints: ['10 gadu garantija uz montāžas darbu', 'Atbilstība Latvijas būvnormatīvu prasībām un drošības protokoliem', 'Precīza ģeometrijas kontrole ar mērījumiem', 'Kvalitatīvi stiprinājumi un sertificēti materiāli', 'Foto fiksācijas un darba pieņemšanas kontrole', 'Garantija uz darbiem un atbildība par rezultātu', 'Materiālu atbilstība ražotāju specifikācijām'],
        relatedServices: ['jumta-buvnieciba', 'valcprofila-montaza', 'dakstinu-montaza', 'jumta-logu-montaza']
      },
      en: {
        overview: 'Roof truss installation is the precise assembly of load-bearing elements to form a stable roof frame. We install prefabricated roof trusses, perform on-site rafter installation, wall plate installation and roof chair installation. Correct geometry, bracing and connections ensure longevity and safety for any roof covering.',
        benefits: ['Fast installation with prefabricated roof trusses', 'Accurate geometry and verified load-bearing capacity', 'Level and uniform across the entire roof structure', 'Secure joints, bracing and quality fasteners', 'Ready foundation for insulation, ventilation and any roof covering type', 'Structural design aligned with load calculations and building standards', 'Certified and experienced installation team', 'Precise work documentation and quality control', 'Clear estimate and timeline before work begins'],
        process: ['Site measurement, span evaluation and structural load assessment', 'Structure solution review and truss or timber delivery plan', 'Wall plate installation, waterproofing and anchoring to load-bearing walls', 'Prefabricated roof truss installation or on-site rafter assembly', 'Roof frame (roof chair) assembly with ties and proper connections', 'Installation of wind bracing, diagonal ties and structural connections', 'Verification of ridge line geometry, slopes and horizontal level', 'Installation and leveling of batten and counter-batten layer', 'Quality inspection of all fasteners and joints for safety', 'Final preparation for roof covering and ventilation system installation', 'Final inspection and handover with roof covering installation'],
        qualityPoints: ['10-year warranty on installation work', 'Compliance with building regulations and safety protocols', 'Precise geometry control with measurements', 'Quality fasteners and certified materials', 'Photo documentation and acceptance checks', 'Work guarantee and accountability for results', 'Materials comply with manufacturer specifications'],
        relatedServices: ['jumta-buvnieciba', 'valcprofila-montaza', 'dakstinu-montaza', 'jumta-logu-montaza']
      },
      'nl-BE': {
        overview: 'Dakconstructie montage is de nauwkeurige opbouw van dragende houten elementen die samen een stabiele dakstructuur vormen. We monteren prefab dakspanten, voeren sporenmontage ter plaatse uit en plaatsen muurplaten en dakstoel. Correcte geometrie, schoren en verbindingen garanderen een veilig en duurzaam dak.',
        benefits: ['Snelle montage met prefab dakspanten', 'Nauwkeurige geometrie en betrouwbare draagkracht', 'Gelijk niveau over de volledige dakstructuur', 'Stevige verbindingen, schoren en kwaliteitsbevestigingen', 'Klaar basis voor isolatie, folies en dakbedekking', 'Afgestemd op berekeningen en ontwerp', 'Gecertificeerd en ervaren installatieteam', 'Nauwkeurige werkdocumentatie en kwaliteitscontrole', 'Duidelijke offerte en planning vooraf'],
        process: ['Opmeting, overspanning en belastingsevaluatie', 'Afstemming van constructieoplossing en leverplan van spanten of hout', 'Muurplaatmontage, waterdichting en verankering aan dragende wanden', 'Montage van dakspanten of sporen ter plaatse', 'Dakstoel montage, trekbanden en verbindingen fixeren', 'Schoren, windverbanden, diagonalen en constructieverbindingen plaatsen', 'Controle van noklijn, hellingen en geometrie', 'Panlat en tengellat voorbereiding', 'Kwaliteitscontrole van bevestigingen en knooppunten', 'Voorbereiding voor dakbedekking en ventilatie', 'Eindinspectie en oplevering met dakbedekking montage'],
        qualityPoints: ['10 jaar garantie op montagwerk', 'Naleving van bouwvoorschriften en veiligheidsprotocollen', 'Nauwkeurige geometriecontrole met metingen', 'Kwalitatieve bevestigingsmaterialen en gecertificeerde materialen', 'Fotodocumentatie en oplevercontrole', 'Werkgarantie en verantwoordelijkheid voor resultaten', 'Materialen voldoen aan fabrikantspecificaties'],
        relatedServices: ['jumta-buvnieciba', 'valcprofila-montaza', 'dakstinu-montaza', 'jumta-logu-montaza']
      }
    },
    'jumta-apkope-remonts': {
      lv: {
        overview: 'Regulāra jumta apkope un savlaicīgs remonts pagarina jumta mūžu par 10-20 gadiem un novērš dārgus bojājumus. Mēs nodrošinām diagnostiku, tīrīšanu, bojājumu novēršanu un avārijas reaģēšanu.',
        benefits: ['Jumta kalpošanas laika pagarināšana par 10-20 gadiem', 'Noplūžu riska priekšlaicīga novēršana', 'Vizuālā izskata uzlabošana un sūnu noņemšana', 'Ātra avārijas reaģēšana (1-2 stundas)', 'Preventīvā diagnostika ar dronu'],
        process: ['Jumta stāvokļa vizuālā un tehniskā apsekošana ar drona diagnostiku', 'Noteku sistēmas, renu un satekņu tīrīšana ar augstspiediena iekārtu', 'Jumta seguma bojājumu identificēšana un dokumentācija', 'Sūnu, ķērpju un melno traipu noņemšana ar ekoloģiskām metodēm', 'Bojāto seguma elementu lokāls remonts vai nomaiņa', 'Skursteņu pieslēgumu un hermētisko savienojumu pārbaude un atjaunošana', 'Jumta ventilācijas izvadu un caurlaižu hermētiskuma pārbaude', 'Noteku sistēmas savienojumu un stiprinājumu pārbaude un remonts', 'Jumta drošības elementu (sniega barjeru, laipu) stāvokļa pārbaude', 'Aizsargpārklājumu un krāsas slāņa atjaunošana (ja nepieciešams)', 'Vēja kastu un apdares elementu stāvokļa pārbaude un remonts', 'Apkopes darbu dokumentācija, fotofiksācija un ieteikumi nākamajiem darbiem'],
        qualityPoints: ['2 gadu garantija uz remontdarbu', '24/7 avārijas reaģēšanas serviss', 'Speciālistiem ir darba drošības apdrošināšana', 'Drona diagnostika ar vizuālajiem pierakstiem'],
        relatedServices: ['jumta-buvnieciba', 'jumta-krasosana', 'noteksistemu-uzstadisana', 'valcprofila-montaza']
      },
      en: {
        overview: 'Regular roof maintenance and timely repair extends roof lifespan by 10-20 years and prevents costly damage. We provide diagnostics, cleaning, repair and emergency response.',
        benefits: ['Extending roof life by 10-20 years', 'Early prevention of leak risks', 'Visual appearance improvement and moss removal', 'Fast emergency response (1-2 hours)', 'Preventive diagnostics with drone'],
        process: ['Roof condition visual and technical inspection with drone diagnostics', 'Gutter system, gutters and valleys cleaning with high-pressure equipment', 'Roof covering damage identification and documentation', 'Moss, lichen and black stain removal with ecological methods', 'Damaged covering elements local repair or replacement', 'Chimney connections and hermetic joints verification and restoration', 'Roof ventilation outlets and penetrations hermeticity check', 'Gutter system connections and fasteners verification and repair', 'Roof safety elements (snow guards, walkways) condition check', 'Protective coating and paint layer restoration (if required)', 'Wind box and trim elements condition check and repair', 'Maintenance work documentation, photo recording and recommendations for future work'],
        qualityPoints: ['2-year warranty on repair work', '24/7 emergency response service', 'Specialists have insurance for dangerous work', 'Drone diagnostics with visual records'],
        relatedServices: ['jumta-buvnieciba', 'jumta-krasosana', 'noteksistemu-uzstadisana', 'valcprofila-montaza']
      },
      'nl-BE': {
        overview: 'Regelmatig dakonderhoud en tijdige reparatie verlengt daklevensduur met 10-20 jaar en voorkomt kostbare schade. Wij bieden diagnose, reiniging, reparatie en noodrespons.',
        benefits: ['Verlenging dakleven met 10-20 jaar', 'Vroege lekkagrisicopreventie', 'Visuele uitstraling verbetering en mosverwijdering', 'Snelle noodrespons (1-2 uur)', 'Preventieve diagnostiek met drone'],
        process: ['Daktoestand visuele en technische inspectie met drone diagnostiek', 'Gootsysteem, goten en kilgoten reiniging met hogedrukapparatuur', 'Dakbedekking schade identificatie en documentatie', 'Mos, korstmos en zwarte vlekken verwijdering met ecologische methoden', 'Beschadigde bedekking elementen lokale reparatie of vervanging', 'Schoorsteen verbindingen en hermetische voegen verificatie en herstel', 'Dak ventilatie-uitgangen en penetraties hermeticiteit controle', 'Gootsysteem verbindingen en bevestigingen verificatie en reparatie', 'Dak veiligheidselementen (sneeuwvangers, loopplanken) toestand controle', 'Beschermende coating en verflaag herstel (indien vereist)', 'Windveer en afwerkelementen toestand controle en reparatie', 'Onderhoudswerk documentatie, foto-opname en aanbevelingen voor toekomstig werk'],
        qualityPoints: ['2 jaar garantie op reparatiewerk', '24/7 noodrespons service', 'Specialisten hebben verzekering voor gevaarlijk werk', 'Drone diagnostiek met visuele records'],
        relatedServices: ['jumta-buvnieciba', 'jumta-krasosana', 'noteksistemu-uzstadisana', 'valcprofila-montaza']
      }
    },
    'noteksistemu-uzstadisana': {
      lv: {
        overview: 'Noteku montāža un noteksistēmu uzstādīšana – nodrošinām efektīvu ūdens novadīšanu no jumta un fasādes, aizsargājot bāzi un apkārtni. Profesionāla noteku montāža Rīgā ar kvalitātīvām metāla notekām un garantiju pret rūsēšanu.',
        benefits: ['Efektīva ūdens novadīšana no fasādes un bāzes', 'Plaša krāsu un materiālu izvēle', 'Izturība pret sniega un ledu slodzi', 'Garantija pret rūsēšanu un lūšanu vēl 25 gadus', 'Skaņas adsorbcija ar speciālu izolāciju'],
        process: ['Jumta karnīzes precīza mērīšana un CAD plāna izstrāde', 'Noteku sistēmas komponentu izvēle un materiālu sagatavošana', 'Noteku turētāju (kronšteinu) montāža ar pareizu krituma leņķi (3-5mm/m)', 'Metālisko renu precīza ieklāšana, savienošana ar hermētiskām blīvēm', 'Stūra elementu un pagriezienu montāža ar precīzu pielāgošanu', 'Ūdens piltuvju un savienojumu ar notekcaurulēm uzstādīšana', 'Notekcauruļu kronšteinu fiksācija uz fasādes ar optimāliem intervāliem', 'Notekcauruļu montāža ar līkumiem un pagarinājumiem', 'Ūdens aizplūdes sistēmas pieslēgums (lietusūdens drenāža vai kanalizācija)', 'Skaņas izolācijas materiālu uzstādīšana (ja nepieciešams)', 'Noteku sistēmas aizsardzības režģu un sietu montāža', 'Ūdens novadīšanas funkcionalitātes pārbaude ar ūdens testa metodi'],
        qualityPoints: ['10 gadu garantija uz montāžas darbu', '25 gadu antikorozijas garantija uz materiālu', 'Speciālistiem ir sertifikāti noteku montāžai', 'CAD dizains katram objektam'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'jumta-renovacija', 'valcprofila-montaza']
      },
      en: {
        overview: 'Gutter systems ensure effective water drainage from roof and facade, protecting the facade, foundation and surroundings. We install quality metal gutters with guarantee against rust.',
        benefits: ['Effective water drainage from facade and foundation', 'Wide choice of colors and materials', 'Resistance to snow and ice load', 'Guarantee against rust and cracking for 25 years', 'Sound absorption with special insulation'],
        process: ['Roof eaves precise measurement and CAD plan development', 'Gutter system components selection and materials preparation', 'Gutter brackets (hangers) installation with correct slope angle (3-5mm/m)', 'Metal gutters precise laying, connection with hermetic seals', 'Corner elements and turns installation with precise fitting', 'Water outlets and connections with downspouts installation', 'Downspout brackets fixation on facade with optimal intervals', 'Downspouts installation with elbows and extensions', 'Water drainage system connection (rainwater drainage or sewage)', 'Sound insulation materials installation (if required)', 'Gutter system protection grids and screens installation', 'Water drainage functionality verification with water test method'],
        qualityPoints: ['10-year warranty on installation work', '25-year anti-corrosion warranty on materials', 'Specialists are certified for gutter installation', 'CAD design for each project'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'jumta-renovacija', 'valcprofila-montaza']
      },
      'nl-BE': {
        overview: 'Gootsystemen zorgen voor effectieve waterafvoer van dak en gevel en beschermen de gevel, fundering en omgeving. We installeren kwaliteitsmetalen goten met garantie tegen roesten.',
        benefits: ['Effectieve waterafvoer van gevel en fundering', 'Ruime keuze aan kleuren en materialen', 'Weerstand tegen sneeuw- en ijsbelasting', 'Garantie tegen roesten en splintering voor 25 jaar', 'Geluidabsorptie met speciale isolatie'],
        process: ['Dakrand nauwkeurige meting en CAD planontwikkeling', 'Gootsysteem componenten selectie en materialen voorbereiding', 'Gootbeugels installatie met juiste hellingshoek (3-5mm/m)', 'Metalen goten nauwkeurig leggen, verbinding met hermetische afdichtingen', 'Hoek elementen en bochten installatie met nauwkeurige passing', 'Wateruitlopen en verbindingen met regenpijpen installatie', 'Regenpijp beugels fixatie op gevel met optimale intervallen', 'Regenpijpen installatie met bochten en verlengstukken', 'Waterafvoersysteem aansluiting (regenwater drainage of riolering)', 'Geluidsisolatiematerialen installatie (indien vereist)', 'Gootsysteem bescherming roosters en filters installatie', 'Waterafvoer functionaliteit verificatie met watertestmethode'],
        qualityPoints: ['10 jaar garantie op installatie', '25 jaar anti-corrosie garantie op materialen', 'Specialisten zijn gecertificeerd voor gootinstallatie', 'CAD ontwerp voor elk project'],
        relatedServices: ['jumta-buvnieciba', 'jumta-apkope-remonts', 'jumta-renovacija', 'valcprofila-montaza']
      }
    },
    'jumta-remonts': {
      lv: {
        overview: 'Ātra jumta avārijas reaģēšana 24/7 Rīgā un Pierīgā. Jumts tek vai noplūst? Mēs novērsam noplūdes, veicam lokālus remontus un diagnozes. Sertificēti meistari, 2 gadu garantija uz remontdarbu.',
        benefits: ['Ātra 24/7 avārijas reaģēšana (1-2 stundas)', 'Diagnoze ar dronu un vizuālo ziņojumu', 'Lokāls remonts bez pilnīgas demontāžas', 'Garantija uz remontdarbu un materiāliem', 'Bezmaksas novērtējums Rīgā un Pierīgā'],
        process: ['Tūlīta jautājumi un pieņemšana', 'Lokācijas apskate un noplūdes diagnostika', 'Novārtējuma sagatavošana un tāmes sniegšana', 'Operatīvs remonts vai noplūdes likvidēšana', 'Hermētiskuma pārbaude ar ūdens testu', 'Dokumentācija un garantijas nodrošināšana'],
        qualityPoints: ['24/7 avārijas reaģēšana pieņemšana', '2 gadu garantija uz remontdarbu', 'Speciālistiem ir darba drošības apdrošināšana', 'Drona diagnostika ar ziņojumiem'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-krasosana', 'valcprofila-montaza', 'jumta-renovacija']
      },
      en: {
        overview: 'Fast emergency roof repair 24/7 in Riga and Pieriga. Roof leaking? We stop leaks, perform local repairs and diagnostics. Certified specialists, 2-year warranty on repair work.',
        benefits: ['Fast 24/7 emergency response (1-2 hours)', 'Drone diagnostics with visual report', 'Local repair without full demolition', 'Warranty on repair work and materials', 'Free assessment in Riga and Pieriga'],
        process: ['Immediate inquiry and site visit scheduling', 'On-site inspection and leak diagnostics', 'Estimate preparation and quote submission', 'Prompt repair or leak elimination', 'Hermeticity verification with water test', 'Documentation and warranty provision'],
        qualityPoints: ['24/7 emergency response availability', '2-year warranty on repair work', 'Specialists have work safety insurance', 'Drone diagnostics with visual reports'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-krasosana', 'valcprofila-montaza', 'jumta-renovacija']
      },
      'nl-BE': {
        overview: 'Snelle daklek noodreparatie 24/7 in België. Dak lekt? Wij stoppen lekken, voeren lokale reparaties en diagnose uit. Gecertificeerde vakmensen, 2 jaar garantie op reparatiewerk.',
        benefits: ['Snelle 24/7 noodrespons (1-2 uur)', 'Drone diagnose met visueel rapport', 'Lokale reparatie zonder volledige sloop', 'Garantie op reparatiewerk en materialen', 'Gratis beoordeling in heel België'],
        process: ['Onmiddellijke informatie en bezoekplanning', 'Ter plaatse inspectie en lekdiagnose', 'Estimaatvoorbereiding en offerteindeling', 'Snelle reparatie of lekbestrijding', 'Hermeticiteit verificatie met watertest', 'Documentatie en garantieregeling'],
        qualityPoints: ['24/7 noodreparatie beschikbaarheid', '2 jaar garantie op reparatiewerk', 'Specialisten hebben werkverzekerking', 'Drone diagnose met visuele rapporten'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-krasosana', 'valcprofila-montaza', 'jumta-renovacija']
      }
    },
    'jumta-krasosana': {
      lv: {
        overview: 'Jumta krāsošana ir ekonomiska alternatīva jumta nomaiņai, kas pagarina jumta mūžu par 10-15 gadiem, uzlabo izskatu un aizsargā pret koroziju. Mēs krāsojam metāla jumtus, šīferi un betona paneļus.',
        benefits: ['Jumta mūža pagarināšana par 10-15 gadiem', 'Ekonomiska alternatīva nomaiņai (7-10 reizes lētāk)', 'Aizsardzība pret koroziju un sūnām', 'Jumta izskata uzlabošana', 'Īpašuma vērtības pacelšana'],
        process: ['Jumta virsmas stāvokļa izpēte un bojājumu novērtēšana', 'Sūnu, ķērpju un netīrumu mehāniska noņemšana', 'Augstspiediena mazgāšana ar speciālu iekārtu (500+ bar)', 'Jumta virsmas žāvēšana un sagatavošana krāsošanai', 'Rūsas apstrāde ar ķīmiskiem pārveidotājiem (rūsas konvertors)', 'Pirmās grunts kārtas uzklāšana ar pretkorozijas sastāvu', 'Otrās grunts kārtas uzklāšana pēc žūšanas laika', 'Pirmās krāsas kārtas uzklāšana ar atlasītu toņa krāsu', 'Otrās krāsas kārtas uzklāšana pilnai pārklājumam', 'Detaļu precizēšana, stūru un grūti aizsniedzamo vietu apdare', 'Skrāpju un bojājumu vietu papildus apstrāde', 'Kvalitātes kontrole, pārbaude un jumta virmas tīrīšana no krāsas pilieniem'],
        qualityPoints: ['3 gadu garantija uz krāsu', '10 gadu garantija uz pretkorozijas apstrādi', 'Profesionāli instrumenti un ekvivalentas krāsas', 'Rūsas pārveidotājs garantija'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-buvnieciba', 'jumta-renovacija', 'noteksistemu-uzstadisana']
      },
      en: {
        overview: 'Roof painting is an economical alternative to roof replacement, extending roof life by 10-15 years, improving appearance and protecting against corrosion. We paint metal roofs, slate and concrete panels.',
        benefits: ['Extending roof life by 10-15 years', 'Economical alternative to replacement (3-4 times cheaper)', 'Protection against corrosion and moss', 'Choice of any Pantone color', 'Improved appearance and modern look'],
        process: ['Roof surface condition investigation and damage assessment', 'Moss, lichen and dirt mechanical removal', 'High-pressure washing with specialized equipment (500+ bar)', 'Roof surface drying and preparation for painting', 'Rust treatment with chemical converters (rust converter)', 'First primer coat application with anti-corrosion composition', 'Second primer coat application after drying time', 'First paint coat application with selected color tone', 'Second paint coat application for full coverage', 'Details refinement, corners and hard-to-reach areas finishing', 'Scratches and damaged areas additional treatment', 'Quality control, inspection and roof surface cleaning from paint drops'],
        qualityPoints: ['3-year warranty on paint', '10-year warranty on anti-corrosion treatment', 'Professional tools and equivalent paints', 'Rust converter warranty'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-buvnieciba', 'jumta-renovacija', 'noteksistemu-uzstadisana']
      },
      'nl-BE': {
        overview: 'Dakschilderen is een economisch alternatief voor dakvervanging dat de daklevensduur met 10-15 jaar verlengt, het uiterlijk verbetert en bescherming biedt tegen corrosie. We schilderen metalen daken, leisteen en betonnen panelen.',
        benefits: ['Verlenging dakleven met 10-15 jaar', 'Economisch alternatief voor vervanging (3-4 keer goedkoper)', 'Bescherming tegen corrosie en mos', 'Keuze uit elke Pantone kleur', 'Verbeterde uitstraling en modern uiterlijk'],
        process: ['Dakoppervlak toestand onderzoek en schade beoordeling', 'Mos, korstmos en vuil mechanische verwijdering', 'Hogedrukreiniging met gespecialiseerde apparatuur (500+ bar)', 'Dakoppervlak droging en voorbereiding voor schilderen', 'Roestbehandeling met chemische omzetters (roestomzetter)', 'Eerste grondlaag aanbrenging met anti-corrosie samenstelling', 'Tweede grondlaag aanbrenging na droogtijd', 'Eerste verflaag aanbrenging met geselecteerde kleurtoon', 'Tweede verflaag aanbrenging voor volledige dekking', 'Details verfijning, hoeken en moeilijk bereikbare gebieden afwerking', 'Krassen en beschadigde gebieden extra behandeling', 'Kwaliteitscontrole, inspectie en dakoppervlak reiniging van verfdruppels'],
        qualityPoints: ['3 jaar garantie op verf', '10 jaar garantie op anti-corrosie behandeling', 'Professionele gereedschappen en gelijkwaardige verven', 'Roest omzetter garantie'],
        relatedServices: ['jumta-apkope-remonts', 'jumta-buvnieciba', 'jumta-renovacija', 'noteksistemu-uzstadisana']
      }
    },
    'saules-dakstini': {
      lv: {
        overview: 'Saules jumta dakstiņi ir pilnībā integrēti fotovoltaiskie elementi, kas aizstāj tradicionālo segumu un ražo elektrību. Estētisks risinājums bez redzamiem paneļu rāmjiem, pielāgots Latvijas klimatam.',
        benefits: ['Estētiska integrācija bez redzamiem paneļiem', 'Elektrības ražošana un zemāki rēķini', 'Hermētiska un droša konstrukcija', 'Saderība ar siltumsūkņiem un EV uzlādi', 'Garantēta veiktspēja un izturība pret vēju/sniegu'],
        process: ['Aptuvenā jaudas un atdeves aprēķins', 'Konstrukcijas nestspējas izvērtēšana', 'Elektroprojekts un drošības risinājumi', 'Dakstiņu/elementu montāža ar hidroizolāciju', 'Invertora un drošības iekārtu uzstādīšana', 'Ieslēgšana tīklā un monitorings'],
        qualityPoints: ['10 gadu garantija uz montāžu', '25 gadu ražotāja veiktspējas garantija (tipiski)', 'Atbilstība ES un Latvijas elektrostandartiem', 'Pilns dokumentu un monitoringa nodrošinājums'],
        relatedServices: ['jumta-buvnieciba', 'jumta-renovacija', 'noteksistemu-uzstadisana', 'jumta-logu-montaza']
      },
      en: {
        overview: 'Solar roof tiles are fully integrated photovoltaic elements that replace traditional covering and generate electricity. A premium, seamless look without visible panel frames, optimized for Baltic climate.',
        benefits: ['Seamless aesthetic integration', 'Power generation and lower bills', 'Weatherproof and safe installation', 'Compatible with heat pumps and EV charging', 'Guaranteed performance and wind/snow resistance'],
        process: ['Preliminary yield and sizing estimate', 'Structural load assessment', 'Electrical design and safety planning', 'Tile/module installation with waterproofing', 'Inverter and safety equipment setup', 'Grid connection and monitoring'],
        qualityPoints: ['10-year workmanship warranty', '25-year manufacturer performance warranty (typical)', 'Compliance with EU and local electrical codes', 'Complete documentation and monitoring'],
        relatedServices: ['jumta-buvnieciba', 'jumta-renovacija', 'noteksistemu-uzstadisana', 'jumta-logu-montaza']
      },
      'nl-BE': {
        overview: 'Zonnedakpannen zijn volledig geïntegreerde PV-elementen die traditionele bedekking vervangen en elektriciteit opwekken. Premium naadloze look zonder zichtbare panelen, geoptimaliseerd voor het lokale klimaat.',
        benefits: ['Naadloze esthetische integratie', 'Stroomopwekking en lagere kosten', 'Weerbestendige en veilige installatie', 'Compatibel met warmtepompen en EV-laden', 'Gegarandeerde prestaties en wind/sneeuwbestendigheid'],
        process: ['Voorlopige opbrengst- en maatinschatting', 'Structurele belastingsevaluatie', 'Elektrisch ontwerp en veiligheidsplan', 'Pannen/module installatie met waterdichting', 'Omvormer en veiligheidscomponenten', 'Netkoppeling en monitoring'],
        qualityPoints: ['10 jaar garantie op montage', '25 jaar fabrieks prestatiegarantie (typisch)', 'Naleving EU en lokale elektrocodes', 'Volledige documentatie en monitoring'],
        relatedServices: ['jumta-buvnieciba', 'jumta-renovacija', 'noteksistemu-uzstadisana', 'jumta-logu-montaza']
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
        {q: 'Kāda ir valcprofila garantija?', a: '10 gadu garantija uz montāžas darbu un 50 gadu ražotāja garantija uz materiālu, iekļaujot krāsas noturību un metāla integritāti.'},
        {q: 'Vai metāla jumti ir skaļi?', a: 'Metāla jumti ir skaļāki salīdzinot ar citiem jumta segumiem, tomēr tas vairāk ir mīts nekā patiesība. Metāla jumtus var padarīt klusus iestrādājot skaņas slāpējošu kārtu. Ja jumts ir mansarda stāvā, siltinājums un vēdināšanas kanāls rada gaisa un siltinājuma barjeras. Ja jumts ir bez siltinājuma, aukstie bēniņi nodrošina pietiekamu attālumu. Lielākā daļa cilvēku apliecina, ka skaņa ikdienā nav traucējoša, dažkārt pat patīkama un nomierinoša.'}
      ],
      en: [
        {q: 'Why choose standing seam?', a: 'Standing seam provides maximum hermeticity thanks to double-locks, longevity (50+ years) and modern appearance without visible screw holes.'},
        {q: 'Can standing seam be installed in winter?', a: 'Yes, standing seam can be installed year-round, but optimal conditions are temperatures above -10°C with minimal precipitation risk.'},
        {q: 'What is standing seam warranty?', a: '10-year warranty on installation work and 50-year manufacturer warranty on material, including paint durability and metal integrity.'},
        {q: 'Are metal roofs noisy?', a: 'Metal roofs are louder compared to other roofing materials, but this is more myth than reality. Metal roofs can be made quiet by incorporating sound-dampening layers. If the roof is on an attic floor, insulation and ventilation create air and insulation barriers. If the roof has no insulation, the cold attic provides sufficient distance. Most people confirm that sound is not bothersome in daily life, and sometimes even pleasant and calming.'}
      ],
      'nl-BE': [
        {q: 'Waarom kiezen voor staande naad?', a: 'Staande naad biedt maximale hermeticiteit dankzij dubbele sluitingen, duurzaamheid (50+ jaar) en modern uiterlijk zonder zichtbare schroefgaten.'},
        {q: 'Kan staande naad in winter geïnstalleerd worden?', a: 'Ja, staande naad kan het hele jaar door geïnstalleerd worden, maar optimale omstandigheden zijn temperaturen boven -10°C met minimaal neerslag risico.'},
        {q: 'Wat is de garantie op staande naad?', a: '10 jaar garantie op installatiewerk en 50 jaar fabrieksgarantie op materiaal, inclusief verfbaarheid en metaalintegriteit.'},
        {q: 'Zijn metalen daken luidruchtig?', a: 'Metalen daken zijn luider vergeleken met andere dakbedekkingsmaterialen, maar dit is meer mythe dan waarheid. Metalen daken kunnen stil gemaakt worden door geluiddempende lagen te verwerken. Als het dak op een zolderverdieping ligt, creëren isolatie en ventilatie lucht- en isolatiebarrières. Als het dak geen isolatie heeft, zorgt de koude zolder voor voldoende afstand. De meeste mensen bevestigen dat geluid niet storend is in het dagelijks leven, en soms zelfs aangenaam en kalmerend.'}
      ]
    },
    'dakstinu-montaza': {
      lv: [
        {q: 'Vai mans jumts izturēs dakstiņu svaru?', a: 'Mēs vienmēr veicam konstrukcijas nestspējas aprēķinu. Ja nepieciešams, veicam spāru pastiprināšanu pirms montāžas.'},
        {q: 'Kāda ir atšķirība starp māla un betona dakstiņiem?', a: 'Māla dakstiņi ir dabīgāki un ilgmūžīgāki (līdz 100 gadiem), bet betona dakstiņi ir ekonomiskāki un precīzāki izmēros.'},
        {q: 'Cik ilgi kalpo dakstiņu jumts?', a: 'Pareizi uzklāts dakstiņu jumts kalpo 50-100 gadus, padarot to par vienu no izdevīgākajiem ieguldījumiem ilgtermiņā.'},
        {q: 'Kāpēc dienvidu siltajās zemēs biežāk izmanto māla dakstiņu jumtus?', a: 'Māla dakstiņu popularitāte Dienvideiropā ir saistīta ar vēsturiskiem un materiāla īpašību faktoriem. Māla dakstiņi ir pieejams lokāli iegūstams resurs, ko dienvidnieki izmanto gadsimtiem ilgi. Tie ir labs glābiņš no karstās dienvidu saules, jo neuzkarst un vasarās vieglāk nodrošina atveldzinošu vēsumu telpās. Zemēs kā Spānija un Itālija ziemas ir mērenas bez straujām temperatūras svārstībām, līdz ar to dakstiņu segums kalpo ilgāk un nekļūst trausls tik ātri kā ziemeļu klimatā.'}
      ],
      en: [
        {q: 'Will my roof support tile weight?', a: 'We always calculate structural load capacity. If necessary, we reinforce rafters before installation.'},
        {q: 'Difference between clay and concrete tiles?', a: 'Clay tiles are more natural and longer-lasting (up to 100 years), while concrete tiles are more economical and precise in dimensions.'},
        {q: 'How long does a tile roof last?', a: 'A properly installed tile roof lasts 50-100 years, making it one of the best long-term investments.'},
        {q: 'Why are clay tile roofs more common in warm southern regions?', a: 'Clay tile popularity in Southern Europe is related to both historical and material property factors. Clay tiles are a locally available resource that southerners have used for centuries. They are excellent protection from hot southern sun as they do not overheat and more easily provide refreshing coolness indoors in summer. In countries like Spain and Italy, winters are mild without extreme temperature fluctuations, so tile roofing lasts longer and does not become brittle as quickly as in northern climates.'}
      ],
      'nl-BE': [
        {q: 'Zal mijn dak het pannengewicht dragen?', a: 'Wij berekenen altijd de draagkracht. Indien nodig versterken we de spanten voor installatie.'},
        {q: 'Verschil tussen klei en betonnen pannen?', a: 'Kleipannen zijn natuurlijker en gaan langer mee (tot 100 jaar), terwijl betonnen pannen economischer en maatvaster zijn.'},
        {q: 'Hoe lang gaat een pannendak mee?', a: 'Een correct geïnstalleerd pannendak gaat 50-100 jaar mee, wat het een van de beste langetermijninvesteringen maakt.'},
        {q: 'Waarom zijn kleipannen daken gebruikelijker in warme zuidelijke regio\'s?', a: 'De populariteit van kleipannen in Zuid-Europa is gerelateerd aan zowel historische als materiaaleigenschappen. Kleipannen zijn een lokaal beschikbare grondstof die zuiderlingen al eeuwenlang gebruiken. Ze zijn uitstekende bescherming tegen de hete zuidelijke zon omdat ze niet oververhitten en gemakkelijker verfrissende koelte binnenshuis bieden in de zomer. In landen als Spanje en Italië zijn de winters mild zonder extreme temperatuurschommelingen, dus gaat de pannendekking langer mee en wordt niet zo snel bros als in noordelijke klimaten.'}
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
    'jumta-konstrukciju-montaza': {
      lv: [
        {q: 'Vai montējat gan gatavas kopnes, gan spāres uz vietas?', a: 'Jā, strādājam ar gatavām jumta kopnēm un veicam arī jumta spāru montāžu uz vietas atbilstoši projektam.'},
        {q: 'Kas ietilpst mūrlatas montāžā?', a: 'Mūrlatas montāža ietver precīzu līmeņošanu, enkurošanu pie nesošajām sienām un mezglu sagatavošanu spāru vai kopņu pieslēgumiem.'},
        {q: 'Cik ātri iespējama jumta konstrukciju montāža?', a: 'Termiņš atkarīgs no objekta lieluma un konstrukcijas sarežģītības, bet gatavo kopņu uzstādīšana parasti ir ļoti ātra.'}
      ],
      en: [
        {q: 'Do you install both prefabricated trusses and on-site rafters?', a: 'Yes, we install prefabricated roof trusses and also perform on-site rafter installation according to the design.'},
        {q: 'What is included in wall plate installation?', a: 'Wall plate installation includes precise leveling, anchoring to load-bearing walls, and preparation of joints for rafter or truss connections.'},
        {q: 'How fast can roof structure installation be done?', a: 'Timing depends on size and complexity, but prefabricated truss installation is usually very fast.'}
      ],
      'nl-BE': [
        {q: 'Monteren jullie zowel prefab spanten als sporen ter plaatse?', a: 'Ja, we plaatsen prefab dakspanten en voeren ook sporenmontage ter plaatse uit volgens het ontwerp.'},
        {q: 'Wat is inbegrepen bij muurplaatmontage?', a: 'Muurplaatmontage omvat nauwkeurig uitlijnen, verankeren aan dragende wanden en het voorbereiden van verbindingen voor spanten of sporen.'},
        {q: 'Hoe snel kan dakconstructie montage gebeuren?', a: 'De timing hangt af van grootte en complexiteit, maar prefab spanten zijn meestal snel te monteren.'}
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

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale, slug} = await params;
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
  const descriptionBase = entry?.description[locale] || entry?.description.lv || 'Profesionāli jumta pakalpojumi Rīgā, Pierīgā un visā Latvijā ar garantiju.';
  const coverageLine = locale === 'nl-BE'
    ? 'Serviss Kortrijkā, Gentē, Bruggē, Roeselārē un citās Beļģijas pilsētās.'
    : locale === 'en'
    ? 'Service across Riga, Jūrmala, Jelgava, Ogre, Salaspils, Ķekava, Pierīga and other Latvian cities.'
    : 'Serviss Rīgā, Jūrmalā, Jelgavā, Ogrē, Salaspilī, Ķekavā, Pierīgā un citās Latvijas pilsētās.';
  const description = `${descriptionBase} ${coverageLine}`.trim();
  
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

export default async function ServiceLanding({params}: PageProps) {
  const {locale, slug} = await params;
  unstable_setRequestLocale(locale);
  const meta = META[slug];
  const title = meta?.title[locale] || meta?.title.lv || 'Jumta pakalpojums';
  const baseTitle = title.split('|')[0]?.trim() || 'Jumta pakalpojums';
  const uiTitle = baseTitle
    .replace(/\s+Rīgā$/i, '')
    .replace(/\s+in Riga$/i, '')
    .replace(/\s+in Belgium$/i, '')
    .replace(/\s+in België$/i, '')
    .replace(/\s+Beļģijā$/i, '')
    .trim();
  const h1 = uiTitle || baseTitle;
  const description = meta?.description[locale] || meta?.description.lv;

  // Benefit section heading per locale
  const benefitHeading = locale === 'nl-BE' 
    ? 'Waarom kiezen voor UpRoof?' 
    : locale === 'en' 
    ? 'Why Choose UpRoof?' 
    : 'Kāpēc izvēlēties UpRoof?';

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
    ? 'We provide roofing services throughout Latvia with primary focus on the Riga and Pierīga region:'
    : 'Mēs sniedzam jumta pakalpojumus visā Latvijā ar galveno fokusu uz Rīgu un Pierīgas reģionu:';

  const cityFooter = locale === 'nl-BE'
    ? 'Snelle reactie in Kortrijk, Gent, Brugge, Roeselare en omliggende steden (1-2 werkdagen). Gratis offerte in alle servicegebieden.'
    : locale === 'en'
    ? 'Fast response across Riga, Jūrmala, Jelgava, Ogre, Salaspils, Ķekava and Pierīga (1-2 business days). Free assessment in all service areas.'
    : 'Ātra reakcija Rīgā, Jūrmalā, Jelgavā, Ogrē, Salaspilī, Ķekavā un Pierīgā (1-2 darba dienas). Bezmaksas novērtējums visās apkalpojamās teritorijās.';

  // Service-specific detailed content
  const serviceContent = getServiceContent(slug, locale);

  const commonBenefits: Record<string, string[]> = {
    lv: ['Sertificēta un pieredzējusi brigāde', 'Precīza darbu dokumentācija un kontrole', 'Skaidra tāme un termiņi pirms darbu sākuma'],
    en: ['Certified and experienced team', 'Clear documentation and quality checks', 'Transparent estimate and timelines before start'],
    'nl-BE': ['Gecertificeerd en ervaren team', 'Duidelijke documentatie en kwaliteitscontrole', 'Transparante offerte en planning vooraf']
  };

  const commonProcess: Record<string, string[]> = {
    lv: ['Darbu uzraudzība un saskaņošana ar klientu', 'Gala pārbaude un nodošana ar ieteikumiem turpmākai ekspluatācijai'],
    en: ['Work supervision and alignment with the client', 'Final inspection and handover with maintenance recommendations'],
    'nl-BE': ['Werfopvolging en afstemming met de klant', 'Eindcontrole en oplevering met onderhoudsadvies']
  };

  const commonQualityPoints: Record<string, string[]> = {
    lv: ['Garantija uz darbiem un atbildība par rezultātu', 'Drošības protokoli un apdrošināšana', 'Materiālu atbilstība ražotāju specifikācijām'],
    en: ['Warranty on workmanship and accountability', 'Safety protocols and insurance', 'Materials compliant with manufacturer specifications'],
    'nl-BE': ['Garantie op vakmanschap en verantwoordelijkheid', 'Veiligheidsprotocollen en verzekering', 'Materialen volgens fabrikantenspecificaties']
  };

  const mergedBenefits = Array.from(new Set([...(serviceContent.benefits || []), ...(commonBenefits[locale] || commonBenefits.lv)]));
  const mergedProcess = Array.from(new Set([...(serviceContent.process || []), ...(commonProcess[locale] || commonProcess.lv)]));
  const mergedQualityPoints = Array.from(new Set([...(serviceContent.qualityPoints || []), ...(commonQualityPoints[locale] || commonQualityPoints.lv)]));

  // FAQ pairs per service type
  const faqs = getServiceFAQs(slug, locale);

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `https://uproof.eu/${locale}/services/${slug}#service`,
    name: baseTitle,
    serviceType: baseTitle,
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

  // Hero background image mapping per service
  const heroImages: Record<string, string> = {
    'jumta-renovacija': '/images/services/construction.webp',
    'valcprofila-montaza': '/images/services/metalprofile.webp',
    'dakstinu-montaza': '/images/services/tiledroofs.webp',
    'jumta-buvnieciba': '/images/services/construction.webp',
    'jumta-konstrukciju-montaza': '/images/services/roof-structure.webp',
    'jumta-apkope-remonts': '/images/services/maintenance.webp',
    'noteksistemu-uzstadisana': '/images/services/guttersystem.webp',
    'jumta-remonts': '/images/services/maintenance.webp',
    'jumta-krasosana': '/images/services/Painting.webp',
    'jumta-logu-montaza': '/images/services/skylights.webp',
    'saules-dakstini': '/images/services/tiledroofs.webp',
  };
  const heroImage = heroImages[slug] || '/images/services/construction.webp';

  return (
    <main className="min-h-screen">
      <Header />
      <Breadcrumbs />
      
      {/* HERO SECTION - Bold design matching homepage style */}
      <section className="relative bg-gray-900 text-white overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-gray-900 to-gray-900" />
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url('${heroImage}')` }} />
        
        {/* Blur circular effects on sides */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-primary-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-48 h-48 bg-primary-400/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 md:py-40">
          <div className="max-w-4xl">
            <p className="text-primary-400 font-semibold uppercase tracking-wider text-sm mb-4">
              {locale === 'nl-BE' ? 'Dakdienst' : locale === 'en' ? 'Roofing Service' : 'Jumta pakalpojums'}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">{h1}</h1>
            {serviceContent.overview && (
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-3xl">{serviceContent.overview}</p>
            )}
          </div>
        </div>
        
        {/* Bottom fade transition - smooth linear gradient matching page background */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[90px]" 
          style={{ 
            background: 'linear-gradient(to top, rgb(255,255,255) 0%, rgba(255,255,255,0.97) 8%, rgba(255,255,255,0.92) 16%, rgba(255,255,255,0.82) 28%, rgba(255,255,255,0.68) 42%, rgba(255,255,255,0.5) 55%, rgba(255,255,255,0.32) 68%, rgba(255,255,255,0.18) 78%, rgba(255,255,255,0.08) 88%, rgba(255,255,255,0) 100%)' 
          }} 
        />
      </section>

      {/* SERVICE AREAS */}
      <Section className="bg-white" pad="md">
          {/* SERVICE AREAS - Refined card design */}
          <div className="mb-12">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-900 text-white px-6 py-4">
                <h2 className="text-xl font-bold">{cityHeading}</h2>
                <p className="text-gray-300 text-sm mt-1">{cityIntro}</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {cities.map((city) => (
                    <span 
                      key={city} 
                      className="px-3 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700"
                    >
                      {city}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-200">{cityFooter}</p>
              </div>
            </div>
          </div>

          {/* BENEFITS SECTION - Professional card grid */}
          {mergedBenefits.length > 0 && (
            <div className="mb-6" id="benefits">
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{benefitHeading}</h2>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {mergedBenefits.map((benefit, idx) => (
                  <div 
                    key={benefit} 
                    className="group flex items-start gap-4 p-5 bg-white border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary-100 text-primary-700 font-bold rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      {idx + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed pt-2">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

      </Section>

      {/* PROCESS SECTION - Full width background */}
      {mergedProcess.length > 0 && (
        <section className="py-8 md:py-10 bg-gray-50" id="process">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {locale === 'nl-BE' ? 'Ons werkproces' : locale === 'en' ? 'Our Work Process' : 'Mūsu darba process'}
                  </h2>
                  <div className="w-16 h-1 bg-primary-600 mx-auto" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mergedProcess.map((step, idx) => (
                    <div 
                      key={step} 
                      className="relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
                    >
                      <div className="absolute -top-4 left-6 bg-primary-600 text-white text-sm font-bold w-8 h-8 flex items-center justify-center rounded-lg shadow-md">
                        {idx + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed mt-2">{step}</p>
                    </div>
                  ))}
            </div>
          </div>
        </section>
      )}

      <Section className="bg-white" pad="md">
          {/* QUALITY GUARANTEE - Accent band */}
          {mergedQualityPoints.length > 0 && (
            <div className="mb-12" id="quality">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 sm:p-10 text-white">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6">
                  {locale === 'nl-BE' ? 'Kwaliteitsgarantie' : locale === 'en' ? 'Quality Guarantee' : 'Kvalitātes garantija'}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {mergedQualityPoints.map((point, idx) => (
                    <div key={point} className="flex items-start gap-3 bg-white/10 backdrop-blur rounded-lg p-4">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-white text-primary-600 text-sm font-bold rounded">
                        {idx + 1}
                      </span>
                      <span className="text-white/95 leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* M-I-E-R-S Method Integration */}
          <MiersMethod locale={locale} variant="compact" />

          {/* FAQ SECTION - Clean accordion style */}
          <div className="mb-12" id="faq">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {locale === 'nl-BE' ? 'Veelgestelde vragen' : locale === 'en' ? 'Frequently Asked Questions' : 'Biežāk uzdotie jautājumi'}
              </h2>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="space-y-4">
              {faqs.map((f, idx) => (
                <details 
                  key={f.q} 
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors"
                  open={idx === 0}
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                    <h3 className="font-semibold text-gray-900 pr-4">{f.q}</h3>
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg group-open:bg-primary-100 group-open:text-primary-600 transition-colors">
                      <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-5 pb-5 pt-0 text-gray-600 leading-relaxed border-t border-gray-100">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* CALL TO ACTION - Bold dark style */}
          <div className="bg-gray-900 text-white rounded-2xl p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="font-bold text-2xl sm:text-3xl mb-2">
                  {locale === 'nl-BE' 
                    ? 'Klaar om te starten?'
                    : locale === 'en'
                    ? 'Ready to get started?'
                    : 'Gatavs sākt?'}
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
      </Section>
      <InternalLinks locale={locale} currentSlug={slug} context="service" />
      <Footer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(serviceSchema)}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}} />
    </main>
  );
}
