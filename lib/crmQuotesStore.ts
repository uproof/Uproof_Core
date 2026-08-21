import crypto from 'crypto';
import {nowIso} from '@/lib/crmDb';
import {createCrmSupabaseClient as createSupabaseAdminClient} from '@/lib/crmStorage';
import {getCrmLeadById, updateCrmLead} from '@/lib/crmLeadsStore';
import {upsertProjectFromLead} from '@/lib/crmProjectsStore';
import {logCrmUserActivity} from '@/lib/crmUserActivityStore';
import type {CrmQuote} from '@/lib/crmMockData';
import type {CrmEstimatorFormData} from '@/lib/crmEstimator';

type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'cancelled';

type QuoteRow = {
  id: string;
  lead_id: string | null;
  revision_no: number | null;
  customer: string;
  status: string;
  amount: string;
  sent_at: string;
  owner: string;
  accepted_at?: string | null;
  accepted_project_id?: string | null;
  estimate_revision_id?: string | null;
  estimate_payload_json?: string | null;
  accept_token_hash?: string | null;
  accept_token_expires_at?: string | null;
};

type QuoteDraftInput = {
  leadId: string;
  amount: string;
  owner: string;
  estimateRevisionId?: string;
  estimatePayload?: CrmEstimatorFormData;
};

type AcceptQuoteInput = {
  quoteId: string;
  token?: string;
  actorEmail: string;
  actorRole: string;
  ip: string;
};

function quoteTokenSecret() {
  return (process.env.CRM_DATA_SECRET || process.env.ADMIN_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || '').trim();
}

function hashQuoteToken(token: string) {
  const secret = quoteTokenSecret();
  if (!secret) {
    throw new Error('Quote token secret is required');
  }
  return crypto.createHmac('sha256', secret).update(token).digest('base64url');
}

function generateQuoteId() {
  const year = new Date().getFullYear();
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `Q-${year}-${suffix}`;
}

function generateAcceptToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function rowToQuote(row: QuoteRow): CrmQuote {
  return {
    id: row.id,
    leadId: row.lead_id || undefined,
    revisionNo: row.revision_no || undefined,
    customer: row.customer,
    status: row.status,
    amount: row.amount,
    sentAt: row.sent_at,
    owner: row.owner,
    acceptedAt: row.accepted_at || undefined,
    acceptedProjectId: row.accepted_project_id || undefined,
    estimateRevisionId: row.estimate_revision_id || undefined,
    acceptUrl: '',
  };
}

export async function getCrmQuotes(limit = 0): Promise<CrmQuote[]> {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    let query = supabase
      .from('crm_quotes')
      .select('id,lead_id,revision_no,customer,status,amount,sent_at,owner,accepted_at,accepted_project_id,estimate_revision_id')
      .order('created_at', {ascending: false});

    if (limit > 0) {
      query = query.limit(limit);
    }

    const {data, error} = await query;
    if (!error && Array.isArray(data)) {
      return data.map((row: QuoteRow) => rowToQuote(row));
    }
  }

  return [];
}

export async function getCrmQuoteById(quoteId: string): Promise<CrmQuote | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase || !quoteId.trim()) {
    return null;
  }

  const {data, error} = await supabase
    .from('crm_quotes')
    .select('id,lead_id,revision_no,customer,status,amount,sent_at,owner,accepted_at,accepted_project_id,estimate_revision_id')
    .eq('id', quoteId.trim())
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return rowToQuote(data as QuoteRow);
}

