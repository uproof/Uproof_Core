import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {getCrmLeadById, isLeadAssignedToSalesUser} from '@/lib/crmLeadsStore';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {canPerform} from '@/lib/permissions';
import {createEmptyCrmEstimatorData, normalizeCrmEstimatorData} from '@/lib/crmEstimator';
import {calculateWorkbookProject, getWorkbookDefinitions, getWorkbookProcessingData, mapCrmEstimatorToWorkbookInputs, CRM_TO_WORKBOOK_KEYS} from '@/lib/upRoofCompleteEngine';
import {z} from 'zod';

const bodySchema = z.object({workbookInputs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}), estimatorData: z.record(z.string(), z.any()).optional()});

async function loadLead(request: NextRequest, leadId: string) {
  const session = await getAdminSession();
  if (!session) return {response: NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401})};
  if (!canPerform(session.role, 'viewEstimates')) return {response: NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403})};
  if (session.role === 'sales') {
    const user = await getCrmUserByEmail(session.email);
    if (!user || !(await isLeadAssignedToSalesUser(leadId, user.id))) return {response: NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403})};
  }
  const lead = await getCrmLeadById(leadId);
  if (!lead) return {response: NextResponse.json({ok: false, error: 'Lead not found'}, {status: 404})};
  return {session, lead: {...lead, estimatorData: normalizeCrmEstimatorData(lead.estimatorData, createEmptyCrmEstimatorData())}};
}

export async function GET(_request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const loaded = await loadLead(_request, id);
  if ('response' in loaded) return loaded.response;
  const storedInputs = loaded.lead.estimatorData.workbookInputs || {};
  const mappedInputs = mapCrmEstimatorToWorkbookInputs(loaded.lead.estimatorData);
  return NextResponse.json({ok: true, definitions: getWorkbookDefinitions(), values: {...mappedInputs, ...storedInputs}, crmKeys: [...CRM_TO_WORKBOOK_KEYS], processing: getWorkbookProcessingData(), adjustmentSheets: ['Materiālu cenas', 'Ch pozīcijas', 'Skārda detaļas', 'Slīpuma koef']});
}

export async function POST(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const loaded = await loadLead(request, id);
  if ('response' in loaded) return loaded.response;
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ok: false, error: 'Invalid workbook input values'}, {status: 400});
  const workbookInputs = parsed.data.workbookInputs;
  const estimatorData = parsed.data.estimatorData ? normalizeCrmEstimatorData(parsed.data.estimatorData, loaded.lead.estimatorData) : loaded.lead.estimatorData;
  const project = calculateWorkbookProject(loaded.lead, workbookInputs, estimatorData);
  return NextResponse.json({ok: true, workbookInputs, outputs: project.outputs, audit: project.audit});
}