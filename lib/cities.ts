export const locales = ['lv', 'en', 'nl-BE'] as const;
export type Locale = typeof locales[number];

export const latviaCities = ['riga', 'jurmala', 'jelgava', 'ogre', 'salaspils', 'kekava'] as const;
export const belgiumCities = ['brussel', 'antwerpen', 'gent', 'brugge', 'leuven', 'mechelen'] as const;

export const allCities: string[] = [...latviaCities, ...belgiumCities];

// Locale-specific city targeting to avoid mixed-country SEO signals.
export const citiesByLocale: Record<Locale, string[]> = {
  lv: [...latviaCities],
  en: [...latviaCities],
  'nl-BE': [...belgiumCities],
};

// Returns a display name for a city given a locale, falling back to capitalized slug
export function getCityDisplayName(locale: Locale, slug: string, t?: (key: string, opts?: any) => string): string {
  const key = `CityNames.${slug}`;
  try {
    if (t) {
      const name = t(key);
      if (name && !/CityNames\./.test(name)) return name;
    }
  } catch {}
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
