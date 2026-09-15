import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeadById} from '@/lib/crmLeadsStore';
import {canPerform} from '@/lib/permissions';
import {generateEstimatorOutput} from '@/lib/estimatorEngine';
import {normalizeCrmEstimatorData} from '@/lib/crmEstimator';
import {createWorkbookListPdfBuffer, createWorkbookPdfBuffer} from '@/lib/workbookPdf';
import {z} from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const querySchema = z.object({kind: z.enum(['f2', 'offer', 'materials', 'work-plan', 'daily-plan', 'mechanisms']).default('offer')});

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
  const outputRows = kind === 'offer'
    ? generated.piedāvājums.rows
    : kind === 'f2'
      ? generated.f2Forma.rows
      : kind === 'materials'
        ? generated.materials
        : kind === 'daily-plan'
          ? generated.dailyPlan || []
            : kind === 'mechanisms'
              ? generated.f2Forma.rows.map((row) => ({description: row.description, quantity: row.mechanisms || 0, unit: 'kpl', total: row.mechanisms || 0}))
              : generated.workPlan;
    const titles = {offer: 'Piedāvājums', f2: 'Lokālā tāme Nr.1 - F2 forma', materials: 'Materiālu saraksts', 'work-plan': 'Darbu plāns', 'daily-plan': 'Dienas plāns', mechanisms: 'Mehānismu saraksts'};
  const pdf = kind === 'offer' || kind === 'f2'
    ? await createWorkbookPdfBuffer(generated, kind, lead.customer, lead.projectAddress || lead.address || 'nav norādīts')
    : await createWorkbookListPdfBuffer(titles[kind], outputRows as Array<Record<string, unknown>>);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${lead.id}-${kind}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
