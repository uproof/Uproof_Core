import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextRequest, NextResponse} from 'next/server';
import {latviaCities, belgiumCities} from '@/lib/cities';
import {SUPABASE_ACCESS_TOKEN_COOKIE} from '@/lib/supabase/session';
import {getCrmRedirectHost, isCrmHost, isInternalAuthPath, isLegacyInternalHost} from '@/lib/internalRouting';
import {createClient as createSupabaseMiddlewareClient, applySupabaseCookies} from '@/utils/supabase/middleware';

const intlMiddleware = createMiddleware(routing);
const LATVIA_CITY_SET = new Set<string>(latviaCities);
const BELGIUM_CITY_SET = new Set<string>(belgiumCities);

// Enforce canonical hosts (redirect www/admin aliases -> the intended host)
const CANONICAL_HOST = 'uproof.eu';

function enforceCanonicalHost(request: NextRequest) {
  const hostHeader = request.headers.get('host') || '';
  const host = hostHeader.split(':')[0];
  if (host && host.toLowerCase().startsWith('www.')) {
    const url = new URL(request.nextUrl.toString());
    url.hostname = CANONICAL_HOST;
    return NextResponse.redirect(url, 301);
  }
  return null;
}

function getLocaleFromPath(pathname: string) {
  const match = pathname.match(/^\/(lv|en|nl-BE)(\/|$)/);
  return match?.[1] || 'lv';
}

function redirectToHost(request: NextRequest, hostname: string, pathname?: string, supabaseResponse?: NextResponse | null) {
  const url = new URL(request.nextUrl.toString());
  url.hostname = hostname;
  if (pathname) {
    url.pathname = pathname;
  }
  return supabaseResponse ? applySupabaseCookies(NextResponse.redirect(url, 308), supabaseResponse) : NextResponse.redirect(url, 308);
}

