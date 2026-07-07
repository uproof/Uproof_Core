import crypto from 'crypto';

export type MfaRole = 'superadmin' | 'sales';

function getRoleSecret(role: MfaRole) {
  const isProduction = process.env.NODE_ENV === 'production';
  if (role === 'superadmin') {
    return (
      process.env.SUPERADMIN_MFA_SECRET ||
      process.env.ADMIN_MFA_SECRET ||
      (isProduction ? '' : 'JBSWY3DPEHPK3PXP')
    ).trim();
  }
  return (process.env.SALES_MFA_SECRET || (isProduction ? '' : 'KRSXG5A7N5XGK4TF')).trim();
}

function base32ToBuffer(input: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const normalized = input.toUpperCase().replace(/=+$/g, '').replace(/\s+/g, '');

  let bits = '';
  for (const char of normalized) {
    const index = alphabet.indexOf(char);
    if (index === -1) {
      throw new Error('Invalid MFA secret format');
    }
    bits += index.toString(2).padStart(5, '0');
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

function generateTotp(secret: string, unixTimeMs: number) {
  const step = 30;
  const counter = Math.floor(unixTimeMs / 1000 / step);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));

  const key = base32ToBuffer(secret);
  const digest = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return String(code % 1_000_000).padStart(6, '0');
}

export function verifyTotpSecret(secret: string, providedCode: string) {
  const normalizedSecret = String(secret || '').trim();
  if (!normalizedSecret) return false;

  const code = String(providedCode || '').trim();
  if (!/^[0-9]{6}$/.test(code)) {
    return false;
  }

  if (process.env.NODE_ENV !== 'production' && /^[0-9]{6}$/.test(normalizedSecret)) {
    return code === normalizedSecret;
  }

  try {
    const now = Date.now();
    const validCodes = [
      generateTotp(normalizedSecret, now - 30_000),
      generateTotp(normalizedSecret, now),
      generateTotp(normalizedSecret, now + 30_000),
    ];

    return validCodes.includes(code);
  } catch {
    return false;
  }
}

export function isMfaConfigured(role: MfaRole) {
  return !!getRoleSecret(role);
}

export function verifyTotp(role: MfaRole, providedCode: string) {
  return verifyTotpSecret(getRoleSecret(role), providedCode);
}
