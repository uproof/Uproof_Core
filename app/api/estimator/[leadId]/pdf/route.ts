import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeadById} from '@/lib/crmLeadsStore';
import {canPerform} from '@/lib/permissions';
import {createStampedPdfBuffer} from '@/lib/simplePdf';
import {generateEstimatorOutput} from '@/lib/estimatorEngine';
import {normalizeCrmEstimatorData} from '@/lib/crmEstimator';
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
  const outputRows = kind === 'offer'
    ? (Array.isArray(saved.customerOffer?.activeLineItems) ? saved.customerOffer.activeLineItems : generated.piedāvājums.rows)
    : kind === 'f2'
      ? (Array.isArray(saved.f2Estimate?.activeRows) ? saved.f2Estimate.activeRows : generated.f2Forma.rows)
      : kind === 'materials'
        ? (Array.isArray(saved.materialsToUse?.consolidatedMaterials) ? saved.materialsToUse.consolidatedMaterials : generated.materials)
        : kind === 'daily-plan'
          ? (Array.isArray(saved.dailyWorkLog?.tasks) ? saved.dailyWorkLog.tasks : generated.dailyPlan || [])
          : (Array.isArray(saved.workPlan?.tasks) ? saved.workPlan.tasks : generated.workPlan);
  const titles = {offer: 'Piedāvājums', f2: 'Lokālā tāme Nr.1 - F2 forma', materials: 'Materiālu saraksts', 'work-plan': 'Darbu plāns', 'daily-plan': 'Dienas plāns'};
  const title = `${titles[kind]} - ${lead.title || lead.customer}`;

  const pdf = createStampedPdfBuffer({
    title,
    lines: [
      'UpRoof.EU | SIA UpLift | būvkomersanta reģistrācijas Nr. 18223',
      `Klients: ${lead.customer} | Objekts: ${lead.projectAddress || lead.address || 'nav norādīts'}`,
      `Dokuments: ${titles[kind]}`,
      ...(outputRows.slice(0, 120).map((row) => `${row.position || row.row || row.day || ''} | ${row.description || row.name || row.item || row.task || row.tasks || ''} | ${row.quantity || row.hours || ''} ${row.unit || ''} | €${row.totalExVat || row.total || row.totalLaborAndMaterials || ''}`)),
      'Darbu izpildes garantija: 10 gadi',
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
