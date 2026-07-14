import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // These legacy EN Belgium city URLs should be explicit redirects, not rewrites.
      { source: '/en/cities/brussel', destination: '/nl-BE/cities/brussel', permanent: true },
      { source: '/en/cities/antwerpen', destination: '/nl-BE/cities/antwerpen', permanent: true },
      { source: '/en/cities/gent', destination: '/nl-BE/cities/gent', permanent: true },
      { source: '/en/cities/brugge', destination: '/nl-BE/cities/brugge', permanent: true },
      { source: '/en/cities/leuven', destination: '/nl-BE/cities/leuven', permanent: true },
      { source: '/en/cities/mechelen', destination: '/nl-BE/cities/mechelen', permanent: true },
    ];
  },
  async rewrites() {
    return [
      // Map common /sitemap.xml to the actual segmented index to avoid route conflicts.
      { source: '/sitemap.xml', destination: '/sitemap_index.xml' },
      // Common legacy aliases used by external tools/crawlers.
      { source: '/sitemap.txt', destination: '/sitemap_index.xml' },
      { source: '/sitemap.txt/:name', destination: '/sitemaps/:name' },
      // Backward compatibility for legacy segmented sitemap paths (pre Feb-2026 migration).
      { source: '/sitemaps/static.xml', destination: '/static-sitemap.xml' },
      { source: '/sitemaps/services.xml', destination: '/services-sitemap.xml' },
      { source: '/sitemaps/projects.xml', destination: '/projects-sitemap.xml' },
      { source: '/sitemaps/blog.xml', destination: '/blog-sitemap.xml' },
      { source: '/sitemaps/materials.xml', destination: '/materials-sitemap.xml' },
      { source: '/sitemaps/cities.xml', destination: '/cities-sitemap.xml' },
      { source: '/sitemaps/static', destination: '/static-sitemap.xml' },
      { source: '/sitemaps/services', destination: '/services-sitemap.xml' },
      { source: '/sitemaps/projects', destination: '/projects-sitemap.xml' },
      { source: '/sitemaps/blog', destination: '/blog-sitemap.xml' },
      { source: '/sitemaps/materials', destination: '/materials-sitemap.xml' },
      { source: '/sitemaps/cities', destination: '/cities-sitemap.xml' },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Tighter breakpoints — avoids generating oversized variants
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allowed quality values for next/image
    qualities: [65, 75],
    // Cache optimized images for 30 days on CDN
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.squarespace-cdn.com',
      },
      { protocol: 'https', hostname: 'avrbaltija.lv' },
      { protocol: 'https', hostname: 'produs.lv' },
      { protocol: 'https', hostname: 'lebens.lv' },
      { protocol: 'https', hostname: 'www.prowood.lv' },
      { protocol: 'https', hostname: 'www.kursi.lv' },
      { protocol: 'https', hostname: 'online.depo.lv' },
      { protocol: 'https', hostname: 'www.inserv.lv' },
    ],
  },
  
  // Security headers
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    const scriptSources = ["script-src 'self' 'unsafe-inline' https:"];
    const connectSources = ["connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com https://www.googletagmanager.com"];

    if (!isProduction) {
      scriptSources[0] = "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:";
      connectSources[0] = "connect-src 'self' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:* ws://crm.localhost:* ws://uproof.localhost:* https://*.supabase.co https://vitals.vercel-insights.com https://www.googletagmanager.com";
    }

    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https:",
      scriptSources[0],
      connectSources[0],
      "frame-src 'self' https://www.google.com https://www.youtube.com",
      'upgrade-insecure-requests',
      'block-all-mixed-content',
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy,
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-site',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ]
      }
    ];
  },
};

export default withNextIntl(nextConfig);
