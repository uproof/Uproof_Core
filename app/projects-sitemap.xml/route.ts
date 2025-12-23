import { projects } from '@/data/projects';

export const revalidate = 3600;

export async function GET() {
  const locales = ['lv', 'en', 'nl-BE'];
  const baseUrl = 'https://uproof.eu';
  
  const urls = locales.flatMap(locale =>
    projects.map(project => {
      return `  <url>
    <loc>${baseUrl}/${locale}/projects/${project.id}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    })
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
