import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.uproof.eu';
  const locales = ['lv', 'en', 'nl-BE'];
  const paths = ['','/services','/projects','/about','/contact'];
  const routes = locales.flatMap((locale) =>
    paths.map((p) => ({
      url: `${baseUrl}/${locale}${p}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: p === '' ? 1 : 0.8,
    }))
  );

  return routes;
}
