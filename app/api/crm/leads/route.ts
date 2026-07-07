import {NextRequest, NextResponse} from 'next/server';
import {addCrmLead, getCrmLeads} from '@/lib/crmLeadsStore';
import {getAdminSession} from '@/lib/adminAuth';
import {logCrmAudit} from '@/lib/crmAudit';
import {logCrmUserActivity} from '@/lib/crmUserActivityStore';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {canPerform} from '@/lib/permissions';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  let leads = await getCrmLeads();
  if (session.role === 'sales') {
    const salesUser = await getCrmUserByEmail(session.email);
    if (!salesUser) {
      return NextResponse.json({ok: true, leads: []});
    }
    leads = await getCrmLeads({assignedSalesUserId: salesUser.id});
  }

  return NextResponse.json({ok: true, leads});
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (!canPerform(session.role, 'createLeads')) {
    return NextResponse.json({ok: false, error: 'Only superadmin can add leads'}, {status: 403});
  }

  const body = await req.json().catch(() => ({} as Record<string, string>));
  const required = ['customer', 'company', 'phone', 'email', 'address', 'owner', 'value', 'nextAction'] as const;
  for (const field of required) {
    if (!body[field] || !String(body[field]).trim()) {
      return NextResponse.json({ok: false, error: `Missing ${field}`}, {status: 400});
    }
  }

  const lead = await addCrmLead({
    customer: String(body.customer),
    company: String(body.company),
    phone: String(body.phone),
    email: String(body.email),
    address: String(body.address),
    owner: String(body.owner),
    value: String(body.value),
    nextAction: String(body.nextAction),
    note: body.note ? String(body.note) : undefined,
  });

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  await logCrmAudit({
    action: 'lead_create',
    userEmail: session.email,
    role: session.role,
    sessionId: session.sid,
    ip,
    resource: `lead:${lead.id}`,
    detail: 'lead_created_manual',
  });

  await logCrmUserActivity({
    actorEmail: session.email,
    actorRole: session.role,
    action: 'lead_create',
    leadId: lead.id,
    detail: 'lead_created_manual',
    ip,
  });

  return NextResponse.json({ok: true, lead});
}
