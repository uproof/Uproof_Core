const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeCrmEmail(value: unknown) {
  const email = String(value || '').trim().toLowerCase();
  return EMAIL_PATTERN.test(email) ? email : '';
}

export function normalizeCrmPhone(value: unknown) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  const normalized = raw.replace(/[\s().-]/g, '');
  return normalized.startsWith('+') ? `+${normalized.slice(1).replace(/\+/g, '')}` : normalized.replace(/\+/g, '');
}

export function normalizeCrmText(value: unknown) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

export function createCrmCustomerFingerprint(customer: unknown, company: unknown, phone: unknown, email: unknown) {
  return [
    normalizeCrmText(customer).toLowerCase(),
    normalizeCrmText(company).toLowerCase(),
    normalizeCrmPhone(phone),
    normalizeCrmEmail(email),
  ].join('|');
}