import {createCrmSupabaseClient as createSupabaseAdminClient} from '@/lib/crmStorage';
import type {CrmQuote} from '@/lib/crmMockData';

type QuoteRow = {
  id: string;
  customer: string;
  status: string;
  amount: string;
  sent_at: string;
  owner: string;
};

export async function getCrmQuotes(limit = 0): Promise<CrmQuote[]> {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    let query = supabase
      .from('crm_quotes')
      .select('id,customer,status,amount,sent_at,owner')
      .order('created_at', {ascending: false});

    if (limit > 0) {
      query = query.limit(limit);
    }

    const {data, error} = await query;
    if (!error && Array.isArray(data)) {
      return data.map((row: QuoteRow) => ({
        id: row.id,
        customer: row.customer,
        status: row.status,
        amount: row.amount,
        sentAt: row.sent_at,
        owner: row.owner,
      }));
    }
  }

  return [];
}
