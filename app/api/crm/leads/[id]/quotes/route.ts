import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {canPerform} from '@/lib/permissions';
import {getCrmLeadById, isLeadAssignedToSalesUser} from '@/lib/crmLeadsStore';
import {createCrmQuoteDraft} from '@/lib/crmQuotesStore';
import {mapCrmApiError} from '@/lib/crmApiErrors';
import {z} from 'zod';

const createQuoteSchema = z.object({
  amount: z.string().trim().min(1, 'Amount is required'),
  estimateRevisionId: z.string().trim().optional(),
});

export async function POST(req: NextRequest, {params}: {params: Promise<{id: string}>}) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
    }

    if (!canPerform(session.role, 'manageQuotes')) {
      return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
    }

    const {id} = await params;
    const lead = await getCrmLeadById(id);
    if (!lead) {
      return NextResponse.json({ok: false, error: 'Lead not found'}, {status: 404});
    }

    if (session.role === 'sales') {
      const salesUser = await getCrmUserByEmail(session.email);
      if (!salesUser || !(await isLeadAssignedToSalesUser(id, salesUser.id))) {
        return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
      }
    }

    const body = await req.json().catch(() => ({}));
    const validation = createQuoteSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json({ok: false, error: firstError}, {status: 400});
    }

    const result = await createCrmQuoteDraft({
      leadId: lead.id,
      amount: validation.data.amount,
      owner: session.email,
      estimateRevisionId: validation.data.estimateRevisionId || undefined,
      estimatePayload: lead.estimatorData,
    });

    return NextResponse.json({ok: true, quote: result.quote, acceptToken: result.acceptToken});
  } catch (error: any) {
    const mapped = mapCrmApiError(error, 'Failed to create quote draft');
    return NextResponse.json({ok: false, error: mapped.message}, {status: mapped.status});
  }
}