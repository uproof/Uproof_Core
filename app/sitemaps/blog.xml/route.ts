import blogData from '@/data/blog.json';
export const revalidate = 1800; // 30 min for blog updates

const baseUrl = 'https://uproof.eu';
const locales = ['lv', 'en', 'nl-BE'];

export async function GET() {
  const published = blogData.filter((p: any) => p.status === 'published');
  const xmlEntries: string[] = [];
  for (const locale of locales) {
    for (const post of published) {
      xmlEntries.push(
        `<url><loc>${baseUrl}/${locale}/blog/${post.id}</loc><lastmod>${new Date(post.date).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.70</priority></url>`
      );
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlEntries.join('\n')}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
