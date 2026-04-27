import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextRequest, NextResponse} from 'next/server';
import {latviaCities, belgiumCities} from '@/lib/cities';

const intlMiddleware = createMiddleware(routing);
const LATVIA_CITY_SET = new Set<string>(latviaCities);
const BELGIUM_CITY_SET = new Set<string>(belgiumCities);

function isCrawler(request: NextRequest): boolean {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  return /(googlebot|bingbot|yandexbot|duckduckbot|baiduspider|slurp|facebookexternalhit|twitterbot|linkedinbot|crawler|spider|bot)/.test(ua);
}

export default function middleware(request: NextRequest) {
  const {nextUrl, cookies} = request;
  const pathname = nextUrl.pathname;
  const setLocale = nextUrl.searchParams.get('setLocale');

  // Allow explicit locale changes to win before any default-locale redirects.
  if (setLocale && ['lv', 'en', 'nl-BE'].includes(setLocale)) {
    const prefixMatch = pathname.match(/^\/(lv|en|nl-BE)(\/|$)/);
    const basePath = prefixMatch ? pathname.replace(/^\/(lv|en|nl-BE)/, '') || '' : pathname;
    const targetPath = basePath === '/' ? '' : basePath;
    const redirectUrl = new URL(`/${setLocale}${targetPath}`, nextUrl);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set('preferred_locale', setLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 180
    });
    return response;
  }

  // Normalize malformed sitemap index paths such as /lv/sitemap-index.xml/urgency.
  const localizedSitemapIndexMatch = pathname.match(/^\/(lv|en|nl-BE)\/sitemap[-_]index\.xml(?:\/.+)?$/);
  if (localizedSitemapIndexMatch) {
    const redirectUrl = new URL('/sitemap_index.xml', nextUrl);
    return NextResponse.redirect(redirectUrl, 301);
  }

  const sitemapIndexMatch = pathname.match(/^\/sitemap[-_]index\.xml\/.+$/);
  if (sitemapIndexMatch) {
    const redirectUrl = new URL('/sitemap_index.xml', nextUrl);
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Normalize malformed sitemap crawler paths such as /lv/sitemap.txt/services.
  const localizedSitemapTxtMatch = pathname.match(/^\/(lv|en|nl-BE)\/sitemap\.txt\/([a-z-]+)$/);
  if (localizedSitemapTxtMatch) {
    const sitemapName = localizedSitemapTxtMatch[2];
    const redirectUrl = new URL(`/sitemaps/${sitemapName}`, nextUrl);
    return NextResponse.redirect(redirectUrl, 301);
  }

  const sitemapTxtMatch = pathname.match(/^\/sitemap\.txt\/([a-z-]+)$/);
  if (sitemapTxtMatch) {
    const sitemapName = sitemapTxtMatch[1];
    const redirectUrl = new URL(`/sitemaps/${sitemapName}`, nextUrl);
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Keep sitemap utility paths locale-agnostic to avoid crawler inconsistency.
  if (pathname.startsWith('/sitemaps/')) {
    return NextResponse.next();
  }

  // Handle old paths without locale - redirect to lv
  const oldPathsToRedirect = ['/ieteikumi', '/services', '/materials', '/reviews', '/projects', '/about', '/contact', '/blog'];
  if (oldPathsToRedirect.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    const redirectUrl = new URL(`/lv${pathname}`, nextUrl);
    return NextResponse.redirect(redirectUrl, 301);
  }

  // Normalize mismatched locale/city combinations to canonical locale URLs.
  const cityPathMatch = pathname.match(/^\/(lv|en|nl-BE)\/cities\/([a-z-]+)$/);
  if (cityPathMatch) {
    const localePrefix = cityPathMatch[1];
    const city = cityPathMatch[2];

    if (localePrefix === 'nl-BE' && LATVIA_CITY_SET.has(city)) {
      const redirectUrl = new URL(`/en/cities/${city}`, nextUrl);
      return NextResponse.redirect(redirectUrl, 301);
    }

    if ((localePrefix === 'lv' || localePrefix === 'en') && BELGIUM_CITY_SET.has(city)) {
      const redirectUrl = new URL(`/nl-BE/cities/${city}`, nextUrl);
      return NextResponse.redirect(redirectUrl, 301);
    }
  }

  // Redirect old Latvian slugs to current English slugs (with any locale prefix)
  const latvianToEnglishPaths: Record<string, string> = {
    '/pakalpojumi': '/services',
    '/projekti': '/projects',
    '/atsauksmes': '/reviews',
    '/kontakti': '/contact',
    '/par-mums': '/about',
    '/blogi': '/blog',
    '/privatuma-politika': '/privacy-policy',
  };

  // Check for old Latvian slugs with locale prefix
  const localeMatch = pathname.match(/^\/(lv|en|nl-BE)(\/.*)/);
  if (localeMatch) {
    const localePrefix = localeMatch[1];
    const subpath = localeMatch[2];

    // Redirect legacy page slugs to canonical slugs to avoid 404s and duplicate crawl paths.
    const legacySlugRedirects: Record<string, string> = {
      '/services/roof-renovation': '/services/jumta-renovacija',
      '/urgency/through-the-roof': '/urgency/caurs-jumts'
    };
    const legacyMapped = legacySlugRedirects[subpath];
    if (legacyMapped) {
      const redirectUrl = new URL(`/${localePrefix}${legacyMapped}`, nextUrl);
      return NextResponse.redirect(redirectUrl, 301);
    }

    const mapped = latvianToEnglishPaths[subpath];
    if (mapped) {
      const redirectUrl = new URL(`/${localePrefix}${mapped}`, nextUrl);
      return NextResponse.redirect(redirectUrl, 301);
    }
  }

  // Skip if already has locale prefix; the URL locale should control rendering.
  const hasLocalePrefix = /^\/(lv|en|nl-BE)(\/|$)/.test(pathname);

  const crawler = isCrawler(request);

  if (!hasLocalePrefix) {
    const redirectUrl = new URL(`/lv${pathname === '/' ? '' : pathname}`, nextUrl);
    const response = NextResponse.redirect(redirectUrl, 308);
    if (!crawler) {
      response.cookies.set('preferred_locale', 'lv', {
        path: '/',
        maxAge: 60 * 60 * 24 * 180 // 180 days
      });
    }
    return response;
  }

  // Delegate to next-intl middleware for locale routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(lv|en|nl-BE)/:path*',
    // Exclude API routes, static files, and well-known paths
    '/((?!api|_next/static|_next/image|favicon.ico|images|uploads|models|videos|.*\\..*|\\.well-known).*)'
  ]
};
