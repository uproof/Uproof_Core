import {config as loadEnv} from 'dotenv';
import {createHmac, randomBytes, randomUUID} from 'crypto';

loadEnv({path: '.env.crm.local'});

const baseUrl = process.env.CRM_TEST_BASE_URL || 'http://localhost:3000';

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function cookieHeaderFromSetCookie(setCookieValue, cookieName) {
  if (!setCookieValue) {
    return '';
  }

  const cookies = setCookieValue.split(/,(?=\s*[^;,=]+=[^;,]*)/g);
  const match = cookies.find((cookie) => cookie.trim().startsWith(`${cookieName}=`));
  return match ? match.split(';')[0].trim() : '';
}

function buildSignedAdminSessionCookie(email, role = 'superadmin') {
  const secret = process.env.ADMIN_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || '';
  if (!secret) {
    throw new Error('ADMIN_TOKEN_SECRET is required for auth-guard tests');
  }

  const payload = {
    sub: 'admin',
    email,
    role,
    sid: randomUUID(),
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(payloadB64).digest('base64url');
  return `admin_session=${payloadB64}.${signature}`;
}

async function readResponse(response) {
  const text = await response.text();
  try {
    return {status: response.status, ok: response.ok, data: text ? JSON.parse(text) : null, text};
  } catch {
    return {status: response.status, ok: response.ok, data: text, text};
  }
}

async function request(path, {method = 'GET', body, cookie = '', redirect = 'follow'} = {}) {
  const response = await fetch(new URL(path, baseUrl), {
    method,
    redirect,
    headers: {
      ...(cookie ? {Cookie: cookie} : {}),
      ...(body ? {'content-type': 'application/json'} : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return {...await readResponse(response), setCookie: response.headers.get('set-cookie') || '', location: response.headers.get('location') || ''};
}

async function main() {
  const adminEmail = process.env.SUPERADMIN_EMAIL_1?.trim().toLowerCase() || '';
  const adminPassword = process.env.SUPERADMIN_PASSWORD_1?.trim() || '';
  if (!adminEmail || !adminPassword) {
    fail('SUPERADMIN_EMAIL_1 and SUPERADMIN_PASSWORD_1 are required');
  }

  const adminLogin = await request('/api/admin/login', {
    method: 'POST',
    body: {email: adminEmail, password: adminPassword, role: 'superadmin'},
  });

  assert(adminLogin.ok && adminLogin.data?.ok === true, `Superadmin login failed: ${adminLogin.text}`);
  const adminCookie = cookieHeaderFromSetCookie(adminLogin.setCookie, 'admin_session') || buildSignedAdminSessionCookie(adminEmail, 'superadmin');

  const salesEmail = `guard-sales-${randomBytes(4).toString('hex')}@example.com`;
  const salesPassword = `Guard!${randomBytes(4).toString('hex')}A1`;

  const createSalesUser = await request('/api/crm/users', {
    method: 'POST',
    cookie: adminCookie,
    body: {email: salesEmail, name: 'Guard Sales User', password: salesPassword},
  });

  assert(createSalesUser.ok && createSalesUser.data?.ok === true, `Sales user creation failed: ${createSalesUser.text}`);

  const salesLogin = await request('/api/admin/login', {
    method: 'POST',
    body: {email: salesEmail, password: salesPassword, role: 'sales'},
  });

  assert(salesLogin.ok && salesLogin.data?.ok === true, `Sales login failed: ${salesLogin.text}`);
  const salesCookie = cookieHeaderFromSetCookie(salesLogin.setCookie, 'admin_session');
  assert(salesCookie, 'Sales login did not return a session cookie');

  const adminPage = await request('/lv/admin', {cookie: salesCookie, redirect: 'manual'});
  assert(adminPage.status >= 300 && adminPage.status < 400, `Sales user should be redirected away from /admin, got ${adminPage.status}`);

  const adminApi = await request('/api/admin/users', {cookie: salesCookie});
  assert(adminApi.status === 403, `Sales user should get 403 on /api/admin/users, got ${adminApi.status}`);

  const crmApi = await request('/api/crm/leads', {cookie: salesCookie});
  assert(crmApi.status === 200, `Sales user should access /api/crm/leads, got ${crmApi.status}`);

  console.log('Auth guard smoke test summary');
  console.log('- Sales user blocked from /admin: ok');
  console.log('- Sales user blocked from /api/admin/users: ok');
  console.log('- Sales user allowed into /api/crm/leads: ok');
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});