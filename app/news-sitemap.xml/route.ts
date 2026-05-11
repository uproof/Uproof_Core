// Redirect news sitemap requests to blog sitemap (for backward compatibility)
// Handles old links or external crawlers expecting a news-sitemap.xml

import { redirect } from 'next/navigation';

export const revalidate = 3600; // 1 hour

export async function GET() {
  // Redirect to blog sitemap since blog is the news/content section
  redirect('/blog-sitemap.xml');
}
