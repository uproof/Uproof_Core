import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {logCrmAudit} from '@/lib/crmAudit';
import {checkRateLimit, RATE_LIMITS} from '@/lib/rateLimit';
import {z} from 'zod';

const auditActionSchema = z.object({
  action: z.literal('reveal'),
  resource: z.string().trim().max(120).optional(),
  field: z.string().trim().max(64).optional(),
  detail: z.string().trim().max(256).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const limiter = await checkRateLimit(`crm-audit:${session.sid}:${ip}`, RATE_LIMITS.API_MUTATION);
  if (!limiter.allowed) {
    return NextResponse.json({ok: false, error: 'Too many requests'}, {status: 429});
  }

  const json = await req.json().catch(() => ({}));
  const validation = auditActionSchema.safeParse(json);

  if (!validation.success) {
    return NextResponse.json({ok: false, error: 'Invalid audit action'}, {status: 400});
  }

  const {action, resource, field, detail} = validation.data;

  await logCrmAudit({
    action,
    userEmail: session.email,
    role: session.role,
    sessionId: session.sid,
    ip,
    resource,
    field,
    detail,
  });

  return NextResponse.json({ok: true});
}