function isCrawler(request: NextRequest): boolean {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  return /(googlebot|bingbot|yandexbot|duckduckbot|baiduspider|slurp|facebookexternalhit|twitterbot|linkedinbot|crawler|spider|bot)/.test(ua);
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodePayload(payload: string) {
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

function decodeJwtClaims(token: string) {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    return JSON.parse(decodePayload(parts[1])) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeJsonInit(init?: number | ResponseInit): ResponseInit | undefined {
  if (typeof init === 'number') {
    return {status: init};
  }

  return init;
}

async function getSessionRoleFromCookie(sessionToken: string | undefined, supabaseAccessToken: string | undefined): Promise<'sales' | 'superadmin' | null> {
  if (!sessionToken) return null;
  const parts = sessionToken.split('.');
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  if (!payload) return null;

  try {
    const secret = process.env.ADMIN_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || '';
    if (!secret) return null; // Enforce secret presence

    const keyData = new TextEncoder().encode(secret);
    const messageData = new TextEncoder().encode(payload);
    const cryptoKey = await crypto.subtle.importKey('raw', keyData, {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
    const digest = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const expectedSignature = base64UrlEncode(new Uint8Array(digest));
    if (signature !== expectedSignature) {
      return null;
    }

    const decoded = decodePayload(payload);
    const parsed = JSON.parse(decoded) as {role?: unknown};
    if (typeof (parsed as any).exp !== 'number' || Date.now() >= Number((parsed as any).exp)) {
      return null;
    }

    if (parsed.role === 'sales' || parsed.role === 'superadmin') {
      return parsed.role;
    }

    if (supabaseAccessToken) {
      const claims = decodeJwtClaims(supabaseAccessToken);
      const role = claims?.user_metadata && typeof claims.user_metadata === 'object'
        ? (claims.user_metadata as Record<string, unknown>).role
        : claims?.app_metadata && typeof claims.app_metadata === 'object'
          ? (claims.app_metadata as Record<string, unknown>).role
          : null;
      if (role === 'sales' || role === 'superadmin') {
        return role;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  // canonical host enforcement
  const canonicalResponse = enforceCanonicalHost(request);
  if (canonicalResponse) return canonicalResponse;

  const {supabaseResponse} = createSupabaseMiddlewareClient(request);

  const wrapResponse = (response: NextResponse) => applySupabaseCookies(response, supabaseResponse);
  const redirectWithCookies = (url: URL, status?: number) => wrapResponse(NextResponse.redirect(url, status));
  const nextWithCookies = () => wrapResponse(NextResponse.next());
  const jsonWithCookies = (body: unknown, init?: number | ResponseInit) => wrapResponse(NextResponse.json(body, normalizeJsonInit(init)));

  const {nextUrl, cookies} = request;
  const pathname = nextUrl.pathname;
  const hostHeader = request.headers.get('host') || '';
  const host = hostHeader.split(':')[0].toLowerCase();
  const crmHost = isCrmHost(host);
  const legacyInternalHost = isLegacyInternalHost(host);
  const setLocale = nextUrl.searchParams.get('setLocale');
  const isCrmPath = /^\/(lv|en|nl-BE)\/crm(\/|$)/.test(pathname);
  const isCrmLoginPath = /^\/(lv|en|nl-BE)\/crm\/login(\/|$)/.test(pathname);
  const isAdminCrmPath = /^\/(lv|en|nl-BE)\/admin\/crm(\/|$)/.test(pathname);
  const isAdminPath = /^\/(lv|en|nl-BE)\/admin(\/|$)/.test(pathname);
  const isApiAdminPath = /^\/api\/admin(\/|$)/.test(pathname);
  const isApiCrmPath = /^\/api\/crm(\/|$)/.test(pathname);
  const isApiSecurityPath = /^\/api\/security(\/|$)/.test(pathname);
  const isAdminPublicLoginPath = /^\/(lv|en|nl-BE)\/admin\/login(\/|$)/.test(pathname);
  const isApiAdminPublicPath = /^\/api\/admin\/(login|logout)(\/|$)/.test(pathname);
  const isInternalPath = isInternalAuthPath(pathname);
  const sessionToken = cookies.get('admin_session')?.value;
  const supabaseAccessToken = cookies.get(SUPABASE_ACCESS_TOKEN_COOKIE)?.value;
  const sessionRole = await getSessionRoleFromCookie(sessionToken, supabaseAccessToken);

  if (legacyInternalHost) {
    return redirectToHost(request, getCrmRedirectHost(host), undefined, supabaseResponse);
  }

  if (!crmHost && isInternalPath) {
    return redirectToHost(request, getCrmRedirectHost(host), undefined, supabaseResponse);
  }

  if (crmHost && !isInternalPath) {
    const locale = getLocaleFromPath(pathname);
    const landingPath = sessionRole === 'superadmin'
      ? `/${locale}/admin`
      : sessionRole === 'sales'
        ? `/${locale}/crm`
        : `/${locale}/login`;
    return redirectToHost(request, host, landingPath, supabaseResponse);
  }

  if (isCrmLoginPath) {
    const redirectUrl = new URL(nextUrl.toString());
    if (sessionRole === 'sales') {
      redirectUrl.pathname = pathname.replace(
        /\/crm\/login(?:\/)?$/,
        '/crm'
      );
      return redirectWithCookies(redirectUrl, 308);
    }
    redirectUrl.pathname = pathname.replace(/\/crm\/login(?:\/)?$/, '/crm-login');
    return wrapResponse(NextResponse.rewrite(redirectUrl));
  }

  if (isAdminPath && !isAdminPublicLoginPath) {
    if (!sessionRole) {
      const redirectUrl = new URL(nextUrl.toString());
      redirectUrl.pathname = pathname.replace(/^\/(lv|en|nl-BE)\/admin(?:\/.*)?$/, '/$1/admin/login');
      return redirectWithCookies(redirectUrl, 307);
    }
    if (sessionRole !== 'superadmin') {
      const redirectUrl = new URL(nextUrl.toString());
      redirectUrl.pathname = pathname.replace(/^\/(lv|en|nl-BE)\/admin(?:\/.*)?$/, '/$1/crm');
      return redirectWithCookies(redirectUrl, 307);
    }
  }

  if (isCrmPath && !isCrmLoginPath) {
    if (!sessionRole) {
      const redirectUrl = new URL(nextUrl.toString());
      redirectUrl.pathname = pathname.replace(/^\/(lv|en|nl-BE)\/crm(?:\/.*)?$/, '/$1/crm/login');
      return redirectWithCookies(redirectUrl, 307);
    }
    if (sessionRole === 'superadmin') {
      const redirectUrl = new URL(nextUrl.toString());
      redirectUrl.pathname = pathname.replace(/^\/(lv|en|nl-BE)\/crm(?:\/.*)?$/, '/$1/admin');
      return redirectWithCookies(redirectUrl, 307);
    }
  }

  if (isApiAdminPath && !isApiAdminPublicPath) {
    if (!sessionRole) {
      return jsonWithCookies({ok: false, error: 'Unauthorized'}, {status: 401});
    }
    if (sessionRole !== 'superadmin') {
      return jsonWithCookies({ok: false, error: 'Forbidden'}, {status: 403});
    }
  }

  if (isApiCrmPath || isApiSecurityPath) {
    if (!sessionRole) {
      return jsonWithCookies({ok: false, error: 'Unauthorized'}, {status: 401});
    }
  }

  // API routes are locale-agnostic; never apply locale redirects/rewrite logic to them.
  if (isApiAdminPath || isApiCrmPath || isApiSecurityPath) {
    return nextWithCookies();
  }

  if (isAdminPath || isCrmPath || isAdminCrmPath || isCrmLoginPath || isAdminPublicLoginPath) {
    if (!crmHost) {
      return redirectToHost(request, getCrmRedirectHost(host), undefined, supabaseResponse);
    }
  }

  // Allow explicit locale changes to win before any default-locale redirects.
  if (setLocale && ['lv', 'en', 'nl-BE'].includes(setLocale)) {
    const prefixMatch = pathname.match(/^\/(lv|en|nl-BE)(\/|$)/);
    const basePath = prefixMatch ? pathname.replace(/^\/(lv|en|nl-BE)/, '') || '' : pathname;
    const targetPath = basePath === '/' ? '' : basePath;
    const redirectUrl = new URL(`/${setLocale}${targetPath}`, nextUrl);
    const response = redirectWithCookies(redirectUrl);
    response.cookies.set('preferred_locale', setLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 180
    });
    return response;
  }

  // Redirect urgency directory without subpage to first urgency item.
  const urgencyDirectoryMatch = pathname.match(/^\/(lv|en|nl-BE)\/urgency\/?$/);
  if (urgencyDirectoryMatch) {
    const locale = urgencyDirectoryMatch[1];
    const redirectUrl = new URL(`/${locale}/urgency/caurs-jumts`, nextUrl);
    return redirectWithCookies(redirectUrl, 301);
  }

  // Normalize stacked/doubled locale paths like /lv/en/... or /en/lv/... to single locale.
  // These are typically malformed bot requests or parameter pollution attempts.
  const stackedLocaleMatch = pathname.match(/^\/(lv|en|nl-BE)\/(lv|en|nl-BE)(\/.*)?$/);
  if (stackedLocaleMatch) {
    const primaryLocale = stackedLocaleMatch[1];
    const remainder = stackedLocaleMatch[3] || '';
    const redirectUrl = new URL(`/${primaryLocale}${remainder}`, nextUrl);
    return redirectWithCookies(redirectUrl, 301);
  }

  // Normalize legacy /et paths that were left behind from older content exports.
  // Keep them on the closest current canonical pages instead of letting them 404.
  const legacyEtPathMap: Record<string, string> = {
    '/et/services/metallist-katuse-paigaldus': '/lv/services/valcprofila-montaza',
    '/et/services/katuse-ehitus': '/lv/services/jumta-buvnieciba',
    '/et/services/jumta-krasosana': '/lv/services/jumta-krasosana',
    '/et/services/valcprofila-montaza': '/lv/services/valcprofila-montaza',
    '/et/materials/metallist-profiilikatus': '/lv/materials/valcprofils',
    '/et/materials/shingli-katted': '/lv/materials/bitumena-rulli',
    '/et/materials/valcprofils': '/lv/materials/valcprofils',
  };
  const legacyEtMappedPath = legacyEtPathMap[pathname];
  if (legacyEtMappedPath) {
    const redirectUrl = new URL(legacyEtMappedPath, nextUrl);
    return redirectWithCookies(redirectUrl, 301);
  }

  const stackedLegacyEtMatch = pathname.match(/^\/(lv|en|nl-BE)\/et(\/.*)?$/);
  if (stackedLegacyEtMatch) {
    const locale = stackedLegacyEtMatch[1];
    const remainder = stackedLegacyEtMatch[2] || '';
    const legacyEtLocalePathMap: Record<string, string> = {
      '/materials/metallist-profiilikatus': '/materials/valcprofils',
      '/materials/shingli-katted': '/materials/bitumena-rulli',
      '/materials/valcprofils': '/materials/valcprofils',
      '/services/metallist-katuse-paigaldus': '/services/valcprofila-montaza',
      '/services/katuse-ehitus': '/services/jumta-buvnieciba',
      '/services/jumta-krasosana': '/services/jumta-krasosana',
      '/services/valcprofila-montaza': '/services/valcprofila-montaza',
    };
    const canonicalRemainder = legacyEtLocalePathMap[remainder] || remainder;
    const redirectUrl = new URL(`/${locale}${canonicalRemainder}`, nextUrl);
    return redirectWithCookies(redirectUrl, 301);
  }

  // Normalize malformed sitemap index paths such as /lv/sitemap-index.xml/urgency.
  const localizedSitemapIndexMatch = pathname.match(/^\/(lv|en|nl-BE)\/sitemap[-_]index\.xml(?:\/.+)?$/);
  if (localizedSitemapIndexMatch) {
    const redirectUrl = new URL('/sitemap_index.xml', nextUrl);
    return redirectWithCookies(redirectUrl, 301);
  }

  const sitemapIndexMatch = pathname.match(/^\/sitemap[-_]index\.xml\/.+$/);
  if (sitemapIndexMatch) {
    const redirectUrl = new URL('/sitemap_index.xml', nextUrl);
    return redirectWithCookies(redirectUrl, 301);
  }

  // Normalize malformed sitemap crawler paths such as /lv/sitemap.txt/services.
  const localizedSitemapTxtMatch = pathname.match(/^\/(lv|en|nl-BE)\/sitemap\.txt\/([a-z-]+)$/);
  if (localizedSitemapTxtMatch) {
    const sitemapName = localizedSitemapTxtMatch[2];
    const redirectUrl = new URL(`/sitemaps/${sitemapName}`, nextUrl);
    return redirectWithCookies(redirectUrl, 301);
  }

  const sitemapTxtMatch = pathname.match(/^\/sitemap\.txt\/([a-z-]+)$/);
  if (sitemapTxtMatch) {
    const sitemapName = sitemapTxtMatch[1];
    const redirectUrl = new URL(`/sitemaps/${sitemapName}`, nextUrl);
    return redirectWithCookies(redirectUrl, 301);
  }

  // Keep sitemap utility paths locale-agnostic to avoid crawler inconsistency.
  if (pathname.startsWith('/sitemaps/')) {
    return nextWithCookies();
  }

  // Handle malformed or crawler-generated 'news-sitemap.xml' requests.
  // Examples observed in logs:
  // - /lv/news-sitemap.xml/services  -> should serve /lv/services
  // - /news-sitemap.xml/services      -> should serve /services (defaults handled later)
  // - /news-sitemap.xml                -> redirect to canonical blog sitemap
  const localizedNewsSitemapMatch = pathname.match(/^\/(lv|en|nl-BE)\/news-sitemap\.xml(?:\/(.*))?$/);
  if (localizedNewsSitemapMatch) {
    const locale = localizedNewsSitemapMatch[1];
    const remainder = localizedNewsSitemapMatch[2];
    if (!remainder) {
      // /lv/news-sitemap.xml -> blog sitemap
      const redirectUrl = new URL('/blog-sitemap.xml', nextUrl);
      return redirectWithCookies(redirectUrl, 301);
    }
    // /lv/news-sitemap.xml/services/... -> /lv/services/...
    const redirectUrl = new URL(`/${locale}/${remainder}`, nextUrl);
    return redirectWithCookies(redirectUrl, 301);
  }

  const newsSitemapMatch = pathname.match(/^\/news-sitemap\.xml(?:\/(.*))?$/);
  if (newsSitemapMatch) {
    const remainder = newsSitemapMatch[1];
    if (!remainder) {
      // /news-sitemap.xml -> blog sitemap
      const redirectUrl = new URL('/blog-sitemap.xml', nextUrl);
      return redirectWithCookies(redirectUrl, 301);
    }
    // /news-sitemap.xml/services/... -> strip prefix and let normal routing apply
    // Prefer redirect to the stripped path so middleware logic and locale detection runs consistently.
    const redirectUrl = new URL(`/${remainder}`, nextUrl);
    return redirectWithCookies(redirectUrl, 301);
  }

  // Handle malformed sitemap.html patterns (e.g., /sitemap.html/privacy-policy).
  // These are bot-injected paths with incorrect file extensions; redirect to canonical sitemap.
  const sitemapHtmlMatch = pathname.match(/^\/sitemap\.html(?:\/(.*))?$/);
  if (sitemapHtmlMatch) {
    const redirectUrl = new URL('/sitemap_index.xml', nextUrl);
    return redirectWithCookies(redirectUrl, 301);
  }

  // Redirect well-known files requested under locale prefix to root.
  // Bots sometimes probe /{locale}/.well-known/*, but these must be at root.
  // Example: /lv/apple-app-site-association -> /.well-known/apple-app-site-association
  const localizedWellKnownMatch = pathname.match(/^\/(lv|en|nl-BE)\/(apple-app-site-association|well-known\/.+)$/);
  if (localizedWellKnownMatch) {
    const wellKnownPath = localizedWellKnownMatch[2];
    const redirectUrl = wellKnownPath.startsWith('apple-app-site-association')
      ? new URL('/.well-known/apple-app-site-association', nextUrl)
      : new URL(`/.well-known/${wellKnownPath.replace('well-known/', '')}`, nextUrl);
    return redirectWithCookies(redirectUrl, 301);
  }

  // Handle old paths without locale - redirect to lv
  const oldPathsToRedirect = ['/ieteikumi', '/services', '/materials', '/reviews', '/projects', '/about', '/contact', '/blog'];
  if (oldPathsToRedirect.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    const redirectUrl = new URL(`/lv${pathname}`, nextUrl);
    return redirectWithCookies(redirectUrl, 301);
  }

  // Normalize mismatched locale/city combinations to canonical locale URLs.
  const cityPathMatch = pathname.match(/^\/(lv|en|nl-BE)\/cities\/([a-z-]+)$/);
  if (cityPathMatch) {
    const localePrefix = cityPathMatch[1];
    const city = cityPathMatch[2];

    if (localePrefix === 'nl-BE' && LATVIA_CITY_SET.has(city)) {
      const redirectUrl = new URL(`/en/cities/${city}`, nextUrl);
      return redirectWithCookies(redirectUrl, 301);
    }

    if ((localePrefix === 'lv' || localePrefix === 'en') && BELGIUM_CITY_SET.has(city)) {
      const redirectUrl = new URL(`/nl-BE/cities/${city}`, nextUrl);
      return redirectWithCookies(redirectUrl, 301);
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
      return redirectWithCookies(redirectUrl, 301);
    }

    const mapped = latvianToEnglishPaths[subpath];
    if (mapped) {
      const redirectUrl = new URL(`/${localePrefix}${mapped}`, nextUrl);
      return redirectWithCookies(redirectUrl, 301);
    }
  }

  // Skip if already has locale prefix; the URL locale should control rendering.
  const hasLocalePrefix = /^\/(lv|en|nl-BE)(\/|$)/.test(pathname);

  const crawler = isCrawler(request);

  if (!hasLocalePrefix) {
    const redirectUrl = new URL(`/lv${pathname === '/' ? '' : pathname}`, nextUrl);
    const response = redirectWithCookies(redirectUrl, 308);
    if (!crawler) {
      response.cookies.set('preferred_locale', 'lv', {
        path: '/',
        maxAge: 60 * 60 * 24 * 180 // 180 days
      });
    }
    return response;
  }

  // Delegate to next-intl middleware for locale routing
  return wrapResponse(intlMiddleware(request));
}

export const config = {
  matcher: [
    '/',
    '/api/admin/:path*',
    '/api/crm/:path*',
    '/(lv|en|nl-BE)/:path*',
    // Exclude API routes, static files, and well-known paths
    '/((?!api|_next/static|_next/image|favicon.ico|images|uploads|models|videos|.*\\..*|\\.well-known).*)'
  ]
};
