import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeadById} from '@/lib/crmLeadsStore';
import {canPerform} from '@/lib/permissions';
import {generateEstimatorOutput} from '@/lib/estimatorEngine';
import {normalizeCrmEstimatorData} from '@/lib/crmEstimator';
import {z} from 'zod';

const bodySchema = z.object({
  estimatorData: z.record(z.string(), z.any()).optional(),
});

/**
 * POST /api/crm/leads/[id]/estimate
 * Generate estimator output (Piedāvājums + F2 forma) from CRM lead data
 */
export async function POST(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  if (!canPerform(session.role, 'viewProjects')) return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});

  const {id} = await params;
  const leadId = id as string;
  const lead = await getCrmLeadById(leadId);
  if (!lead) return NextResponse.json({ok: false, error: 'Lead not found'}, {status: 404});

  try {
    const body = bodySchema.parse(await request.json());
    const estimatorData = normalizeCrmEstimatorData(body.estimatorData || lead.estimatorData);

    // Validate required fields
    const missingFields = ['existingRoofArea', 'buildingType', 'desiredRoofCovering', 'materialType', 'roofPitch']
      .filter((key) => !estimatorData[key as keyof typeof estimatorData]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {ok: false, error: `Missing required fields: ${missingFields.join(', ')}`},
        {status: 400},
      );
    }

    // Generate outputs
    const output = generateEstimatorOutput(estimatorData);

    // Transform to match expected API format
    const result = {
      ok: true,
      outputs: {
        piedāvājums: {
          activeLineItems: output.piedāvājums.rows.map((row) => ({
            position: row.position,
            description: row.description,
            quantity: `${row.quantity}`,
            unit: row.unit,
            unitPrice: `${row.unitPrice}`,
            totalExVat: `${row.total}`,
            total: `${row.total}`,
          })),
          totals: output.piedāvājums.summary,
        },
        f2Estimate: {
          activeRows: output.f2Forma.rows.map((row) => ({
            row: row.row,
            name: row.description,
            description: row.description,
            quantity: `${row.quantity}`,
            unit: row.unit,
            unitPriceExVat: `${row.unitPrice}`,
            laborHours: `${row.laborHours}`,
            laborRate: '18.00',
            laborTotal: `${row.totalLabor}`,
            materialTotal: `${row.totalMaterial}`,
            mechanisms: `${row.mechanisms}`,
            totalLaborAndMaterials: `${row.total}`,
            total: `${row.total}`,
          })),
          totals: output.f2Forma.summary,
        },
        customerOffer: {
          activeLineItems: output.piedāvājums.rows.map((row) => ({
            description: row.description,
            quantity: `${row.quantity}`,
            unit: row.unit,
            unitPrice: `${row.unitPrice}`,
            totalExVat: `${row.total}`,
            total: `${row.total}`,
          })),
          totals: output.piedāvājums.summary,
        },
        materialsToUse: {
          consolidatedMaterials: output.materials,
        },
        workPlan: {
          tasks: output.workPlan,
        },
        dailyWorkLog: {
          tasks: output.dailyPlan,
        },
        settings: output.settings,
        projectOutputs: {
          tameInputs: estimatorData.tameInputs,
          summaryInputs: estimatorData.summaryInputs,
          workPlan: output.workPlan,
          dailyPlan: output.dailyPlan,
          materials: output.materials,
        },
        mechanismsAndTools: {
          rows: output.f2Forma.rows.map((row) => ({name: row.description, quantity: row.mechanisms || 0, unit: 'kpl'})),
        },
        crewProgress: {
          planned: output.dailyPlan,
          actual: [],
          variance: [],
        },
      },
      detailedEstimate: {
        activeRows: output.f2Forma.rows.map((row) => ({
          material: row.description,
          category: 'Material',
          quantity: row.quantity,
          quantityWithWaste: row.quantity * 1.05,
          unit: row.unit,
          unitPriceExVat: row.unitPrice,
          totalLaborAndMaterials: row.total,
        })),
      },
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Estimation error:', error);
    return NextResponse.json({ok: false, error: error?.message || 'Estimation failed'}, {status: 500});
  }
}

/**
 * GET /api/crm/leads/[id]/estimate
 * Get previously saved estimate data
 */
export async function GET(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  if (!canPerform(session.role, 'viewProjects')) return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});

  const {id} = await params;
  const lead = await getCrmLeadById(id);
  if (!lead) return NextResponse.json({ok: false, error: 'Lead not found'}, {status: 404});

  const result = {
    ok: true,
    lead: {
      id: lead.id,
      estimatorData: lead.estimatorData,
      processingStatus: lead.estimatorData?.processingStatus || 'draft',
    },
  };

  return NextResponse.json(result);
}
