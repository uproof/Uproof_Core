import {getCareerJobs} from '@/lib/career';
import {getCareerSitemapEntries} from '@/lib/careerSeo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const jobs = await getCareerJobs();
  const entries = getCareerSitemapEntries(jobs);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) =>
      `<url><loc>${entry.url}</loc><lastmod>${entry.lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.90</priority></url>`,
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {'Content-Type': 'application/xml'},
  });
}