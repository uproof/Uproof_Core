import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {logCrmAudit} from '@/lib/crmAudit';
import {canPerform} from '@/lib/permissions';
import {createStampedPdfBuffer} from '@/lib/simplePdf';
import {getCrmQuotes} from '@/lib/crmQuotesStore';

export async function GET(
  req: NextRequest,
  {params}: {params: Promise<{quoteId: string}>}
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (!canPerform(session.role, 'exportCrm')) {
    return NextResponse.json({ok: false, error: 'Only superadmin can download quote PDFs'}, {status: 403});
  }

  const {quoteId} = await params;
  const quotes = await getCrmQuotes();
  const quote = quotes.find((entry) => entry.id.toLowerCase() === quoteId.toLowerCase());
  if (!quote) {
    return NextResponse.json({ok: false, error: 'Quote not found'}, {status: 404});
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  await logCrmAudit({
    action: 'quote_pdf_download',
    userEmail: session.email,
    role: session.role,
    sessionId: session.sid,
    ip,
    resource: `quote:${quote.id}`,
  });

  const watermark = `${session.email} | ${session.role} | ${session.sid} | ${new Date().toISOString()}`;
  const pdf = createStampedPdfBuffer({
    title: `Quote ${quote.id}`,
    lines: [
      `Customer: ${quote.customer}`,
      `Status: ${quote.status}`,
      `Amount: ${quote.amount}`,
      `Sent At: ${quote.sentAt}`,
      `Owner: ${quote.owner}`,
    ],
    watermark,
  });

  return new NextResponse(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${quote.id}-stamped.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