export async function createCrmQuoteDraft(input: QuoteDraftInput) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase is required for quote storage');
  }

  const lead = await getCrmLeadById(input.leadId);
  if (!lead) {
    throw new Error('Lead not found');
  }

  const latestRevision = await supabase
    .from('crm_quotes')
    .select('revision_no')
    .eq('lead_id', input.leadId)
    .order('revision_no', {ascending: false})
    .limit(1)
    .maybeSingle();

  const revisionNo = Number(latestRevision.data?.revision_no || 0) + 1;
  const quoteId = generateQuoteId();
  const acceptToken = generateAcceptToken();
  const now = nowIso();
  const acceptTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
  const acceptTokenHash = hashQuoteToken(acceptToken);

  const {error} = await supabase.from('crm_quotes').insert({
    id: quoteId,
    lead_id: input.leadId,
    revision_no: revisionNo,
    customer: lead.customer,
    status: 'draft' satisfies QuoteStatus,
    amount: input.amount,
    sent_at: now,
    owner: input.owner,
    accepted_at: null,
    accepted_project_id: null,
    estimate_revision_id: input.estimateRevisionId || quoteId,
    estimate_payload_json: JSON.stringify(input.estimatePayload || lead.estimatorData || {}),
    accept_token_hash: acceptTokenHash,
    accept_token_expires_at: acceptTokenExpiresAt,
    created_at: now,
    updated_at: now,
  });

  if (error) {
    throw new Error(error.message || 'Failed to create quote draft');
  }

  return {
    quote: {
      id: quoteId,
      leadId: input.leadId,
      revisionNo,
      customer: lead.customer,
      status: 'draft',
      amount: input.amount,
      sentAt: now,
      owner: input.owner,
      estimateRevisionId: input.estimateRevisionId || quoteId,
      acceptUrl: `/api/crm/quotes/${encodeURIComponent(quoteId)}/accept?token=${encodeURIComponent(acceptToken)}`,
    } satisfies CrmQuote,
    acceptToken,
  };
}

export async function acceptCrmQuote(input: AcceptQuoteInput) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error('Supabase is required for quote storage');
  }

  const quote = await getCrmQuoteById(input.quoteId);
  if (!quote) {
    return {ok: false as const, status: 404, error: 'Quote not found'};
  }

  const row = await supabase
    .from('crm_quotes')
    .select('id,lead_id,revision_no,customer,status,amount,sent_at,owner,accepted_at,accepted_project_id,estimate_revision_id,accept_token_hash,accept_token_expires_at,estimate_payload_json')
    .eq('id', input.quoteId)
    .maybeSingle();

  if (row.error || !row.data) {
    return {ok: false as const, status: 404, error: 'Quote not found'};
  }

  const current = row.data as QuoteRow;
  if (current.accepted_at && current.accepted_project_id) {
    return {ok: true as const, duplicate: true as const, projectId: current.accepted_project_id, quote: rowToQuote(current)};
  }

  if (current.accept_token_hash) {
    const providedTokenHash = input.token ? hashQuoteToken(input.token) : '';
    if (!providedTokenHash || providedTokenHash !== current.accept_token_hash) {
      return {ok: false as const, status: 403, error: 'Invalid or expired quote link'};
    }
  }

  if (current.accept_token_expires_at && Date.now() > Date.parse(current.accept_token_expires_at)) {
    return {ok: false as const, status: 410, error: 'Quote link expired'};
  }

  const leadId = current.lead_id;
  if (!leadId) {
    return {ok: false as const, status: 409, error: 'Quote is not linked to a lead'};
  }

  const lead = await getCrmLeadById(leadId);
  if (!lead) {
    return {ok: false as const, status: 404, error: 'Lead not found'};
  }

  const acceptedAt = nowIso();
  const updatedLead = await updateCrmLead(leadId, {
    status: 'WON',
    progress: 'won',
    dealProgress: 'Signed',
    nextAction: 'Convert quote to project',
    note: lead.note,
  });

  if (!updatedLead) {
    return {ok: false as const, status: 500, error: 'Failed to update lead for accepted quote'};
  }

  await upsertProjectFromLead(updatedLead);

  const {error} = await supabase
    .from('crm_quotes')
    .update({
      status: 'accepted',
      accepted_at: acceptedAt,
      accepted_project_id: updatedLead.id,
      updated_at: acceptedAt,
    })
    .eq('id', current.id)
    .is('accepted_at', null);

  if (error) {
    throw new Error(error.message || 'Failed to accept quote');
  }

  await logCrmUserActivity({
    actorEmail: input.actorEmail,
    actorRole: input.actorRole,
    action: 'quote_accept',
    leadId,
    detail: `accepted_quote:${current.id}`,
    ip: input.ip,
  });

  return {
    ok: true as const,
    duplicate: false as const,
    projectId: updatedLead.id,
    acceptedAt,
    quote: {
      ...rowToQuote(current),
      status: 'accepted',
      acceptedAt,
      acceptedProjectId: updatedLead.id,
    } satisfies CrmQuote,
  };
}
