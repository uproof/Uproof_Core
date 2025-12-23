export const revalidate = 3600;
const baseUrl = 'https://uproof.eu';
const locales = ['lv','en','nl-BE'];
const materialSlugs = [
  'valcprofils',
  'pvc-tpo',
  'bitumena-rulli',
  'dakstini',
  'bezazbesta-siferis',
  'ruukki-classic',
  'jumta-krasa'
];

export async function GET() {
  const now = new Date().toISOString();
  const entries = locales.map(locale => materialSlugs.map(slug => `<url><loc>${baseUrl}/${locale}/materials/${slug}</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.72</priority></url>`).join('\n')).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
