import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {checkRateLimit, RATE_LIMITS} from '@/lib/rateLimit';
import {canPerform} from '@/lib/permissions';
import {createCrmSupabaseClient as createSupabaseAdminClient} from '@/lib/crmStorage';
import {findCrmLeadRowById} from '@/lib/crmLeadsStore';
import {getCrmUserByEmail, getCrmUserById} from '@/lib/crmUsersStore';
import {logCrmUserActivity} from '@/lib/crmUserActivityStore';
import {mapCrmApiError} from '@/lib/crmApiErrors';
import {z} from 'zod';

const assignLeadSchema = z.object({
  salesUserId: z.string().trim().min(1, 'salesUserId is required'),
});

export async function POST(
  req: NextRequest,
  {params}: {params: Promise<{id: string}>}
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
    }

    if (!canPerform(session.role, 'assignLeads')) {
      return NextResponse.json({ok: false, error: 'Only superadmin can assign leads'}, {status: 403});
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const limiter = await checkRateLimit(`crm-assign:${session.sid}:${ip}`, RATE_LIMITS.API_MUTATION);
    if (!limiter.allowed) {
      return NextResponse.json({ok: false, error: 'Too many requests'}, {status: 429});
    }

    const {id} = await params;
    const json = await req.json().catch(() => ({}));
    const validation = assignLeadSchema.safeParse(json);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json({ok: false, error: firstError}, {status: 400});
    }

    const {salesUserId} = validation.data;

    const salesUser = await getCrmUserById(salesUserId);
    if (!salesUser || salesUser.role !== 'sales' || !salesUser.isActive) {
      return NextResponse.json({ok: false, error: 'Sales user not found'}, {status: 404});
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json({ok: false, error: 'Supabase is required'}, {status: 503});
    }

    const leadRow = await findCrmLeadRowById(id);
    if (!leadRow) {
      return NextResponse.json({ok: false, error: 'Lead not found'}, {status: 404});
    }

    if (leadRow.assigned_sales_user_id === salesUser.id) {
      return NextResponse.json({ok: true, duplicate: true, lead: leadRow});
    }

    const actorProfile = await getCrmUserByEmail(session.email);
    const assignedAt = new Date().toISOString();

    const {error: updateError} = await supabase
      .from('crm_leads')
      .update({
        assigned_sales_user_id: salesUser.id,
        assigned_by_user_id: actorProfile?.id || null,
        assigned_at: assignedAt,
        updated_at: assignedAt,
      })
      .eq('id', leadRow.id);

    if (updateError) {
      const mapped = mapCrmApiError(updateError, 'Failed to assign lead');
      return NextResponse.json({ok: false, error: mapped.message}, {status: mapped.status});
    }

    try {
      await logCrmUserActivity({
        actorEmail: session.email,
        actorRole: session.role,
        action: 'lead_assign',
        leadId: id,
        detail: `assigned_to:${salesUser.id}`,
        ip,
      });
    } catch (logError) {
      console.warn('lead_assign activity log failed', logError);
    }

    return NextResponse.json({
      ok: true,
      duplicate: false,
      lead: {
        ...leadRow,
        assigned_sales_user_id: salesUser.id,
        assigned_by_user_id: actorProfile?.id || null,
        assigned_at: assignedAt,
        updated_at: assignedAt,
      },
    });
  } catch (error: any) {
    console.error('lead assignment route failed', error);
    const mapped = mapCrmApiError(error, 'Failed to assign lead');
    return NextResponse.json({ok: false, error: mapped.message}, {status: mapped.status});
  }
}
