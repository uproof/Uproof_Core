import crypto from 'crypto';

const PASSWORD_ALGO = 'scrypt';
const PASSWORD_SALT_BYTES = 16;
const PASSWORD_KEY_BYTES = 64;
const PASSWORD_COST = 16384;
const PASSWORD_BLOCK_SIZE = 8;
const PASSWORD_PARALLELIZATION = 1;

const SECRET_ALGO = 'aes-256-gcm';
const SECRET_IV_BYTES = 12;

function getVaultSecret() {
  const secret = (
    process.env.CRM_DATA_SECRET ||
    process.env.ADMIN_TOKEN_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    ''
  ).trim();

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRM_DATA_SECRET or ADMIN_TOKEN_SECRET is required in production');
    }

    return 'dev-secret-change-me';
  }

  return secret;
}

function getSecretKey() {
  return crypto.createHash('sha256').update(getVaultSecret()).digest();
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(PASSWORD_SALT_BYTES);
  const derived = crypto.scryptSync(password, salt, PASSWORD_KEY_BYTES, {
    N: PASSWORD_COST,
    r: PASSWORD_BLOCK_SIZE,
    p: PASSWORD_PARALLELIZATION,
  });

  return [
    PASSWORD_ALGO,
    PASSWORD_COST,
    PASSWORD_BLOCK_SIZE,
    PASSWORD_PARALLELIZATION,
    salt.toString('base64url'),
    derived.toString('base64url'),
  ].join('$');
}

export function verifyPassword(password: string, encoded: string) {
  const parts = String(encoded || '').split('$');
  if (parts.length !== 6 || parts[0] !== PASSWORD_ALGO) {
    return false;
  }

  const cost = Number(parts[1]);
  const blockSize = Number(parts[2]);
  const parallelization = Number(parts[3]);
  const salt = Buffer.from(parts[4], 'base64url');
  const expected = Buffer.from(parts[5], 'base64url');

  if (!Number.isFinite(cost) || !Number.isFinite(blockSize) || !Number.isFinite(parallelization)) {
    return false;
  }

  const derived = crypto.scryptSync(password, salt, expected.length, {
    N: cost,
    r: blockSize,
    p: parallelization,
  });

  return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
}

export function encryptSecret(secret: string) {
  const iv = crypto.randomBytes(SECRET_IV_BYTES);
  const cipher = crypto.createCipheriv(SECRET_ALGO, getSecretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ['enc', 'v1', iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join(':');
}

export function decryptSecret(payload: string) {
  const parts = String(payload || '').split(':');
  if (parts.length !== 5 || parts[0] !== 'enc' || parts[1] !== 'v1') {
    return '';
  }

  const iv = Buffer.from(parts[2], 'base64url');
  const tag = Buffer.from(parts[3], 'base64url');
  const encrypted = Buffer.from(parts[4], 'base64url');
  const decipher = crypto.createDecipheriv(SECRET_ALGO, getSecretKey(), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

export function normalizeSecretInput(value: string) {
  return String(value || '').trim();
}

export function validatePasswordPolicy(password: string) {
  const value = String(password || '').trim();
  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Password must include at least one uppercase letter';
  }
  if (!/[0-9]/.test(value)) {
    return 'Password must include at least one number';
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    return 'Password must include at least one special symbol';
  }
  return null;
}