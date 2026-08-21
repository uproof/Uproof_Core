import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextRequest, NextResponse} from 'next/server';
import {SUPABASE_ACCESS_TOKEN_COOKIE} from '@/lib/supabase/session';
import {getCmsRedirectHost, getCrmRedirectHost, isCmsHost, isCrmHost, isInternalAuthPath, isLegacyInternalHost} from '@/lib/internalRouting';
import {createClient as createSupabaseMiddlewareClient, applySupabaseCookies} from '@/utils/supabase/middleware';
import {isSuperadminRole} from '@/lib/crmRoles';

const intlMiddleware = createMiddleware(routing);

function getLocaleFromPath(pathname: string) {
  const match = pathname.match(/^\/(lv|en|nl-BE)(\/|$)/);
  return match?.[1] || 'lv';
}

function redirectToHost(request: NextRequest, hostname: string, pathname?: string, supabaseResponse?: NextResponse | null) {
  const url = new URL(request.nextUrl.toString());
  url.hostname = hostname;
  if (pathname) url.pathname = pathname;
  const response = NextResponse.redirect(url, 308);
  return supabaseResponse ? applySupabaseCookies(response, supabaseResponse) : response;
}

function base64UrlEncode(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodePayload(payload: string) {
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  return atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
}

function decodeJwtClaims(token: string) {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try { return JSON.parse(decodePayload(parts[1])) as Record<string, unknown>; } catch { return null; }
}

async function getSessionRoleFromCookie(sessionToken: string | undefined, supabaseAccessToken: string | undefined): Promise<'sales' | 'superadmin' | null> {
  if (!sessionToken) return null;
  const parts = sessionToken.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;

  try {
    const secret = process.env.ADMIN_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || '';
    if (!secret) return null;
    const keyData = new TextEncoder().encode(secret);
    const messageData = new TextEncoder().encode(payload);
    const cryptoKey = await crypto.subtle.importKey('raw', keyData, {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
    const digest = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    if (signature !== base64UrlEncode(new Uint8Array(digest))) return null;

    const parsed = JSON.parse(decodePayload(payload)) as {role?: unknown; exp?: unknown};
    if (typeof parsed.exp !== 'number' || Date.now() >= parsed.exp) return null;
    if (parsed.role === 'sales' || parsed.role === 'superadmin') return parsed.role;

    if (supabaseAccessToken) {
      const claims = decodeJwtClaims(supabaseAccessToken);
      const metadata = claims?.user_metadata && typeof claims.user_metadata === 'object'
        ? claims.user_metadata
        : claims?.app_metadata && typeof claims.app_metadata === 'object'
          ? claims.app_metadata
          : null;
      const role = metadata && typeof (metadata as Record<string, unknown>).role === 'string'
        ? (metadata as Record<string, unknown>).role
        : null;
      if (role === 'sales' || role === 'superadmin') return role;
    }
  } catch {
    return null;
  }
  return null;
}

export default async function middleware(request: NextRequest) {
  const {supabaseResponse} = createSupabaseMiddlewareClient(request);
  const wrap = (response: NextResponse) => applySupabaseCookies(response, supabaseResponse);
  const json = (body: unknown, status: number) => wrap(NextResponse.json(body, {status}));
  const next = () => wrap(NextResponse.next());

  const {nextUrl, cookies} = request;
  const pathname = nextUrl.pathname;
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase();
  const crmHost = isCrmHost(host);
  const cmsHost = isCmsHost(host);
  const internalPath = isInternalAuthPath(pathname);
  const locale = getLocaleFromPath(pathname);
  const isCrmPath = /^\/(lv|en|nl-BE)\/crm(\/|$)/.test(pathname);
  const isCrmLoginPath = /^\/(lv|en|nl-BE)\/crm\/login(\/|$)/.test(pathname);
  const isAdminPath = /^\/(lv|en|nl-BE)\/admin(\/|$)/.test(pathname);
  const isAdminLoginPath = /^\/(lv|en|nl-BE)\/admin\/login(\/|$)/.test(pathname);
  const isUnlocalizedAdminPath = /^\/admin(\/|$)/.test(pathname);
  const isApiAdminPath = /^\/api\/admin(\/|$)/.test(pathname);
  const isApiCrmPath = /^\/api\/crm(\/|$)/.test(pathname);
  const isApiSecurityPath = /^\/api\/security(\/|$)/.test(pathname);
  const isApiPublicAuthPath = /^\/api\/admin\/(login|logout)(\/|$)/.test(pathname);
  const sessionRole = await getSessionRoleFromCookie(
    cookies.get('admin_session')?.value,
    cookies.get(SUPABASE_ACCESS_TOKEN_COOKIE)?.value,
  );

  if (isLegacyInternalHost(host)) return redirectToHost(request, getCmsRedirectHost(host), undefined, supabaseResponse);
  if (!crmHost && !cmsHost && internalPath) return redirectToHost(request, isAdminPath || isAdminLoginPath ? getCmsRedirectHost(host) : getCrmRedirectHost(host), undefined, supabaseResponse);

  if (crmHost && isAdminPath) {
    return redirectToHost(request, host, `/${locale}/admin`, supabaseResponse);
  }

  if (crmHost && isUnlocalizedAdminPath) {
    const preferredLocale = cookies.get('preferred_locale')?.value;
    const adminLocale = preferredLocale && ['lv', 'en', 'nl-BE'].includes(preferredLocale) ? preferredLocale : 'en';
    return redirectToHost(request, host, `/${adminLocale}${pathname}`, supabaseResponse);
  }

  if (cmsHost && isCrmPath) {
    return redirectToHost(request, getCrmRedirectHost(host), `/${locale}/crm`, supabaseResponse);
  }

  if (crmHost && !internalPath) {
    const landing = sessionRole && isSuperadminRole(sessionRole) ? `/${locale}/admin` : sessionRole ? `/${locale}/crm` : `/${locale}/login`;
    return redirectToHost(request, host, landing, supabaseResponse);
  }

  if (cmsHost && !internalPath) {
    const landing = sessionRole && isSuperadminRole(sessionRole) ? `/${locale}/admin` : sessionRole ? `/${locale}/crm` : `/${locale}/admin/login`;
    return redirectToHost(request, host, landing, supabaseResponse);
  }

  if (isCrmLoginPath) {
    if (sessionRole === 'sales') {
      const url = new URL(nextUrl.toString());
      url.pathname = pathname.replace(/\/crm\/login\/?$/, '/crm');
      return redirectToHost(request, host, url.pathname, supabaseResponse);
    }
    const url = new URL(nextUrl.toString());
    url.pathname = pathname.replace(/\/crm\/login\/?$/, '/crm-login');
    return wrap(NextResponse.rewrite(url));
  }

  if (isAdminPath && !isAdminLoginPath) {
    if (!sessionRole) return redirectToHost(request, host, `/${locale}/admin/login`, supabaseResponse);
    if (!isSuperadminRole(sessionRole)) return redirectToHost(request, host, `/${locale}/crm`, supabaseResponse);
  }

  if (isCrmPath && !isCrmLoginPath) {
    if (!sessionRole) return redirectToHost(request, host, `/${locale}/crm/login`, supabaseResponse);
    if (isSuperadminRole(sessionRole)) return redirectToHost(request, host, `/${locale}/admin`, supabaseResponse);
  }

  if (isApiAdminPath && !isApiPublicAuthPath) {
    if (!sessionRole) return json({ok: false, error: 'Unauthorized'}, 401);
    if (sessionRole !== 'superadmin') return json({ok: false, error: 'Forbidden'}, 403);
  }
  if (isApiCrmPath || isApiSecurityPath) {
    if (!sessionRole) return json({ok: false, error: 'Unauthorized'}, 401);
  }
  if (isApiAdminPath || isApiCrmPath || isApiSecurityPath) return next();

  if (isAdminPath || isCrmPath || isCrmLoginPath || isAdminLoginPath) {
    if (!crmHost && !cmsHost) return redirectToHost(request, isAdminPath || isAdminLoginPath ? getCmsRedirectHost(host) : getCrmRedirectHost(host), undefined, supabaseResponse);
  }

  const setLocale = nextUrl.searchParams.get('setLocale');
  if (setLocale && ['lv', 'en', 'nl-BE'].includes(setLocale)) {
    const basePath = pathname.replace(/^\/(lv|en|nl-BE)/, '') || '';
    const response = redirectToHost(request, host, `/${setLocale}${basePath}`, supabaseResponse);
    response.cookies.set('preferred_locale', setLocale, {path: '/', maxAge: 60 * 60 * 24 * 180});
    return response;
  }

  // No public pages exist in this deployment. Any non-internal request on the
  // CRM host returns to the authenticated internal entry point above.
  return wrap(intlMiddleware(request));
}

export const config = {
  matcher: [
    '/',
    '/api/admin/:path*',
    '/api/crm/:path*',
    '/api/security/:path*',
    '/(lv|en|nl-BE)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|\\.well-known).*)',
  ],
};
