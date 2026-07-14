export const CRM_HOST = 'crm.uproof.eu';
export const LEGACY_ADMIN_HOST = 'admin.uproof.eu';

export function getCrmRedirectHost(host: string) {
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.localhost') ? 'crm.localhost' : CRM_HOST;
}

export function isCrmHost(host: string) {
  return host === CRM_HOST || host === 'crm.localhost';
}

export function isLegacyInternalHost(host: string) {
  return host === LEGACY_ADMIN_HOST || host === 'admin.localhost';
}

export function isInternalAuthPath(pathname: string) {
  return (
    /^\/(login|crm-login)(\/|$)/.test(pathname) ||
    /^\/(lv|en|nl-BE)\/(login|crm-login)(\/|$)/.test(pathname) ||
    /^\/(admin|crm|mfa)(\/|$)/.test(pathname) ||
    /^\/(lv|en|nl-BE)\/(admin|crm|mfa)(\/|$)/.test(pathname) ||
    /^\/api\/(admin|crm|security)(\/|$)/.test(pathname)
  );
}
