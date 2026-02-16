import blogData from '@/data/blog.json';
export const revalidate = 1800;
const baseUrl = 'https://uproof.eu';
const locales = ['lv', 'en', 'nl-BE'];

export async function GET() {
  const published = blogData.filter((p: any) => p.status === 'published');
  const now = new Date();
  const entries = locales
    .map((locale) =>
      published
        .map(
          (post) =>
            `<url><loc>${baseUrl}/${locale}/blog/${(post as any).slug || post.id}</loc><lastmod>${new Date(post.date).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.70</priority></url>`
        )
        .join('\n')
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
