export const revalidate = 3600;
import { citiesByLocale, locales } from '@/lib/cities';

function absolute(path: string) {
  return `https://uproof.eu${path}`;
}

export async function GET() {
  const now = new Date().toISOString();
  const entries: string[] = [];
  for (const locale of locales) {
    const cities = citiesByLocale[locale] ?? [];
    for (const city of cities) {
      entries.push(`<url><loc>${absolute(`/${locale}/cities/${city}`)}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.65</priority></url>`);
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
