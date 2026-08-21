import {NextRequest, NextResponse} from 'next/server';
import {addCrmLead, getCrmLeads} from '@/lib/crmLeadsStore';
import {getAdminSession} from '@/lib/adminAuth';
import {logCrmAudit} from '@/lib/crmAudit';
import {logCrmUserActivity} from '@/lib/crmUserActivityStore';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {canPerform} from '@/lib/permissions';
import {mapCrmApiError} from '@/lib/crmApiErrors';
import {normalizeCrmEmail, normalizeCrmPhone, normalizeCrmText} from '@/lib/crmContacts';
import {z} from 'zod';

const createLeadSchema = z.object({
  customer: z.string().trim().min(1, 'Customer name is required'),
  company: z.string().trim().min(1, 'Company name is required'),
  phone: z.string().trim().min(1, 'Phone number is required'),
  email: z.string().trim().email('Invalid email address'),
  address: z.string().trim().min(1, 'Address is required'),
  owner: z.string().trim().min(1, 'Owner is required'),
  value: z.string().trim().min(1, 'Value is required'),
  nextAction: z.string().trim().min(1, 'Next action is required'),
  note: z.string().trim().optional(),
});

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
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
    }

    if (!canPerform(session.role, 'createLeads')) {
      return NextResponse.json({ok: false, error: 'Only superadmin can add leads'}, {status: 403});
    }

    const body = await req.json().catch(() => ({}));
    const result = createLeadSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json({ok: false, error: firstError}, {status: 400});
    }

    const {data} = result;

    const existingLeads = await getCrmLeads();
    const normalizedEmail = normalizeCrmEmail(data.email);
    const normalizedPhone = normalizeCrmPhone(data.phone);
    const duplicateLead = existingLeads.find((lead) => {
      const leadEmail = normalizeCrmEmail(lead.email);
      const leadPhone = normalizeCrmPhone(lead.phone);
      return (
        (normalizedEmail && leadEmail === normalizedEmail) ||
        (normalizedPhone && leadPhone === normalizedPhone) ||
        (normalizeCrmText(lead.customer).toLowerCase() === normalizeCrmText(data.customer).toLowerCase() && normalizeCrmText(lead.company).toLowerCase() === normalizeCrmText(data.company).toLowerCase())
      );
    });

    if (duplicateLead) {
      return NextResponse.json({ok: false, error: 'Duplicate customer or lead already exists', duplicateLeadId: duplicateLead.id}, {status: 409});
    }

    const lead = await addCrmLead({
      customer: normalizeCrmText(data.customer),
      company: normalizeCrmText(data.company),
      phone: normalizeCrmPhone(data.phone),
      email: normalizeCrmEmail(data.email),
      address: normalizeCrmText(data.address),
      owner: normalizeCrmText(data.owner),
      value: normalizeCrmText(data.value),
      nextAction: normalizeCrmText(data.nextAction),
      note: normalizeCrmText(data.note || ''),
    });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    try {
      await logCrmAudit({
        action: 'lead_create',
        userEmail: session.email,
        role: session.role,
        sessionId: session.sid,
        ip,
        resource: `lead:${lead.id}`,
        detail: 'lead_created_manual',
      });
    } catch (auditError) {
      console.warn('Lead audit logging failed:', auditError);
    }

    try {
      await logCrmUserActivity({
        actorEmail: session.email,
        actorRole: session.role,
        action: 'lead_create',
        leadId: lead.id,
        detail: 'lead_created_manual',
        ip,
      });
    } catch (activityError) {
      console.warn('Lead activity logging failed:', activityError);
    }

    return NextResponse.json({ok: true, lead});
  } catch (error: any) {
    const mapped = mapCrmApiError(error, 'Failed to save lead');
    return NextResponse.json({ok: false, error: mapped.message}, {status: mapped.status});
  }
}
