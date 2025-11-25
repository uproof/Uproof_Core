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
  | 'technical';

export interface KeywordMappingEntry {
  keyword: string; // Exact Latvian intent phrase (lowercase)
  intent: KeywordIntent;
  primaryUrl: string; // Single canonical landing page
  supportingUrls: string[]; // Secondary internal pages that reinforce topic
  notes?: string; // Differentiation / localization / future expansion pointers
}

export const keywordMapping: KeywordMappingEntry[] = [
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
  }
];

// Utility: find mapping by keyword (future use in builds / validation scripts)
export function findMapping(keyword: string) {
  return keywordMapping.find((k) => k.keyword === keyword.toLowerCase());
}
