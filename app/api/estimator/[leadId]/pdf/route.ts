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

const querySchema = z.object({kind: z.enum(['f2', 'offer', 'materials', 'work-plan', 'daily-plan', 'mechanisms']).default('offer'), version: z.enum(['current', 'previous']).default('current')});

const workbookMechanisms = [
  {description: 'Šīfera demontāža 12kg/m2', mechanism: 'lauznis', tools: 'lauznis'},
  {description: 'Nocelšana', mechanism: 'fleksis', tools: 'Rācija, štropes'},
  {description: 'Latojuma un valcprofila uzcelšana', mechanism: 'Rācija, štropes', tools: 'Vates nazis, skrūvmašīna un uzgaļi'},
  {description: 'Jumta siltinājuma montāža', mechanism: 'vates nazis, skavotājs', tools: 'Respirators, nazis un asmeņi'},
  {description: 'Starplatojums un šķērslatojums', mechanism: 'cirkulārais zāģis, naglu pistole', tools: 'Līmeņrādis, striķis un krīts'},
  {description: 'Apakšlāsene un skārda detaļas', mechanism: 'skārdnieka instrumenti, aizvalcētājs', tools: 'Kniedētājs, āķu locāmais'},
  {description: 'Teknes un noteksistēmas', mechanism: 'frēze, skārdnieka instrumenti', tools: 'Līmeņrādis, skrūvmašīna un uzgaļi'},
];

export async function GET(request: NextRequest, {params}: {params: Promise<{leadId: string}>}) {
  let session;
  try {
    session = await getAdminSession();
  } catch (error) {
    console.error('Estimator PDF authentication failed:', error);
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }
  if (!session) return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  if (!canPerform(session.role, 'viewEstimates')) return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
  const {leadId} = await params;
  const lead = await getCrmLeadById(leadId);
  if (!lead) return NextResponse.json({ok: false, error: 'Lead not found'}, {status: 404});

  const {kind, version} = querySchema.parse({kind: request.nextUrl.searchParams.get('kind') || 'offer', version: request.nextUrl.searchParams.get('version') || 'current'});

  // Normalize estimator data
  const estimatorData = normalizeCrmEstimatorData(lead.estimatorData);

  // Generate the native estimate so every workbook page has a PDF source.
  const savedOutputs = lead.estimatorData?.engineOutputs || {};
  const previousRuns = Array.isArray(savedOutputs.previousRuns) ? savedOutputs.previousRuns : [];
  const selectedOutputs = version === 'previous' && previousRuns.length > 0
    ? previousRuns[previousRuns.length - 1]?.outputs || savedOutputs
    : savedOutputs;
  let generated;
  try {
    generated = generateEstimatorOutput(estimatorData);
  } catch (error) {
    console.error('Failed to generate estimate:', error);
    return NextResponse.json({ok: false, error: 'Could not generate estimate'}, {status: 500});
  }

  const saved = selectedOutputs as Record<string, Record<string, unknown>>;
  const savedOfferRows = Array.isArray(saved.customerOffer?.activeLineItems) ? saved.customerOffer.activeLineItems as Array<Record<string, unknown>> : [];
  const savedF2Rows = Array.isArray(saved.f2Estimate?.activeRows) ? saved.f2Estimate.activeRows as Array<Record<string, unknown>> : [];
  if (savedOfferRows.length > 0) {
    generated.piedāvājums.rows = savedOfferRows.map((row, index) => ({
      position: Number(row.position || index + 1),
      description: String(row.description || ''),
      specification: String(row.specification || ''),
      unit: String(row.unit || ''),
      quantity: Number(row.quantity || 0),
      unitPrice: Number(row.unitPrice || 0),
      total: Number(row.total || row.totalExVat || 0),
    }));
  }
  if (savedF2Rows.length > 0) {
    generated.f2Forma.rows = savedF2Rows.map((row, index) => ({
      row: Number(row.row || index + 1),
      description: String(row.description || row.name || ''),
      unit: String(row.unit || ''),
      quantity: Number(row.quantity || 0),
      unitPrice: Number(row.unitPriceExVat || row.unitPrice || 0),
      unitLabor: Number(row.unitLabor || 0),
      laborHours: Number(row.laborHours || 0),
      totalMaterial: Number(row.materialTotal || 0),
      totalLabor: Number(row.laborTotal || 0),
      mechanisms: Number(row.mechanisms || 0),
      overhead: Number(row.overhead || 0),
      profit: Number(row.profit || 0),
      total: Number(row.totalLaborAndMaterials || row.total || 0),
    }));
  }
  const savedMaterialRows = Array.isArray(saved.materialsToUse?.consolidatedMaterials)
    ? saved.materialsToUse.consolidatedMaterials as Array<Record<string, unknown>>
    : [];
  const savedWorkPlanRows = Array.isArray(saved.workPlan?.tasks)
    ? saved.workPlan.tasks as Array<Record<string, unknown>>
    : [];
  const savedDailyPlanRows = Array.isArray(saved.dailyWorkLog?.tasks)
    ? saved.dailyWorkLog.tasks as Array<Record<string, unknown>>
    : [];
  const savedMechanismRows = Array.isArray(saved.mechanismsAndTools?.rows) ? saved.mechanismsAndTools.rows as Array<Record<string, unknown>> : [];
  const generatedMechanismRows = generated.f2Forma.rows
    .filter((row) => Number(row.mechanisms || 0) > 0)
    .map((row) => ({description: row.description, mechanism: row.mechanisms, tools: ''}));
  const mechanismRows = savedMechanismRows.length > 0 ? savedMechanismRows : generatedMechanismRows.length > 0 ? generatedMechanismRows : workbookMechanisms;
  const outputRows = kind === 'offer'
    ? generated.piedāvājums.rows
    : kind === 'f2'
      ? generated.f2Forma.rows
      : kind === 'materials'
        ? savedMaterialRows.length > 0 ? savedMaterialRows : generated.materials
        : kind === 'daily-plan'
          ? savedDailyPlanRows.length > 0 ? savedDailyPlanRows : generated.dailyPlan || []
            : kind === 'mechanisms'
              ? mechanismRows
              : savedWorkPlanRows.length > 0 ? savedWorkPlanRows : generated.workPlan;
    const titles = {offer: 'Piedāvājums', f2: 'Lokālā tāme Nr.1 - F2 forma', materials: 'Materiālu saraksts', 'work-plan': 'Darbu plāns', 'daily-plan': 'Dienas plāns', mechanisms: 'Mehānismu saraksts'};
  let pdf: Buffer;
  try {
    pdf = kind === 'offer' || kind === 'f2'
      ? await createWorkbookPdfBuffer(generated, kind, lead.customer, lead.projectAddress || lead.address || 'nav norādīts')
      : await createWorkbookListPdfBuffer(titles[kind], outputRows as Array<Record<string, unknown>>);
  } catch (error) {
    console.error('Estimator PDF renderer failed; using emergency PDF fallback', error);
    const fallbackRows = (outputRows as Array<Record<string, unknown>>).slice(0, 200).map((row) => `${row.position || row.row || row.day || ''} | ${row.description || row.name || row.item || row.task || row.tasks || ''} | ${row.quantity || row.hours || ''} ${row.unit || ''} | €${row.totalExVat || row.total || row.totalLaborAndMaterials || ''}`);
    pdf = await createWorkbookListPdfBuffer(`${titles[kind]} - ${lead.title || lead.customer}`, fallbackRows.map((line) => ({description: line})));
  }

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${lead.id}-${kind}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
