export const SERVICE_SLUGS = [
  'jumta-renovacija',
  'valcprofila-montaza',
  'dakstinu-montaza',
  'skurstena-piesleguma-montaza-labosana',
  'dakstina-jumta-labosana',
  'jumta-logu-montaza',
  'jumta-buvnieciba',
  'jumta-konstrukciju-montaza',
  'jumta-apkope-remonts',
  'jumta-remonts',
  'noteksistemu-uzstadisana',
  'jumta-krasosana',
  'saules-dakstini',
] as const;

type Locale = 'lv' | 'en' | 'nl-BE';

const localizedServiceSlugs: Record<Locale, Record<string, string>> = {
  lv: {
    'jumta-renovacija': 'jumta-renovacija',
    'valcprofila-montaza': 'valcprofila-montaza',
    'dakstinu-montaza': 'dakstinu-montaza',
    'skurstena-piesleguma-montaza-labosana': 'skurstena-piesleguma-montaza-labosana',
    'dakstina-jumta-labosana': 'dakstina-jumta-labosana',
    'jumta-logu-montaza': 'jumta-logu-montaza',
    'jumta-buvnieciba': 'jumta-buvnieciba',
    'jumta-konstrukciju-montaza': 'jumta-konstrukciju-montaza',
    'jumta-apkope-remonts': 'jumta-apkope-remonts',
    'jumta-remonts': 'jumta-remonts',
    'noteksistemu-uzstadisana': 'noteksistemu-uzstadisana',
    'jumta-krasosana': 'jumta-krasosana',
    'saules-dakstini': 'saules-dakstini',
  },
  en: {
    'jumta-renovacija': 'roof-renovation',
    'valcprofila-montaza': 'standing-seam-metal-roofing',
    'dakstinu-montaza': 'tile-roof-installation',
    'skurstena-piesleguma-montaza-labosana': 'chimney-flashing-installation-repair',
    'dakstina-jumta-labosana': 'tile-roof-repair',
    'jumta-logu-montaza': 'skylight-installation',
    'jumta-buvnieciba': 'roof-construction',
    'jumta-konstrukciju-montaza': 'roof-truss-installation',
    'jumta-apkope-remonts': 'roof-maintenance-repair',
    'jumta-remonts': 'emergency-roof-repair',
    'noteksistemu-uzstadisana': 'gutter-system-installation',
    'jumta-krasosana': 'roof-painting',
    'saules-dakstini': 'solar-roof-tiles',
  },
  'nl-BE': {
    'jumta-renovacija': 'dakrenovatie',
    'valcprofila-montaza': 'staande-naad-dakbedekking',
    'dakstinu-montaza': 'pannendak-installatie',
    'skurstena-piesleguma-montaza-labosana': 'schoorsteenaansluiting-montage-herstel',
    'dakstina-jumta-labosana': 'pannendak-herstelling',
    'jumta-logu-montaza': 'dakraam-installatie',
    'jumta-buvnieciba': 'dakbouw',
    'jumta-konstrukciju-montaza': 'dakconstructie-montage',
    'jumta-apkope-remonts': 'dakonderhoud-reparatie',
    'jumta-remonts': 'noodreparatie-dak',
    'noteksistemu-uzstadisana': 'gootsysteem-installatie',
    'jumta-krasosana': 'dakschilderen',
    'saules-dakstini': 'zonnedakpannen',
  },
};

const canonicalByLocalizedSlug = new Map<string, string>(
  Object.entries(localizedServiceSlugs).flatMap(([, mappings]) =>
    Object.entries(mappings).map(([canonical, localized]) => [localized, canonical] as const)
  )
);

export function getLocalizedServiceSlug(locale: string, canonicalSlug: string) {
  const localeMap = localizedServiceSlugs[locale as Locale] || localizedServiceSlugs.lv;
  return localeMap[canonicalSlug] || canonicalSlug;
}

export function getServicePath(locale: string, canonicalSlug: string) {
  return `/${locale}/services/${getLocalizedServiceSlug(locale, canonicalSlug)}`;
}

export function getCanonicalServiceSlug(locale: string, slug: string) {
  const localeMap = localizedServiceSlugs[locale as Locale] || localizedServiceSlugs.lv;

  if (SERVICE_SLUGS.includes(slug as (typeof SERVICE_SLUGS)[number])) {
    return slug;
  }

  for (const [canonical, localized] of Object.entries(localeMap)) {
    if (localized === slug) {
      return canonical;
    }
  }

  return canonicalByLocalizedSlug.get(slug) || slug;
}

export function getServiceLanguages(canonicalSlug: string) {
  return {
    lv: `https://uproof.eu/lv/services/${getLocalizedServiceSlug('lv', canonicalSlug)}`,
    en: `https://uproof.eu/en/services/${getLocalizedServiceSlug('en', canonicalSlug)}`,
    'nl-BE': `https://uproof.eu/nl-BE/services/${getLocalizedServiceSlug('nl-BE', canonicalSlug)}`,
    'x-default': `https://uproof.eu/lv/services/${getLocalizedServiceSlug('lv', canonicalSlug)}`,
  };
}