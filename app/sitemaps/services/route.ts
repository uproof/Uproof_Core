export const revalidate = 3600;
const baseUrl = 'https://uproof.eu';
const locales = ['lv', 'en', 'nl-BE'];
const serviceSlugs = [
  'jumta-renovacija',
  'valcprofila-montaza',
  'dakstinu-montaza',
  'jumta-logu-montaza',
  'jumta-buvnieciba',
  'jumta-konstrukciju-montaza',
  'jumta-apkope-remonts',
  'noteksistemu-uzstadisana',
  'jumta-krasosana',
  'saules-dakstini'
];

export async function GET() {
  const now = new Date();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locales
    .map((locale) =>
      serviceSlugs
        .map(
          (slug) =>
            `<url><loc>${baseUrl}/${locale}/services/${slug}</loc><lastmod>${now.toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.85</priority></url>`
        )
        .join('\n')
    )
    .join('\n')}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
