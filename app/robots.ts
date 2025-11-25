export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/admin/',
          '/admin/',
          '/*.json$',
          '/uploads/',
          '/_next/static/',
        ],
      },
      {
        userAgent: ['Googlebot', 'Googlebot-Image', 'Bingbot', 'GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web'],
        allow: '/',
        disallow: [
          '/api/admin/',
          '/admin/',
        ],
      },
    ],
    // Point to sitemap index for segmented discovery.
    sitemap: 'https://uproof.eu/sitemap_index.xml',
  };
}
