import crypto from 'crypto';

function getDocsSecret() {
  const secret = process.env.CRM_DOCS_SECRET || process.env.ADMIN_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || '';
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRM_DOCS_SECRET is required in production');
    }
    throw new Error('CRM_DOCS_SECRET or ADMIN_TOKEN_SECRET must be set in development');
  }
  return secret;
}

export function createSignedDocQuery(params: {
  leadId: string;
  fileName: string;
  sessionId: string;
  ttlSeconds?: number;
}) {
  const exp = Math.floor(Date.now() / 1000) + (params.ttlSeconds ?? 15 * 60);
  const payload = `${params.leadId}:${params.fileName}:${params.sessionId}:${exp}`;
  const sig = crypto.createHmac('sha256', getDocsSecret()).update(payload).digest('base64url');
  return `exp=${exp}&sid=${encodeURIComponent(params.sessionId)}&sig=${encodeURIComponent(sig)}`;
}

export function verifySignedDocQuery(params: {
  leadId: string;
  fileName: string;
  sessionId: string;
  exp: number;
  sig: string;
}) {
  if (!params.exp || Number.isNaN(params.exp)) return false;
  if (Math.floor(Date.now() / 1000) > params.exp) return false;

  const payload = `${params.leadId}:${params.fileName}:${params.sessionId}:${params.exp}`;
  const expected = crypto.createHmac('sha256', getDocsSecret()).update(payload).digest('base64url');
  if (params.sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(params.sig), Buffer.from(expected));
}
