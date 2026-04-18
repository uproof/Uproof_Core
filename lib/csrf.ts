import Csrf from 'csrf';
import { cookies } from 'next/headers';

const CSRF_COOKIE = '_csrf';

let csrfInstance: InstanceType<typeof Csrf>;

function getCsrfInstance() {
  if (!csrfInstance) {
    csrfInstance = new Csrf({
      saltLength: 32,
    });
  }
  return csrfInstance;
}

export async function generateCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  let secret = cookieStore.get(CSRF_COOKIE)?.value;

  if (!secret) {
    const csrf = getCsrfInstance();
    secret = csrf.secretSync();
    cookieStore.set(CSRF_COOKIE, secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });
  }

  const csrf = getCsrfInstance();
  const token = csrf.create(secret);
  return token;
}

export async function validateCsrfToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const secret = cookieStore.get(CSRF_COOKIE)?.value;

  if (!secret || !token) {
    return false;
  }

  const csrf = getCsrfInstance();
  return csrf.verify(secret, token);
}
