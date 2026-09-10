import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeadById} from '@/lib/crmLeadsStore';
import {canPerform} from '@/lib/permissions';
import {createStampedPdfBuffer} from '@/lib/simplePdf';
import {generateEstimatorOutput} from '@/lib/estimatorEngine';
import {normalizeCrmEstimatorData} from '@/lib/crmEstimator';
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

  // Normalize estimator data
  const estimatorData = normalizeCrmEstimatorData(lead.estimatorData);

  // Generate native estimate if saved outputs don't exist
  const savedOutputs = lead.estimatorData?.engineOutputs || {};
  let output = null;

  if (Object.keys(savedOutputs).length > 0) {
    // Use saved outputs
    output = savedOutputs[kind === 'f2' ? 'f2Estimate' : 'customerOffer'];
  } else {
    // Generate from estimator data
    try {
      const generated = generateEstimatorOutput(estimatorData);
      output = kind === 'f2' ? generated.f2Forma : generated.piedāvājums;
    } catch (error) {
      console.error('Failed to generate estimate:', error);
      return NextResponse.json({ok: false, error: 'Could not generate estimate'}, {status: 500});
    }
  }

  const title = kind === 'f2' ? `F2 forma - ${lead.title || lead.customer}` : `Piedāvājums - ${lead.title || lead.customer}`;
  const outputRows = output && typeof output === 'object'
    ? ((output as Record<string, unknown>)[kind === 'f2' ? 'activeRows' : 'activeLineItems'] as Array<Record<string, unknown>> || [])
    : [];

  const pdf = createStampedPdfBuffer({
    title,
    lines: [
      `Client: ${lead.customer}`,
      `Company: ${lead.company}`,
      `Project: ${lead.projectAddress || lead.address}`,
      `Estimator status: ${lead.status}`,
      `Processing status: ${lead.estimatorData?.processingStatus || 'draft'}`,
      `Document type: ${kind === 'f2' ? 'Detailed Estimate (F2 forma)' : 'Customer Offer (Piedāvājums)'}`,
      `Generated rows: ${outputRows.length}`,
      ...(outputRows.slice(0, 80).map((row) => `${row.description || row.name || ''} | ${row.quantity || ''} ${row.unit || ''} | €${row.totalExVat || row.total || ''}`)),
      kind === 'f2' ? 'Detailed cost estimate (F2 forma)' : 'Client offer document (Piedāvājums)',
    ],
    watermark: `${session.email} | ${session.sid} | ${new Date().toISOString()}`,
  });

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${lead.id}-${kind}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
