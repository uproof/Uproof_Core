import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {acceptCrmQuote} from '@/lib/crmQuotesStore';

export async function POST(req: NextRequest, {params}: {params: Promise<{quoteId: string}>}) {
  const session = await getAdminSession();
  const {quoteId} = await params;
  const body = await req.json().catch(() => ({}));
  const token = typeof body.token === 'string' ? body.token.trim() : req.nextUrl.searchParams.get('token')?.trim() || '';

  const actorEmail = session?.email || 'quote-link';
  const actorRole = session?.role || 'worker';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  const result = await acceptCrmQuote({quoteId, token, actorEmail, actorRole, ip});

  if (!result.ok) {
    return NextResponse.json({ok: false, error: result.error}, {status: result.status});
  }

  return NextResponse.json({ok: true, quote: result.quote, projectId: result.projectId, duplicate: result.duplicate});
}