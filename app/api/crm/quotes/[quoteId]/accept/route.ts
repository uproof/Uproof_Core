import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {acceptCrmQuote} from '@/lib/crmQuotesStore';
import {checkRateLimit, RATE_LIMITS} from '@/lib/rateLimit';
import {isCrmHost} from '@/lib/internalRouting';

export async function POST(req: NextRequest, {params}: {params: Promise<{quoteId: string}>}) {
  if (!isCrmHost(req.nextUrl.hostname)) {
    return NextResponse.json({ok: false, error: 'Quote acceptance must use the CRM host'}, {status: 403});
  }

  const session = await getAdminSession();
  const {quoteId} = await params;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limiter = await checkRateLimit(`quote-accept:${quoteId}:${ip}`, RATE_LIMITS.QUOTE_ACCEPT);
  if (!limiter.allowed) {
    return NextResponse.json({ok: false, error: 'Too many quote acceptance attempts'}, {status: 429});
  }

  const body = await req.json().catch(() => ({}));
  const token = typeof body.token === 'string' ? body.token.trim() : req.nextUrl.searchParams.get('token')?.trim() || '';

  const actorEmail = session?.email || 'quote-link';
  const actorRole = session?.role || 'worker';

  const result = await acceptCrmQuote({quoteId, token, actorEmail, actorRole, ip});

  if (!result.ok) {
    return NextResponse.json({ok: false, error: result.error}, {status: result.status});
  }

  return NextResponse.json({ok: true, quote: result.quote, projectId: result.projectId, duplicate: result.duplicate});
}