import blogData from '@/data/blog.json'; // For potential related mapping/future expansion
export const revalidate = 3600;

const baseUrl = 'https://uproof.eu';
const locales = ['lv', 'en', 'nl-BE'];
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

export async function GET() {
  const now = new Date();
  const urls: string[] = [];
  for (const locale of locales) {
    for (const slug of serviceSlugs) {
      urls.push(`${baseUrl}/${locale}/services/${slug}`);
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(
      (u) => `<url><loc>${u}</loc><lastmod>${now.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.85</priority></url>`
    )
    .join('\n')}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
