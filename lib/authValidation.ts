const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase();
  return EMAIL_PATTERN.test(email) ? email : '';
}

export function parsePassword(value: unknown) {
  const password = String(value || '').trim();
  return password.length >= 8 ? password : '';
}

export function parseResetToken(value: unknown) {
  const token = String(value || '').trim();
  return token.length >= 32 ? token : '';
}
