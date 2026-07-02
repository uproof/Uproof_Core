import type { Locale } from '@/lib/cities';

export type CityContentSection = {
  title: string;
  body: string;
};

export type CityFaq = { q: string; a: string };

export type CityContent = {
  hero: {
    heading: string;
    subheading: string;
  };
  climate: CityContentSection;
  regulations: CityContentSection;
  recommendedSystems: string[];
  examples?: Array<{ title: string; summary: string }>;
  faqs: CityFaq[];
};

export const citiesContent: Record<string, Record<Locale, CityContent>> = {
  riga: {
    lv: {
      hero: {
        heading: 'Jumtu risinājumi Rīgā',
        subheading: 'Jumiķi Rīgā, Mārupē, Jūrmalā, Ādažos un Siguldā: jumta remonts Rīgā, jumta nomaiņa Rīgā, jumta montāža Rīgā, jumta atjaunošana un jumta darbi ar garantiju.'
      },
      climate: {
        title: 'Klimats',
        body: 'Rīgā tipiski ir mainīgi laikapstākļi ar intensīvām rudens lietusgāzēm un sniega slodzi ziemā. Tāpēc jumiķa pakalpojumi, jumta darbi, jumta renovācija un jumta remonts jāveic ar hermētiskām savienojumu sistēmām un kvalitatīvu hidroizolāciju.'
      },
      regulations: {
        title: 'Regulatīvās prasības',
        body: 'Būvnormatīvi nosaka drošības elementus uz jumtiem, ūdens novadīšanu un siltumizolācijas U-vērtības. Darbi tiek veikti saskaņā ar Latvijas būvnormatīviem, un mēs regulāri nodrošinām jumta montāžu, jumta nomaiņu un jumta atjaunošanu arī Mārupē, Jūrmalā, Ādažos un Siguldā.'
      },
      recommendedSystems: ['Valcprofila metāla jumts', 'Dakstiņu jumts', 'Kvalitatīva noteksistēma'],
      examples: [
        { title: 'Ventilēta kore', summary: 'Uzstādīta ventilēta kore metāla profila jumtam, bezskrūvju metode.' }
      ],
      faqs: [
        { q: 'Vai darbus var veikt ziemā?', a: 'Jā, veicam neatliekamus remontdarbus arī zemā temperatūrā ar atbilstošiem materiāliem.' },
        { q: 'Kā novērst kondensāciju?', a: 'Pareiza zemseguma ventilācija un hermētiski skārda savienojumi pie sienām un skursteņiem.' },
        { q: 'Vai strādājat arī Mārupē, Jūrmalā, Ādažos un Siguldā?', a: 'Jā, papildus Rīgai veicam jumta remontu, jumta nomaiņu, jumta montāžu un jumta darbus arī Mārupē, Jūrmalā, Ādažos un Siguldā.' }
      ]
    },
    en: {
      hero: { heading: 'Roofing in Riga', subheading: 'Construction, renovation, and maintenance across Riga and Pieriga' },
      climate: { title: 'Climate', body: 'Variable conditions with heavy autumn rains and winter snow loads. Use sealed connections and quality waterproofing.' },
      regulations: { title: 'Regulations', body: 'Latvian building code requires safety elements, proper drainage, and U-values for insulation.' },
      recommendedSystems: ['Standing seam metal', 'Tile roofs', 'Premium gutter systems'],
      faqs: [
        { q: 'Winter work?', a: 'Emergency repairs year-round with appropriate techniques and materials.' }
      ]
    },
    'nl-BE': {
      hero: { heading: 'Dakwerken in Riga', subheading: 'Bouw, renovatie en onderhoud in Riga' },
      climate: { title: 'Klimaat', body: 'Variabele omstandigheden; waterdichte aansluitingen en membranen aanbevolen.' },
      regulations: { title: 'Regels', body: 'Latvijnse bouwcode; correcte afwatering en isolatie-eisen.' },
      recommendedSystems: ['Staande naad metaal', 'Pannendaken'] ,
      faqs: []
    }
  },
  brussel: {
    'nl-BE': {
      hero: {
        heading: 'Dakwerken in Brussel',
        subheading: 'Professionele installatie en renovatie in Brussel en omgeving'
      },
      climate: {
        title: 'Klimaat',
        body: 'Zachte winters, frequente regen en stedelijke windkanalen. Aanbevolen zijn corrosiebestendige materialen en betrouwbare afwatering.'
      },
      regulations: {
        title: 'Regelgeving',
        body: 'Lokale normen vragen aandacht voor isolatie, afwatering en esthetiek in beschermde zones. We werken conform Belgische richtlijnen.'
      },
      recommendedSystems: ['Zinken staande naad', 'Pannendak', 'Kwalitatieve afvoersystemen'],
      examples: [
        { title: 'Zinken details', summary: 'Duurzame zinken aansluitingen rond ramen en schoorstenen.' }
      ],
      faqs: [
        { q: 'Werken bij regen?', a: 'We plannen kritische fasen op droge periodes en beschermen aansluitingen tegen vocht.' }
      ]
    },
    en: {
      hero: { heading: 'Roofing in Brussels', subheading: 'Professional installation and renovation in Brussels' },
      climate: { title: 'Climate', body: 'Mild winters and frequent rain; prefer corrosion-resistant materials and dependable drainage.' },
      regulations: { title: 'Regulations', body: 'Belgian standards for insulation, drainage, and protected area aesthetics.' },
      recommendedSystems: ['Zinc standing seam', 'Tiles'] ,
      faqs: []
    },
    lv: {
      hero: { heading: 'Darbi Briselē', subheading: 'Profesionāli risinājumi Beļģijā' },
      climate: { title: 'Klimats', body: 'Maigas ziemas, bieži nokrišņi; ieteicami izturīgi materiāli un droša novadīšana.' },
      regulations: { title: 'Prasības', body: 'Beļģijas regulējums par siltināšanu un noteksistēmām.' },
      recommendedSystems: ['Cinks', 'Dakstiņi'],
      faqs: []
    }
  }
};

export function getCityContent(slug: string, locale: Locale): CityContent | null {
  const city = citiesContent[slug];
  if (!city) return null;
  return city[locale] || city.en || null;
}
