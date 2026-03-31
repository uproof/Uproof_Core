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
    ],
  },
  
  // Security headers
  async headers() {
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
