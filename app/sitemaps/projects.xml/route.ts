// Placeholder: Extend when individual project detail pages exist
export const revalidate = 3600;
const baseUrl = 'https://uproof.eu';
// If project detail pages get implemented, import project data here.
// Currently no individual pages => returning empty set (valid sitemap).

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
