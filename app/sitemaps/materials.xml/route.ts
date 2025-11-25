// Material/spec pages not yet implemented. Future URLs will be added here.
export const revalidate = 3600;
export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
