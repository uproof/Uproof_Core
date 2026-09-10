import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeadById} from '@/lib/crmLeadsStore';
import {canPerform} from '@/lib/permissions';
import {createStampedPdfBuffer} from '@/lib/simplePdf';
import {z} from 'zod';

const querySchema = z.object({kind: z.enum(['f2', 'offer']).default('offer')});

export async function GET(request: NextRequest, {params}: {params: Promise<{leadId: string}>}) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  if (!canPerform(session.role, 'viewEstimates')) return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
  const {leadId} = await params;
  const lead = await getCrmLeadById(leadId);
  if (!lead) return NextResponse.json({ok: false, error: 'Lead not found'}, {status: 404});
  const kind = querySchema.parse({kind: request.nextUrl.searchParams.get('kind') || 'offer'}).kind;
  const title = kind === 'f2' ? `F2 forma - ${lead.title || lead.customer}` : `Piedāvājums - ${lead.title || lead.customer}`;
  const savedOutputs = lead.estimatorData.engineOutputs || {};
  const output = kind === 'f2' ? savedOutputs.f2Estimate : savedOutputs.customerOffer;
  const outputRows = output && typeof output === 'object'
    ? ((output as Record<string, unknown>)[kind === 'f2' ? 'activeRows' : 'activeLineItems'] as Array<Record<string, unknown>> || [])
    : [];
  const total = output && typeof output === 'object' && 'totals' in output ? JSON.stringify((output as Record<string, unknown>).totals) : '';
  const pdf = createStampedPdfBuffer({
    title,
    lines: [
      `Client: ${lead.customer}`,
      `Company: ${lead.company}`,
      `Project: ${lead.projectAddress || lead.address}`,
      `Estimator status: ${lead.status}`,
      `Estimator data fields: ${Object.values(lead.estimatorData || {}).filter((value) => value !== '' && value !== null && value !== undefined).length}`,
      `Processing status: ${lead.estimatorData?.processingStatus || 'draft'}`,
      `Workbook output rows: ${outputRows.length}`,
      ...(outputRows.slice(0, 80).map((row) => `${row.description || row.name || ''} | ${row.quantity || ''} ${row.unit || ''} | ${row.totalExVat || row.total || ''}`)),
      total ? `Totals: ${total}` : '',
      kind === 'f2' ? 'Detailed estimator output' : 'Client offer output',
    ],
    watermark: `${session.email} | ${session.sid} | ${new Date().toISOString()}`,
  });
  return new NextResponse(pdf, {headers: {'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${lead.id}-${kind}.pdf"`, 'Cache-Control': 'no-store'}});
}
