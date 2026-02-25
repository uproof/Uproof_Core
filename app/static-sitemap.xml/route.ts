export const revalidate = 86400;
const baseUrl = 'https://uproof.eu';
const locales = ['lv', 'en', 'nl-BE'];
const staticPaths = [
  '',
  '/services',
  '/projects',
  '/about',
  '/contact',
  '/blog',
  '/reviews',
  '/privacy-policy',
  '/urgency/caurs-jumts',
  '/urgency/sniega-tirisana'
];

export async function GET() {
  const now = new Date().toISOString();
  const entries = locales
    .map((locale) =>
      staticPaths
        .map((p) => {
          const url = `${baseUrl}/${locale}${p}`;
          const priority = p === '' ? 1 : p.startsWith('/urgency/') ? 0.9 : p === '/contact' ? 0.9 : 0.8;
          return `<url><loc>${url}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>${priority.toFixed(2)}</priority></url>`;
        })
        .join('\n')
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
