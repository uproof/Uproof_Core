import {createHash} from 'node:crypto';
import {getCrmLeads} from '@/lib/crmLeadsStore';
import type {CrmCustomer} from '@/lib/crmMockData';

type CrmCustomersOptions = {
  assignedSalesUserId?: string;
  limit?: number;
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function customerId(customer: string, company: string, phone: string, email: string) {
  const hash = createHash('sha1')
    .update([customer, company, phone, email].map(normalizeKey).join('|'))
    .digest('hex')
    .slice(0, 10);
  return `C-${hash}`;
}

export async function getCrmCustomers(options: CrmCustomersOptions = {}): Promise<CrmCustomer[]> {
  const leads = await getCrmLeads({
    ...(options.assignedSalesUserId ? {assignedSalesUserId: options.assignedSalesUserId} : {}),
    ...(typeof options.limit === 'number' ? {limit: options.limit} : {}),
  });
  const customers = new Map<string, CrmCustomer>();

  for (const lead of leads) {
    const id = customerId(lead.customer, lead.company, lead.phone, lead.email);
    const existing = customers.get(id);
    if (existing) {
      existing.leads += 1;
      continue;
    }

    customers.set(id, {
      id,
      name: lead.customer,
      company: lead.company,
      phone: lead.phone,
      email: lead.email,
      leads: 1,
      lastContact: lead.updatedAt,
    });
  }

  return [...customers.values()].sort((left, right) => left.name.localeCompare(right.name));
}
