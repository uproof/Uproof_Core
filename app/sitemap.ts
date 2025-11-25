import { MetadataRoute } from 'next';
import blogData from '@/data/blog.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://uproof.eu';
  const locales = ['lv', 'en', 'nl-BE'];
  const paths = ['', '/services', '/projects', '/about', '/contact', '/blog'];
  // Latvian-focused service landing slugs
  const serviceSlugs = [
    'jumta-renovacija',
    'valcprofila-montaza',
    'dakstinu-montaza',
    'jumta-logu-montaza',
    'jumta-buvnieciba',
    'jumta-apkope-remonts',
    'noteksistemu-uzstadisana',
    'jumta-krasosana'
  ];
  
  const routes: MetadataRoute.Sitemap = [];
  
  // Add locale-specific pages
  for (const locale of locales) {
    for (const p of paths) {
      routes.push({
        url: `${baseUrl}/${locale}${p}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: p === '' ? 1 : p === '/contact' ? 0.9 : 0.8,
      });
    }
    
    // Add service landing pages
    for (const slug of serviceSlugs) {
      routes.push({
        url: `${baseUrl}/${locale}/services/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    }
    
    // Add blog post detail pages (published only)
    const publishedPosts = blogData.filter((post: any) => post.status === 'published');
    for (const post of publishedPosts) {
      routes.push({
        url: `${baseUrl}/${locale}/blog/${post.id}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return routes;
}
