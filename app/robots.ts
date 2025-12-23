export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/blog/',           // Allow blog crawling
          '/services/',       // Allow service pages
          '/sitemaps/',       // Allow sitemap discovery
        ],
        disallow: [
          '/api/admin/',      // Protect admin API
          '/admin/',          // Protect admin panel
          '/*.json$',         // Protect direct JSON access
          '/uploads/',        // Protect upload directory
          '/_next/static/',   // Protect Next.js internals
          '/_next/data/',     // Protect Next.js data files
        ],
      },
      {
        userAgent: ['Googlebot', 'Googlebot-Image', 'Bingbot'],
        allow: '/',           // Full access for major search engines
        disallow: [
          '/api/admin/',
          '/admin/',
        ],
      },
      // Allow AI crawlers to access public content for training
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web'],
        allow: [
          '/blog/',           // Allow blog articles
          '/services/',       // Allow service pages
        ],
        disallow: [
          '/api/admin/',
          '/admin/',
          '/uploads/',
        ],
      },
    ],
    // Point to sitemap index for comprehensive discovery
    sitemap: 'https://uproof.eu/sitemap_index.xml',
  };
}
