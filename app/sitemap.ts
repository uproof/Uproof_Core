import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://uproof.eu'; // Replace with your actual GoDaddy domain
  const locales = ['lv', 'en', 'nl-BE'];
  const paths = ['', '/services', '/projects', '/about', '/contact', '/blog'];
  // Latvian-focused service landing slugs
  const serviceSlugs = [
    'jumta-renovacija',
    'jumta-seguma-montaza',
    'jumta-buvnieciba',
    'jumta-apkope-remonts',
    'noteksistemu-uzstadisana',
    'jumta-krasosana'
  ];
  
  const routes: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const p of paths) {
      routes.push({
        url: `${baseUrl}/${locale}${p}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: p === '' ? 1 : p === '/contact' ? 0.9 : 0.8,
      });
    }
    // add service landing pages (canonical language focus lv; mirror in other locales for consistency)
    for (const slug of serviceSlugs) {
      routes.push({
        url: `${baseUrl}/${locale}/services/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    }
  }

  return routes;
}
