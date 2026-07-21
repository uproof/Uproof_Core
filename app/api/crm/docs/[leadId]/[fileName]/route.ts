import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {verifySignedDocQuery} from '@/lib/crmDocs';
import {logCrmAudit} from '@/lib/crmAudit';
import {isLeadAssignedToSalesUser} from '@/lib/crmLeadsStore';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {checkRateLimit, RATE_LIMITS} from '@/lib/rateLimit';
import {canPerform} from '@/lib/permissions';
import {z} from 'zod';

const docQuerySchema = z.object({
  exp: z.coerce.number().int().positive(),
  sid: z.string().trim().min(1),
  sig: z.string().trim().min(1),
});

export async function GET(
  req: NextRequest,
  {params}: {params: Promise<{leadId: string; fileName: string}>}
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limiter = await checkRateLimit(`crm-doc-download:${session.sid}:${ip}`, RATE_LIMITS.API_MUTATION);
  if (!limiter.allowed) {
    return NextResponse.json({ok: false, error: 'Too many download requests'}, {status: 429});
  }

  const {leadId, fileName} = await params;
  
  const query = Object.fromEntries(req.nextUrl.searchParams.entries());
  const validation = docQuerySchema.safeParse(query);

  if (!validation.success) {
    return NextResponse.json({ok: false, error: 'Invalid document request parameters'}, {status: 400});
  }

  const {exp, sid, sig} = validation.data;

  if (sid !== session.sid) {
    return NextResponse.json({ok: false, error: 'Session mismatch'}, {status: 403});
  }

  const valid = verifySignedDocQuery({
    leadId,
    fileName,
    sessionId: sid,
    exp,
    sig,
  });

  if (!valid) {
    return NextResponse.json({ok: false, error: 'Invalid or expired document URL'}, {status: 403});
  }

  if (!canPerform(session.role, 'downloadAssignedDocs')) {
    return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
  }

  if (session.role === 'sales') {
    const salesUser = await getCrmUserByEmail(session.email);
    if (!salesUser || !(await isLeadAssignedToSalesUser(leadId, salesUser.id))) {
      return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
    }
  }

  await logCrmAudit({
    action: 'download',
    userEmail: session.email,
    role: session.role,
    sessionId: session.sid,
    ip,
    resource: `lead:${leadId}`,
    detail: `attachment:${fileName}`,
  });

  const content = [
    'UpRoof CRM - Protected Document',
    `Lead ID: ${leadId}`,
    `File: ${fileName}`,
    `Downloaded by: ${session.email} (${session.role})`,
    `Session: ${session.sid}`,
    `Time: ${new Date().toISOString()}`,
  ].join('\n');

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}.txt"`,
      'Cache-Control': 'no-store',
    },
  });
}
