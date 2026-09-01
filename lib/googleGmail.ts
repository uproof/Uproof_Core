import crypto from 'crypto';
import {google} from 'googleapis';

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const GOOGLE_SCOPES = [GMAIL_SCOPE, SHEETS_SCOPE];
const GMAIL_TOKEN_COOKIE = 'crm_gmail_tokens';
const GMAIL_STATE_COOKIE = 'crm_gmail_oauth_state';

function getSecret() {
  const secret = process.env.ADMIN_TOKEN_SECRET || process.env.CRM_DATA_SECRET;
  if (!secret) {
    throw new Error('ADMIN_TOKEN_SECRET or CRM_DATA_SECRET is required for Gmail token protection');
  }
  return crypto.createHash('sha256').update(secret).digest();
}

export function getGoogleRedirectUri(origin: string) {
  return process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`;
}

export function createGoogleOAuthClient(origin: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required');
  }

  return new google.auth.OAuth2(clientId, clientSecret, getGoogleRedirectUri(origin));
}

export function createGoogleAuthorizationUrl(client: ReturnType<typeof createGoogleOAuthClient>, state: string) {
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: GOOGLE_SCOPES,
    include_granted_scopes: true,
    state,
  });
}

export function createOAuthState() {
  return crypto.randomBytes(32).toString('hex');
}

export function protectGoogleTokens(tokens: Record<string, unknown>) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getSecret(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(tokens), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

export function unprotectGoogleTokens(value: string) {
  try {
    const payload = Buffer.from(value, 'base64url');
    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', getSecret(), iv);
    decipher.setAuthTag(tag);
    return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function listGmailMessages(client: ReturnType<typeof createGoogleOAuthClient>, tokens: Record<string, unknown>) {
  client.setCredentials(tokens);
  const gmail = google.gmail({version: 'v1', auth: client});
  const result = await gmail.users.messages.list({userId: 'me', maxResults: 10, labelIds: ['INBOX']});
  return result.data.messages || [];
}

export const gmailTokenCookie = GMAIL_TOKEN_COOKIE;
export const gmailStateCookie = GMAIL_STATE_COOKIE;
