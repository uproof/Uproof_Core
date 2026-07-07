import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {logCrmAudit} from '@/lib/crmAudit';
import {checkRateLimit, RATE_LIMITS} from '@/lib/rateLimit';

const CLIENT_ALLOWED_ACTIONS = new Set(['reveal']);

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

  const body = await req.json().catch(() => ({} as {action?: string; resource?: string; field?: string; detail?: string}));

  if (!body.action || !CLIENT_ALLOWED_ACTIONS.has(body.action)) {
    return NextResponse.json({ok: false, error: 'Missing action'}, {status: 400});
  }

  const safeResource = body.resource ? String(body.resource).slice(0, 120) : undefined;
  const safeField = body.field ? String(body.field).slice(0, 64) : undefined;
  const safeDetail = body.detail ? String(body.detail).slice(0, 256) : undefined;

  await logCrmAudit({
    action: 'reveal',
    userEmail: session.email,
    role: session.role,
    sessionId: session.sid,
    ip,
    resource: safeResource,
    field: safeField,
    detail: safeDetail,
  });

  return NextResponse.json({ok: true});
}
