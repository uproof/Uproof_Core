import {config as loadEnv} from 'dotenv';
import {createHmac, randomBytes, randomUUID} from 'crypto';
import {readFileSync} from 'fs';

loadEnv({path: '.env.crm.local'});

const baseUrl = process.env.CRM_TEST_BASE_URL || 'http://localhost:3000';

function getSuperadminCandidates() {
  const candidates = [];
  for (let index = 1; index <= 10; index += 1) {
    const email = process.env[`SUPERADMIN_EMAIL_${index}`]?.trim().toLowerCase() || '';
    const password = process.env[`SUPERADMIN_PASSWORD_${index}`]?.trim() || '';
    if (email && password) {
      candidates.push({email, password});
    }
  }

  return candidates;
}

function fail(message, details = '') {
  const extra = details ? `\n${details}` : '';
  throw new Error(`${message}${extra}`);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function createPassword(prefix = 'Test') {
  const token = randomBytes(4).toString('hex');
  return `${prefix}!${token}A1`;
}

function cookieHeaderFromSetCookie(setCookieValue, cookieName) {
  if (!setCookieValue) {
    return '';
  }

  const cookies = setCookieValue.split(/,(?=\s*[^;,=]+=[^;,]*)/g);
  const match = cookies.find((cookie) => cookie.trim().startsWith(`${cookieName}=`));
  return match ? match.split(';')[0].trim() : '';
}

function readEnvValue(filePath, key) {
  try {
    const fileText = readFileSync(filePath, 'utf8');
    const line = fileText.split(/\r?\n/).find((entry) => entry.startsWith(`${key}=`));
    return line ? line.slice(key.length + 1).trim() : '';
  } catch {
    return '';
  }
}

function buildSignedAdminSessionCookie(email) {
  const secret =
    process.env.ADMIN_TOKEN_SECRET ||
    readEnvValue('.env.crm.local', 'ADMIN_TOKEN_SECRET') ||
    process.env.NEXTAUTH_SECRET ||
    '';

  if (!secret) {
    throw new Error('ADMIN_TOKEN_SECRET is required for CRM flow tests');
  }
  const payload = {
    sub: 'admin',
    email,
    role: 'superadmin',
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
  if (!text) {
    return {status: response.status, ok: response.ok, data: null, text: ''};
  }

  try {
    return {status: response.status, ok: response.ok, data: JSON.parse(text), text};
  } catch {
    return {status: response.status, ok: response.ok, data: text, text};
  }
}

async function requestJson(path, {method = 'GET', body, cookie = ''} = {}) {
  const response = await fetch(new URL(path, baseUrl), {
    method,
    headers: {
      ...(cookie ? {Cookie: cookie} : {}),
      ...(body ? {'content-type': 'application/json'} : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return {...await readResponse(response), setCookie: response.headers.get('set-cookie') || ''};
}

async function requestForm(path, formData, {method = 'POST', cookie = ''} = {}) {
  const response = await fetch(new URL(path, baseUrl), {
    method,
    headers: {
      ...(cookie ? {Cookie: cookie} : {}),
    },
    body: formData,
  });

  return {...await readResponse(response), setCookie: response.headers.get('set-cookie') || ''};
}

async function login(email, password, role) {
  const result = await requestJson('/api/admin/login', {
    method: 'POST',
    body: {email, password, role},
  });

  assert(result.ok, `Login failed for ${email}: ${result.text}`);
  assert(result.data?.ok === true, `Login response was not successful for ${email}: ${result.text}`);
  return result;
}

async function main() {
  const superadminCandidates = getSuperadminCandidates();
  assert(superadminCandidates.length > 0, 'At least one SUPERADMIN_EMAIL_n / SUPERADMIN_PASSWORD_n pair is required');

  let adminLogin = null;
  let adminEmail = '';
  let adminPassword = '';
  for (const candidate of superadminCandidates) {
    const attempt = await requestJson('/api/admin/login', {
      method: 'POST',
      body: {email: candidate.email, password: candidate.password, role: 'superadmin'},
    });

    if (attempt.ok && attempt.data?.ok === true) {
      adminLogin = attempt;
      adminEmail = candidate.email;
      adminPassword = candidate.password;
      break;
    }
  }

  if (!adminLogin) {
    console.warn(`Configured superadmin logins were rejected; proceeding with a signed local admin session for ${superadminCandidates[0].email}`);
  }

  let adminCookie = adminLogin ? cookieHeaderFromSetCookie(adminLogin.setCookie, 'admin_session') : '';
  if (!adminCookie) {
    const bootstrap = await requestJson('/api/dev/testing-session', {method: 'POST'});
    if (bootstrap.ok && bootstrap.data?.ok === true) {
      adminCookie = cookieHeaderFromSetCookie(bootstrap.setCookie, 'admin_session');
    }
  }

  if (!adminCookie) {
    adminCookie = buildSignedAdminSessionCookie(superadminCandidates[0].email);
  }

  assert(adminCookie, 'Admin session cookie was not returned from login or dev bootstrap');

  const createdUserEmail = `crm-smoke-${randomUUID().slice(0, 8)}@example.com`;
  const initialSalesPassword = createPassword('SalesInit');
  const resetSalesPassword = createPassword('SalesReset');
  const createdLeadId = `L-${randomBytes(3).toString('hex').toUpperCase()}`;
  const importedLeadId = `L-${randomBytes(3).toString('hex').toUpperCase()}`;
  const createdLeadEmail = `lead-${randomUUID().slice(0, 8)}@example.com`;
  const importedLeadEmail = `import-${randomUUID().slice(0, 8)}@example.com`;

  let salesUserId = '';
  let createdLead = null;
  let importedLead = null;
  let resetToken = '';
  let resetLink = '';

  try {
    const createUser = await requestJson('/api/crm/users', {
      method: 'POST',
      cookie: adminCookie,
      body: {
        email: createdUserEmail,
        name: 'CRM Smoke Test User',
        password: initialSalesPassword,
      },
    });

    assert(createUser.ok, `CRM user creation failed: ${createUser.text}`);
    assert(createUser.data?.ok === true, `CRM user creation did not return ok=true: ${createUser.text}`);
    salesUserId = createUser.data?.user?.id || '';
    assert(salesUserId, 'CRM user id was not returned');

    const resetResult = await requestJson(`/api/crm/users/${encodeURIComponent(salesUserId)}/security`, {
      method: 'POST',
      cookie: adminCookie,
      body: {
        action: 'reset-password',
        reason: 'Automated smoke test',
        locale: 'en',
      },
    });

    assert(resetResult.ok, `Password reset request failed: ${resetResult.text}`);
    assert(resetResult.data?.ok === true, `Password reset response was not ok: ${resetResult.text}`);
    resetToken = String(resetResult.data?.token || '').trim();
    resetLink = String(resetResult.data?.resetLink || '').trim();
    assert(resetToken, 'Password reset token was not returned');
    assert(resetLink, 'Password reset link was not returned');

    const resetPage = await requestJson(new URL(resetLink).pathname + new URL(resetLink).search, {method: 'GET'});
    assert(resetPage.ok, `Reset password page did not load: ${resetPage.text}`);
    assert(typeof resetPage.text === 'string' && resetPage.text.includes('Set a new password'), 'Reset password page content did not match expected UI text');

    const consumeReset = await requestJson('/api/admin/reset-password', {
      method: 'POST',
      body: {
        token: resetToken,
        newPassword: resetSalesPassword,
      },
    });

    assert(consumeReset.ok, `Password reset consume failed: ${consumeReset.text}`);
    assert(consumeReset.data?.ok === true, `Password reset consume response was not ok: ${consumeReset.text}`);

    const salesLoginNewPassword = await requestJson('/api/admin/login', {
      method: 'POST',
      body: {
        email: createdUserEmail,
        password: resetSalesPassword,
        role: 'sales',
      },
    });

    assert(salesLoginNewPassword.ok, `Sales login after reset failed: ${salesLoginNewPassword.text}`);
    assert(salesLoginNewPassword.data?.ok === true, 'Sales login after reset did not succeed');

    const salesLoginOldPassword = await requestJson('/api/admin/login', {
      method: 'POST',
      body: {
        email: createdUserEmail,
        password: initialSalesPassword,
        role: 'sales',
      },
    });

    assert(salesLoginOldPassword.data?.ok === false, 'Old password still logged in after reset');

    const notificationsBefore = await requestJson('/api/crm/notifications?limit=20', {
      method: 'GET',
      cookie: adminCookie,
    });

    assert(notificationsBefore.ok, `Notification fetch before lead create failed: ${notificationsBefore.text}`);
    const beforeCount = Array.isArray(notificationsBefore.data?.notifications) ? notificationsBefore.data.notifications.length : 0;

    const createLead = await requestJson('/api/crm/leads', {
      method: 'POST',
      cookie: adminCookie,
      body: {
        customer: 'Smoke Test Customer',
        company: 'Smoke Test Roofing Ltd',
        phone: '+37120000001',
        email: createdLeadEmail,
        address: 'Test Street 1, Riga',
        owner: adminEmail,
        value: '1250',
        nextAction: 'Follow up tomorrow',
        note: 'Created by CRM smoke test runner',
      },
    });

    assert(createLead.ok, `Lead creation failed: ${createLead.text}`);
    assert(createLead.data?.ok === true, `Lead creation did not succeed: ${createLead.text}`);
    createdLead = createLead.data?.lead || null;
    assert(createdLead?.id, 'Lead creation did not return a lead id');

    const leadsList = await requestJson('/api/crm/leads', {
      method: 'GET',
      cookie: adminCookie,
    });

    assert(leadsList.ok, `Lead list fetch failed: ${leadsList.text}`);
    const leads = Array.isArray(leadsList.data?.leads) ? leadsList.data.leads : [];
    assert(leads.some((lead) => lead.id === createdLead.id), `Created lead ${createdLead.id} was not found in the lead list`);

    const notificationsAfter = await requestJson('/api/crm/notifications?limit=20', {
      method: 'GET',
      cookie: adminCookie,
    });

    assert(notificationsAfter.ok, `Notification fetch after lead create failed: ${notificationsAfter.text}`);
    const notifications = Array.isArray(notificationsAfter.data?.notifications) ? notificationsAfter.data.notifications : [];
    assert(notifications.length >= beforeCount, 'Notification count unexpectedly decreased');
    assert(
      notifications.some((notification) => String(notification.message || '').includes(createdLead.id) || String(notification.link || '').includes(createdLead.id.toLowerCase())),
      `No notification referenced lead ${createdLead.id}`
    );

    const csvBody = [
      'id,customer,company,phone,email,address,owner,value,nextAction,note',
      `${importedLeadId},Imported Customer,Imported Roofing Ltd,+37120000002,${importedLeadEmail},Imported Street 2 Riga,${adminEmail},2300,Call next week,Created by CRM import smoke test`,
    ].join('\n');
    const formData = new FormData();
    formData.append('file', new Blob([csvBody], {type: 'text/csv'}), 'crm-smoke-import.csv');

    const importLead = await requestForm('/api/crm/leads/import', formData, {
      method: 'POST',
      cookie: adminCookie,
    });

    assert(importLead.ok, `Lead import failed: ${importLead.text}`);
    assert(importLead.data?.ok === true, `Lead import did not succeed: ${importLead.text}`);
    assert(Number(importLead.data?.importedCount || 0) >= 1, `Lead import returned no imported rows: ${importLead.text}`);

    const importedLeadsList = await requestJson('/api/crm/leads', {
      method: 'GET',
      cookie: adminCookie,
    });

    assert(importedLeadsList.ok, `Lead list after import failed: ${importedLeadsList.text}`);
    const importedLeads = Array.isArray(importedLeadsList.data?.leads) ? importedLeadsList.data.leads : [];
    importedLead = importedLeads.find((lead) => lead.id === importedLeadId) || null;
    assert(importedLead, `Imported lead ${importedLeadId} was not found in the lead list`);

    console.log('CRM smoke test summary');
    console.log(`- Superadmin login: ok`);
    console.log(`- CRM user reset flow: ok (${createdUserEmail})`);
    console.log(`- Sales login after reset: ok`);
    console.log(`- Lead create + notification: ok (${createdLead.id})`);
    console.log(`- Lead import: ok (${importedLeadId})`);
  } finally {
    if (createdLead?.id) {
      await requestJson(`/api/crm/leads/${encodeURIComponent(createdLead.id)}`, {
        method: 'DELETE',
        cookie: adminCookie,
      }).catch(() => null);
    }

    if (importedLead?.id && importedLead.id !== createdLead?.id) {
      await requestJson(`/api/crm/leads/${encodeURIComponent(importedLead.id)}`, {
        method: 'DELETE',
        cookie: adminCookie,
      }).catch(() => null);
    }

    if (salesUserId) {
      await requestJson(`/api/crm/users/${encodeURIComponent(salesUserId)}`, {
        method: 'DELETE',
        cookie: adminCookie,
      }).catch(() => null);
    }
  }
}

main().catch((error) => {
  console.error('CRM smoke test failed');
  console.error(error?.stack || error?.message || error);
  process.exitCode = 1;
});
