import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextRequest, NextResponse} from 'next/server';

const intlMiddleware = createMiddleware(routing);

// Geo-based locale resolution: LV -> lv, BE -> nl-BE, else en.
function resolveLocale(req: NextRequest): string {
  const countryHeader = req.headers.get('x-vercel-ip-country') || '';
  const country = (req.geo?.country || countryHeader).toUpperCase();
  if (country === 'LV') return 'lv';
  if (country === 'BE') return 'nl-BE';
  return 'en';
}

export default function middleware(request: NextRequest) {
  const {nextUrl, cookies} = request;
  const pathname = nextUrl.pathname;
  const hostname = request.headers.get('host') || '';

  // Redirect www to non-www
  if (hostname.startsWith('www.')) {
    const newUrl = new URL(request.url);
    newUrl.hostname = hostname.replace('www.', '');
    return NextResponse.redirect(newUrl, 301);
  }

  // Handle old paths without locale - redirect to lv
  if (pathname === '/ieteikumi' || pathname === '/services' || pathname === '/materials' || pathname === '/reviews') {
    const redirectUrl = new URL(`/lv${pathname}`, nextUrl);
    return NextResponse.redirect(redirectUrl, 301);
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
