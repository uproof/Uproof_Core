// Scaffold for keyword-to-URL mapping to prevent cannibalization.
// Extend with real search volume / priority flags as research progresses.

export type KeywordIntent =
  | 'core-service'
  | 'repair'
  | 'renovation'
  | 'installation'
  | 'material'
  | 'city'
  | 'cost'
  | 'urgency'
  | 'maintenance'
  | 'drainage'
  | 'skylight'
  | 'painting'
  | 'profile'
  | 'technical'
  | 'career'
  | 'snow-removal';

export interface KeywordMappingEntry {
  keyword: string; // Exact Latvian intent phrase (lowercase)
  intent: KeywordIntent;
  primaryUrl: string; // Single canonical landing page
  supportingUrls: string[]; // Secondary internal pages that reinforce topic
  notes?: string; // Differentiation / localization / future expansion pointers
}

export const keywordMapping: KeywordMappingEntry[] = [
  {
    keyword: 'jumiķa pakalpojumi',
    intent: 'core-service',
    primaryUrl: '/lv/services',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/services/jumta-renovacija', '/lv/services/jumta-apkope-remonts'],
    notes: 'Broad commercial roofing-services intent. Services hub should stay canonical.'
  },
  {
    keyword: 'jumiķi',
    intent: 'core-service',
    primaryUrl: '/lv/services',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/services/jumta-renovacija'],
    notes: 'General roofer intent. Treat as a services-page query, not hiring intent.'
  },
  {
    keyword: 'jumta darbi',
    intent: 'core-service',
    primaryUrl: '/lv/services',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/services/jumta-apkope-remonts'],
    notes: 'Umbrella phrase for roofing work. Services listing is canonical.'
  },
  {
    keyword: 'jumta atjaunošana',
    intent: 'renovation',
    primaryUrl: '/lv/services/jumta-renovacija',
    supportingUrls: ['/lv/services/jumta-buvnieciba'],
    notes: 'Restoration/revival phrase. Renovation page should capture it.'
  },
  {
    keyword: 'jumta labošana',
    intent: 'repair',
    primaryUrl: '/lv/services/jumta-apkope-remonts',
    supportingUrls: ['/lv/services/jumta-renovacija'],
    notes: 'Repair synonym. Maintenance + repair page should stay canonical.'
  },
  {
    keyword: 'jauns jumts',
    intent: 'core-service',
    primaryUrl: '/lv/services/jumta-buvnieciba',
    supportingUrls: ['/lv/services/jumta-renovacija'],
    notes: 'New-roof intent. Construction page is canonical.'
  },
  {
    keyword: 'jumta izbūve',
    intent: 'core-service',
    primaryUrl: '/lv/services/jumta-buvnieciba',
    supportingUrls: ['/lv/services/jumta-renovacija'],
    notes: 'Roof build / installation intent. Construction page is canonical.'
  },
  {
    keyword: 'jumta seguma nomaiņa',
    intent: 'renovation',
    primaryUrl: '/lv/services/jumta-renovacija',
    supportingUrls: ['/lv/services/jumta-buvnieciba'],
    notes: 'Roof-cover replacement. Renovation page should capture the term.'
  },
  {
    keyword: 'jumta seguma montāža',
    intent: 'installation',
    primaryUrl: '/lv/services/jumta-buvnieciba',
    supportingUrls: ['/lv/services/valcprofila-montaza', '/lv/services/dakstinu-montaza'],
    notes: 'General installation intent. Construction page is canonical.'
  },
  {
    keyword: 'jumta uzstādīšana',
    intent: 'installation',
    primaryUrl: '/lv/services/jumta-buvnieciba',
    supportingUrls: ['/lv/services/valcprofila-montaza', '/lv/services/dakstinu-montaza'],
    notes: 'Roof installation intent. Construction page is canonical.'
  },
  {
    keyword: 'jumta rekonstrukcija',
    intent: 'renovation',
    primaryUrl: '/lv/services/jumta-renovacija',
    supportingUrls: ['/lv/services/jumta-buvnieciba'],
    notes: 'Reconstruction intent. Renovation page is canonical.'
  },
  {
    keyword: 'jumta pārbūve',
    intent: 'renovation',
    primaryUrl: '/lv/services/jumta-renovacija',
    supportingUrls: ['/lv/services/jumta-buvnieciba'],
    notes: 'Major roof rebuild intent. Renovation page should win.'
  },
  {
    keyword: 'jumta maiņa',
    intent: 'renovation',
    primaryUrl: '/lv/services/jumta-renovacija',
    supportingUrls: ['/lv/services/jumta-buvnieciba'],
    notes: 'Replacement synonym. Renovation page is canonical.'
  },
  {
    keyword: 'jumta montāža',
    intent: 'installation',
    primaryUrl: '/lv/services/jumta-buvnieciba',
    supportingUrls: ['/lv/services/valcprofila-montaza', '/lv/services/dakstinu-montaza'],
    notes: 'Generic roof installation query. Construction page is canonical.'
  },
  {
    keyword: 'jumta nomaiņa',
    intent: 'renovation',
    primaryUrl: '/lv/services/jumta-renovacija',
    supportingUrls: ['/lv/services/jumta-buvnieciba'],
    notes: 'Replacement intent. Renovation page is canonical.'
  },
  {
    keyword: 'valcprofila montāža',
    intent: 'profile',
    primaryUrl: '/lv/services/valcprofila-montaza',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/materials/valcprofils'],
    notes: 'Standing seam installation phrase. Service page remains canonical.'
  },
  {
    keyword: 'valcprofila jumts',
    intent: 'profile',
    primaryUrl: '/lv/services/valcprofila-montaza',
    supportingUrls: ['/lv/materials/valcprofils', '/lv/services/jumta-buvnieciba'],
    notes: 'Standing seam roof intent. Service page remains canonical.'
  },
  {
    keyword: 'metāla jumts',
    intent: 'profile',
    primaryUrl: '/lv/services/valcprofila-montaza',
    supportingUrls: ['/lv/materials/valcprofils', '/lv/materials/ruukki-classic'],
    notes: 'Metal roof intent. Standing seam service is the best fit.'
  },
  {
    keyword: 'skārda jumts',
    intent: 'profile',
    primaryUrl: '/lv/services/valcprofila-montaza',
    supportingUrls: ['/lv/materials/valcprofils', '/lv/services/jumta-buvnieciba'],
    notes: 'Sheet-metal roofing intent. Standing seam service is canonical.'
  },
  {
    keyword: 'dakstiņu jumts',
    intent: 'material',
    primaryUrl: '/lv/services/dakstinu-montaza',
    supportingUrls: ['/lv/services/jumta-renovacija'],
    notes: 'Tile-roof query. Tile installation page is canonical.'
  },
  {
    keyword: 'jumta loksnes',
    intent: 'material',
    primaryUrl: '/lv/materials/valcprofils',
    supportingUrls: ['/lv/services/valcprofila-montaza', '/lv/services/jumta-buvnieciba'],
    notes: 'Roof sheets/material intent. Material page is the cleanest target.'
  },
  {
    keyword: 'jumiķi rīgā',
    intent: 'city',
    primaryUrl: '/lv/cities/riga',
    supportingUrls: ['/lv/services', '/lv/services/jumta-apkope-remonts', '/lv/services/jumta-renovacija'],
    notes: 'Local roofer intent. City page should absorb the query.'
  },
  {
    keyword: 'jumta remonts rīgā',
    intent: 'city',
    primaryUrl: '/lv/cities/riga',
    supportingUrls: ['/lv/services/jumta-apkope-remonts', '/lv/urgency/caurs-jumts'],
    notes: 'Local repair intent. City page should be canonical.'
  },
  {
    keyword: 'jumta nomaiņa rīgā',
    intent: 'city',
    primaryUrl: '/lv/cities/riga',
    supportingUrls: ['/lv/services/jumta-renovacija', '/lv/services/jumta-buvnieciba'],
    notes: 'Local replacement intent. City page is canonical.'
  },
  {
    keyword: 'jumta montāža rīgā',
    intent: 'city',
    primaryUrl: '/lv/cities/riga',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/services/valcprofila-montaza'],
    notes: 'Local installation intent. City page is canonical.'
  },
  {
    keyword: 'jumiķi mārupē',
    intent: 'city',
    primaryUrl: '/lv/services',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/services/jumta-renovacija'],
    notes: 'No dedicated city page exists; route to services hub with Mārupē coverage.'
  },
  {
    keyword: 'jumiķi jūrmalā',
    intent: 'city',
    primaryUrl: '/lv/services',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/services/jumta-renovacija'],
    notes: 'No dedicated city page exists; route to services hub with Jūrmala coverage.'
  },
  {
    keyword: 'jumiķi ādažos',
    intent: 'city',
    primaryUrl: '/lv/services',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/services/jumta-renovacija'],
    notes: 'No dedicated city page exists; route to services hub with Ādaži coverage.'
  },
  {
    keyword: 'jumiķi siguldā',
    intent: 'city',
    primaryUrl: '/lv/services',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/services/jumta-renovacija'],
    notes: 'No dedicated city page exists; route to services hub with Sigulda coverage.'
  },
  {
    keyword: 'profesionāli jumiķi',
    intent: 'career',
    primaryUrl: '/lv/career',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/about'],
    notes: 'Career intent for experienced roofers. Route to the hiring page, not a service page.'
  },
  {
    keyword: 'jumiķa palīgi',
    intent: 'career',
    primaryUrl: '/lv/career',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/about'],
    notes: 'Entry-level roofing assistant hiring intent; use the career page as canonical.'
  },
  {
    keyword: 'darbs jumiķiem',
    intent: 'career',
    primaryUrl: '/lv/career',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/services/jumta-renovacija'],
    notes: 'General roofing jobs intent. Keep the career landing page canonical.'
  },
  {
    keyword: 'jumta diagnostika',
    intent: 'technical',
    primaryUrl: '/lv/services/jumta-apkope-remonts',
    supportingUrls: ['/lv/urgency/caurs-jumts', '/lv/services/jumta-renovacija'],
    notes: 'High spring intent after winter. Core query for inspections and condition checks.'
  },
  {
    keyword: 'jumta apskate',
    intent: 'technical',
    primaryUrl: '/lv/services/jumta-apkope-remonts',
    supportingUrls: ['/lv/urgency/caurs-jumts', '/lv/services/jumta-renovacija'],
    notes: 'Diagnostic/inspection synonym. Keep same canonical page to avoid cannibalization.'
  },
  {
    keyword: 'jumta noplūdes noteikšana',
    intent: 'repair',
    primaryUrl: '/lv/services/jumta-apkope-remonts',
    supportingUrls: ['/lv/urgency/caurs-jumts'],
    notes: 'Leak detection and localization query. Strong conversion intent.'
  },
  {
    keyword: 'jumta logu hermetizācija',
    intent: 'skylight',
    primaryUrl: '/lv/services/jumta-logu-montaza',
    supportingUrls: ['/lv/services/jumta-apkope-remonts'],
    notes: 'Skylight sealing and leak prevention query. Skylight page is canonical.'
  },
  {
    keyword: 'jumta logu remonts',
    intent: 'skylight',
    primaryUrl: '/lv/services/jumta-logu-montaza',
    supportingUrls: ['/lv/services/jumta-apkope-remonts'],
    notes: 'Repair-intent skylight query. Pair with maintenance page for internal links.'
  },
  {
    keyword: 'jumta būvniecība',
    intent: 'core-service',
    primaryUrl: '/lv/services/jumta-buvnieciba',
    supportingUrls: ['/lv/services/jumta-renovacija', '/lv/about'],
    notes: 'Primary build service. Renovation kept separate to avoid overlap.'
  },
  {
    keyword: 'jumta remonts',
    intent: 'repair',
    primaryUrl: '/lv/services/jumta-apkope-remonts',
    supportingUrls: ['/lv/blog', '/lv/services/jumta-renovacija'],
    notes: 'Remont vs renovācija distinction—repair focuses on fixes & leaks.'
  },
  {
    keyword: 'jumta renovācija',
    intent: 'renovation',
    primaryUrl: '/lv/services/jumta-renovacija',
    supportingUrls: ['/lv/services/jumta-buvnieciba'],
    notes: 'Full structural / material replacement; separate from construction (new).'
  },
  {
    keyword: 'valcprofila jumts',
    intent: 'profile',
    primaryUrl: '/lv/services/valcprofila-montaza',
    supportingUrls: ['/lv/blog', '/lv/services/jumta-renovacija'],
    notes: 'Standing seam focused; future material spec page will be added.'
  },
  {
    keyword: 'dakstiņu jumts',
    intent: 'material',
    primaryUrl: '/lv/services/dakstinu-montaza',
    supportingUrls: ['/lv/services/jumta-renovacija'],
    notes: 'Tile roofing distinct from standing seam; avoids slug overlap.'
  },
  {
    keyword: 'jumta logu uzstādīšana',
    intent: 'skylight',
    primaryUrl: '/lv/services/jumta-logu-montaza',
    supportingUrls: ['/lv/services/valcprofila-montaza'],
    notes: 'Skylights additive service; keep separate to avoid dilution.'
  },
  {
    keyword: 'jumta krāsošana',
    intent: 'painting',
    primaryUrl: '/lv/services/jumta-krasosana',
    supportingUrls: ['/lv/blog'],
    notes: 'High maintenance intent; add cost & durability FAQ later.'
  },
  {
    keyword: 'noteksistēmu uzstādīšana',
    intent: 'drainage',
    primaryUrl: '/lv/services/noteksistemu-uzstadisana',
    supportingUrls: ['/lv/services/jumta-apkope-remonts'],
    notes: 'Gutters / drainage—tie into maintenance & water damage prevention.'
  },
  {
    keyword: 'jumta apkope',
    intent: 'maintenance',
    primaryUrl: '/lv/services/jumta-apkope-remonts',
    supportingUrls: ['/lv/blog'],
    notes: 'Combine maintenance + repairs; later split if volume warrants.'
  },
  {
    keyword: 'jumta noplūde ko darīt',
    intent: 'urgency',
    primaryUrl: '/lv/urgency/caurs-jumts', // Planned future page
    supportingUrls: ['/lv/services/jumta-apkope-remonts'],
    notes: 'Emergency leak guide—create decision tree & immediate steps.'
  },
  {
    keyword: 'jumta remonts rīgā',
    intent: 'city',
    primaryUrl: '/lv/city/riga-jumta-remonts', // Planned
    supportingUrls: ['/lv/services/jumta-apkope-remonts', '/lv/services/jumta-renovacija'],
    notes: 'Local proof signals (response time, typical materials, references).'
  },
  {
    keyword: 'jumta būvniecība rīgā',
    intent: 'city',
    primaryUrl: '/lv/city/riga-jumta-buvnieciba', // Planned
    supportingUrls: ['/lv/services/jumta-buvnieciba'],
    notes: 'Construction focus—keep separate from renovation & repairs.'
  },
  {
    keyword: 'jauna jumta cena',
    intent: 'cost',
    primaryUrl: '/lv/cenas/jauns-jumts', // Planned
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/services/jumta-renovacija'],
    notes: 'Cost drivers: material, m², slope, complexity—add transparent ranges.'
  },
  {
    keyword: 'jumta remonts cena',
    intent: 'cost',
    primaryUrl: '/lv/cenas/jumta-remonts', // Planned
    supportingUrls: ['/lv/services/jumta-apkope-remonts'],
    notes: 'Differentiate emergency vs planned repair cost structures.'
  },

  // ── Storm/wind damage keywords (seasonal + emergency) ────────────
  {
    keyword: 'vētras bojāts jumts',
    intent: 'urgency',
    primaryUrl: '/lv/urgency/vetras-jumta-bojajumi',
    supportingUrls: ['/lv/urgency/caurs-jumts', '/lv/services/jumta-apkope-remonts'],
    notes: 'Primary storm emergency keyword. Landing page is the conversion target.'
  },
  {
    keyword: 'vēja bojājumi jumtam',
    intent: 'urgency',
    primaryUrl: '/lv/urgency/vetras-jumta-bojajumi',
    supportingUrls: ['/lv/urgency/caurs-jumts', '/lv/services/jumta-renovacija'],
    notes: 'Strong wind damage variant; use same page to avoid cannibalization.'
  },
  {
    keyword: 'jumta remonts pēc vētras',
    intent: 'urgency',
    primaryUrl: '/lv/urgency/vetras-jumta-bojajumi',
    supportingUrls: ['/lv/urgency/caurs-jumts', '/lv/services/jumta-apkope-remonts'],
    notes: 'Post-storm repair intent with high conversion probability.'
  },

  // ── Snow removal keywords (seasonal high-volume) ──────────────────
  {
    keyword: 'sniega tīrīšana no jumta',
    intent: 'snow-removal',
    primaryUrl: '/lv/urgency/sniega-tirisana',
    supportingUrls: ['/lv/blog/sniega-tirisana-no-jumta-riga', '/lv/blog/sniega-slogs-uz-jumta', '/lv/blog/sniega-tirisana-daudzdzivoklu-maja'],
    notes: 'Primary head keyword. Landing page is the canonical target.'
  },
  {
    keyword: 'jumta tīrīšana no sniega',
    intent: 'snow-removal',
    primaryUrl: '/lv/urgency/sniega-tirisana',
    supportingUrls: ['/lv/blog/sniega-tirisana-no-jumta-riga', '/lv/blog/sniega-slogs-uz-jumta'],
    notes: 'Synonym of primary keyword—same landing page, no cannibalization.'
  },
  {
    keyword: 'sniega tīrīšana no jumta rīgā',
    intent: 'snow-removal',
    primaryUrl: '/lv/urgency/sniega-tirisana',
    supportingUrls: ['/lv/blog/sniega-tirisana-no-jumta-riga', '/lv/blog/ka-izvelieties-sniega-tirisanas-pakalpojumu'],
    notes: 'Geo-modified variant. Landing page covers Rīga + Pierīga.'
  },
  {
    keyword: 'lāsteku tīrīšana',
    intent: 'snow-removal',
    primaryUrl: '/lv/urgency/sniega-tirisana',
    supportingUrls: ['/lv/blog/lasteku-tirisana-jumta-tirisana-no-ledus'],
    notes: 'Icicle removal—blog 18 is deep-dive, landing page is conversion target.'
  },
  {
    keyword: 'jumta tīrīšana no ledus un lāstekām',
    intent: 'snow-removal',
    primaryUrl: '/lv/urgency/sniega-tirisana',
    supportingUrls: ['/lv/blog/lasteku-tirisana-jumta-tirisana-no-ledus'],
    notes: 'Ice + icicle combined query. Blog 18 covers details.'
  },
  {
    keyword: 'sniega slogs uz jumta',
    intent: 'snow-removal',
    primaryUrl: '/lv/blog/sniega-slogs-uz-jumta',
    supportingUrls: ['/lv/urgency/sniega-tirisana'],
    notes: 'Informational intent—blog 19 is authoritative content, landing page for conversion.'
  },
  {
    keyword: 'sniega tīrīšana no jumta cena',
    intent: 'snow-removal',
    primaryUrl: '/lv/urgency/sniega-tirisana',
    supportingUrls: ['/lv/blog/sniega-tirisana-no-jumta-riga'],
    notes: 'Cost-intent variant. Landing page has pricing section.'
  },
  {
    keyword: 'sniega tīrīšana daudzdzīvokļu mājai',
    intent: 'snow-removal',
    primaryUrl: '/lv/blog/sniega-tirisana-daudzdzivoklu-maja',
    supportingUrls: ['/lv/urgency/sniega-tirisana'],
    notes: 'Niche audience: apartment building managers/residents. Blog 20 is deep-dive.'
  },
  {
    keyword: 'sniega tīrīšana ar traktoru',
    intent: 'snow-removal',
    primaryUrl: '/lv/blog/sniega-tirisana-ar-traktoru',
    supportingUrls: ['/lv/urgency/sniega-tirisana'],
    notes: 'Tractor service queries. Blog 22 covers ground + territory clearing.'
  },
  {
    keyword: 'sniega izvešana',
    intent: 'snow-removal',
    primaryUrl: '/lv/blog/sniega-tirisana-ar-traktoru',
    supportingUrls: ['/lv/urgency/sniega-tirisana'],
    notes: 'Snow removal/hauling from site. Blog 22 covers full logistics.'
  },
  {
    keyword: 'sniega noņemšana no jumta',
    intent: 'snow-removal',
    primaryUrl: '/lv/urgency/sniega-tirisana',
    supportingUrls: ['/lv/blog/sniega-tirisana-no-jumta-riga', '/lv/blog/sniega-slogs-uz-jumta'],
    notes: 'Alternate phrasing of head keyword.'
  },
  {
    keyword: 'lāsteku noņemšana',
    intent: 'snow-removal',
    primaryUrl: '/lv/urgency/sniega-tirisana',
    supportingUrls: ['/lv/blog/lasteku-tirisana-jumta-tirisana-no-ledus'],
    notes: 'Alternate icicle phrasing.'
  },
  {
    keyword: 'ledus tīrīšana no jumta',
    intent: 'snow-removal',
    primaryUrl: '/lv/urgency/sniega-tirisana',
    supportingUrls: ['/lv/blog/lasteku-tirisana-jumta-tirisana-no-ledus'],
    notes: 'Ice cleaning from roof—covered by landing page + blog 18.'
  },
  {
    keyword: 'jumta tīrīšana ziemā',
    intent: 'snow-removal',
    primaryUrl: '/lv/urgency/sniega-tirisana',
    supportingUrls: ['/lv/blog/sniega-tirisana-no-jumta-riga', '/lv/blog/sniega-slogs-uz-jumta', '/lv/blog/sniega-tirisana-daudzdzivoklu-maja'],
    notes: 'Seasonal maintenance query. All snow content supports this.'
  },
  {
    keyword: 'soda nauda par sniegu uz jumta',
    intent: 'snow-removal',
    primaryUrl: '/lv/blog/sniega-tirisana-no-jumta-riga',
    supportingUrls: ['/lv/urgency/sniega-tirisana'],
    notes: 'Legal/fine intent. Blog 17 has detailed regulatory content.'
  },
  {
    keyword: 'kā izvēlēties sniega tīrīšanas pakalpojumu',
    intent: 'snow-removal',
    primaryUrl: '/lv/blog/ka-izvelieties-sniega-tirisanas-pakalpojumu',
    supportingUrls: ['/lv/urgency/sniega-tirisana'],
    notes: 'Consideration-stage content. Blog 21 is decision guide.'
  },

  // ── High-volume roofing keywords (commonly searched) ──────────────
  {
    keyword: 'jumta seguma montāža',
    intent: 'installation',
    primaryUrl: '/lv/services/jumta-buvnieciba',
    supportingUrls: ['/lv/services/jumta-renovacija', '/lv/services/valcprofila-montaza', '/lv/services/dakstinu-montaza'],
    notes: 'Generic covering installation—construction page is canonical, reinforced by specific material pages.'
  },
  {
    keyword: 'jumta nomaiņa',
    intent: 'renovation',
    primaryUrl: '/lv/services/jumta-renovacija',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/blog'],
    notes: 'Roof replacement—renovation page is primary. Differentiate from new build.'
  },
  {
    keyword: 'metāla jumta montāža',
    intent: 'installation',
    primaryUrl: '/lv/services/valcprofila-montaza',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/materials/valcprofils', '/lv/materials/ruukki-classic'],
    notes: 'Metal roof installation—standing seam page is canonical target.'
  },
  {
    keyword: 'jumta darbi',
    intent: 'core-service',
    primaryUrl: '/lv/services',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/services/jumta-renovacija', '/lv/services/jumta-apkope-remonts'],
    notes: 'Broad umbrella term—services listing page as canonical, all service pages reinforce.'
  },
  {
    keyword: 'jumta ieklāšana',
    intent: 'installation',
    primaryUrl: '/lv/services/jumta-buvnieciba',
    supportingUrls: ['/lv/services/valcprofila-montaza', '/lv/services/dakstinu-montaza', '/lv/services/jumta-renovacija'],
    notes: 'Roof laying/installation synonym—construction is canonical.'
  },
  {
    keyword: 'noteku montāža',
    intent: 'drainage',
    primaryUrl: '/lv/services/noteksistemu-uzstadisana',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/services/jumta-renovacija'],
    notes: 'Gutter installation short form—drainage page is canonical.'
  },
  {
    keyword: 'jumta darbi rīgā',
    intent: 'city',
    primaryUrl: '/lv/services',
    supportingUrls: ['/lv/services/jumta-buvnieciba', '/lv/services/jumta-apkope-remonts'],
    notes: 'Geo-modified broad term. Services listing is canonical.'
  },
  {
    keyword: 'jumta seguma maiņa',
    intent: 'renovation',
    primaryUrl: '/lv/services/jumta-renovacija',
    supportingUrls: ['/lv/services/jumta-buvnieciba'],
    notes: 'Covering replacement—synonym for renovation.'
  }
];

// Utility: find mapping by keyword (future use in builds / validation scripts)
export function findMapping(keyword: string) {
  return keywordMapping.find((k) => k.keyword === keyword.toLowerCase());
}
