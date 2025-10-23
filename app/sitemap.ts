import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://uproof.eu'; // Replace with your actual GoDaddy domain
  const locales = ['lv', 'en', 'nl-BE'];
  const paths = ['', '/services', '/projects', '/about', '/contact', '/blog'];
  
  const routes = locales.flatMap((locale) =>
    paths.map((p) => ({
      url: `${baseUrl}/${locale}${p}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: p === '' ? 1 : p === '/contact' ? 0.9 : 0.8,
    }))
  );

  return routes;
}
