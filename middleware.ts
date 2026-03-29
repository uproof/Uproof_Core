import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextRequest, NextResponse} from 'next/server';

const intlMiddleware = createMiddleware(routing);

// Geo-based locale resolution: LV -> lv, BE -> nl-BE, else en.
function resolveLocale(req: NextRequest): string {
  const countryHeader = req.headers.get('x-vercel-ip-country') || '';
  const country = countryHeader.toUpperCase();
  if (country === 'LV') return 'lv';
  if (country === 'BE') return 'nl-BE';
  return 'en';
}

export default function middleware(request: NextRequest) {
  const {nextUrl, cookies} = request;
  const pathname = nextUrl.pathname;

  // Handle old paths without locale - redirect to lv
  const oldPathsToRedirect = ['/ieteikumi', '/services', '/materials', '/reviews', '/projects', '/about', '/contact', '/blog'];
  if (oldPathsToRedirect.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    const redirectUrl = new URL(`/lv${pathname}`, nextUrl);
    return NextResponse.redirect(redirectUrl, 301);
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

  // Skip if already has locale prefix
  const hasLocalePrefix = /^\/(lv|en|nl-BE)(\/|$)/.test(pathname);

  // User preference cookie overrides geo
  const pref = cookies.get('preferred_locale')?.value;

  if (!hasLocalePrefix) {
    const locale = pref || resolveLocale(request);
    const redirectUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, nextUrl);
    const response = NextResponse.redirect(redirectUrl);
    // Persist preference to avoid repeated geo checks
    response.cookies.set('preferred_locale', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 180 // 180 days
    });
    return response;
  }

  // Allow manual locale switch via query (?setLocale=lv) and store cookie
  const setLocale = nextUrl.searchParams.get('setLocale');
  if (setLocale && ['lv','en','nl-BE'].includes(setLocale)) {
    const newUrl = new URL(pathname.replace(/^\/(lv|en|nl-BE)/, `/${setLocale}`) + nextUrl.search, nextUrl);
    const response = NextResponse.redirect(newUrl);
    response.cookies.set('preferred_locale', setLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 180
    });
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
