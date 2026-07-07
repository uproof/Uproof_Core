import {getDb} from '@/lib/crmDb';
import type {CrmQuote} from '@/lib/crmMockData';

type QuoteRow = {
  id: string;
  customer: string;
  status: string;
  amount: string;
  sent_at: string;
  owner: string;
};

export async function getCrmQuotes(): Promise<CrmQuote[]> {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM quotes ORDER BY created_at DESC').all() as QuoteRow[];
  return rows.map((row) => ({
    id: row.id,
    customer: row.customer,
    status: row.status,
    amount: row.amount,
    sentAt: row.sent_at,
    owner: row.owner,
  }));
}
