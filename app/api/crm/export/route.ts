import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {logCrmAudit} from '@/lib/crmAudit';
import {getCrmQuotes} from '@/lib/crmQuotesStore';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (session.role !== 'superadmin') {
    await logCrmAudit({
      action: 'bulk_export_attempt',
      userEmail: session.email,
      role: session.role,
      sessionId: session.sid,
      ip,
      resource: 'quotes',
      detail: 'blocked_non_superadmin',
    });
    return NextResponse.json({ok: false, error: 'Bulk export is allowed only for superadmin'}, {status: 403});
  }

  await logCrmAudit({
    action: 'bulk_export_success',
    userEmail: session.email,
    role: session.role,
    sessionId: session.sid,
    ip,
    resource: 'quotes',
  });

  const quotes = await getCrmQuotes();

  const csvRows = [
    ['Quote ID', 'Customer', 'Status', 'Amount', 'Sent At', 'Owner'].join(','),
    ...quotes.map((quote) => [quote.id, quote.customer, quote.status, quote.amount, quote.sentAt, quote.owner].join(',')),
  ];

  return new NextResponse(csvRows.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="crm-quotes-export.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
