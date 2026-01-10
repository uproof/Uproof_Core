// Segmented sitemap index
// Generates references to individual sitemaps for logical content groupings.
export const revalidate = 3600; // 1 hour

function absolute(url: string) {
  return `https://uproof.eu${url}`;
}

export async function GET() {
  const now = new Date().toISOString();
  const sitemapUrls = [
    '/static-sitemap.xml',
    '/services-sitemap.xml',
    '/blog-sitemap.xml',
    '/materials-sitemap.xml',
    '/cities-sitemap.xml'
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
    .map(
      (u) => `<sitemap><loc>${absolute(u)}</loc><lastmod>${now}</lastmod></sitemap>`
    )
    .join('\n')}\n</sitemapindex>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
