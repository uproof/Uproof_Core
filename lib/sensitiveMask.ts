export function maskText(value: string) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '***';
  if (trimmed.length <= 3) return '*'.repeat(Math.max(trimmed.length, 3));
  return `${trimmed.slice(0, 2)}${'*'.repeat(Math.max(trimmed.length - 4, 3))}${trimmed.slice(-2)}`;
}

export function maskPhone(value: string) {
  return maskText(value);
}

export function maskEmail(value: string) {
  const trimmed = String(value || '').trim();
  const [name, domain] = trimmed.split('@');
  if (!name || !domain) return '***';
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

export function redactLeadForSales<T extends {customer: string; company: string; phone: string; email: string; address: string; projectAddress: string; value: string; estimatorData?: unknown}>(lead: T): T {
  return {
    ...lead,
    customer: maskText(lead.customer),
    company: maskText(lead.company),
    phone: maskPhone(lead.phone),
    email: maskEmail(lead.email),
    address: maskText(lead.address),
    projectAddress: maskText(lead.projectAddress),
    value: maskText(lead.value),
  };
}
