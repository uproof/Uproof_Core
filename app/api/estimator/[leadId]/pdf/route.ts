import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeadById} from '@/lib/crmLeadsStore';
import {canPerform} from '@/lib/permissions';
import {generateEstimatorOutput} from '@/lib/estimatorEngine';
import {normalizeCrmEstimatorData} from '@/lib/crmEstimator';
import {createWorkbookPdfBuffer} from '@/lib/workbookPdf';
import {z} from 'zod';

const querySchema = z.object({kind: z.enum(['f2', 'offer', 'materials', 'work-plan', 'daily-plan']).default('offer')});

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

  // Generate the native estimate so every workbook page has a PDF source.
  const savedOutputs = lead.estimatorData?.engineOutputs || {};
  let generated;
  try {
    generated = generateEstimatorOutput(estimatorData);
  } catch (error) {
    console.error('Failed to generate estimate:', error);
    return NextResponse.json({ok: false, error: 'Could not generate estimate'}, {status: 500});
  }

  const saved = savedOutputs as Record<string, Record<string, unknown>>;
  if (kind !== 'offer' && kind !== 'f2') {
    return NextResponse.json({ok: false, error: 'Workbook PDF downloads are available for Piedāvājums and F2 forma only'}, {status: 400});
  }

  const pdf = await createWorkbookPdfBuffer(generated, kind, lead.customer, lead.projectAddress || lead.address || 'nav norādīts');

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${lead.id}-${kind}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
