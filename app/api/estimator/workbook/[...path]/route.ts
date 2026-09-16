import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {canPerform} from '@/lib/permissions';
import {getCrmLeadById, updateCrmLead} from '@/lib/crmLeadsStore';
import {calculateWorkbookEstimate, defaultWorkbookInputs, leadToWorkbook, workbookInputSchema, workbookSettingsResponse} from '@/lib/workbookEstimator';
import type {SettingsOverrides} from '@/lib/workbook-engine/settings';
import type {CrmWorkbookInputValue} from '@/lib/crmEstimator';
import f2Layout from '@/lib/workbook-engine/f2/layout.json';

type RouteContext = {params: Promise<{path: string[]}>};

async function authorize(permission: 'viewEstimates' | 'manageEstimates') {
  const session = await getAdminSession();
  return session && canPerform(session.role, permission) ? session : null;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ok: false, error: message}, {status});
}

export async function GET(_request: NextRequest, {params}: RouteContext) {
  if (!await authorize('viewEstimates')) return errorResponse('Unauthorized', 401);
  const path = (await params).path || [];
  if (path[0] === 'settings' && path[1] === 'active') {
    return NextResponse.json(workbookSettingsResponse());
  }
  if (path[0] === 'inputs' && path[1] === 'schema') return NextResponse.json(workbookInputSchema());
  if (path[0] === 'templates' && path[1] === 'offer') return NextResponse.json({});
  if (path[0] === 'templates' && path[1] === 'f2-layout') return NextResponse.json(f2Layout);
  if (path[0] === 'leads' && path[1]) {
    const lead = await getCrmLeadById(path[1]);
    if (!lead) return errorResponse('Lead not found', 404);
    if (path[2] === 'estimates') return NextResponse.json([]);
    const {inputs, terms, overrides} = leadToWorkbook(lead);
    return NextResponse.json({id: lead.id, terms, inputs, leadTimes: {}, overrides: overrides || {materials: {}, norms: {}, coil: {}, constants: {}, materialLeadTimes: {}}});
  }
  return errorResponse('Workbook estimator route not found', 404);
}

export async function PUT(request: NextRequest, {params}: RouteContext) {
  if (!await authorize('manageEstimates')) return errorResponse('Forbidden', 403);
  const path = (await params).path || [];
  if (path[0] !== 'leads' || !path[1]) return errorResponse('Lead route not found', 404);
  const lead = await getCrmLeadById(path[1]);
  if (!lead) return errorResponse('Lead not found', 404);
  const body = await request.json().catch(() => ({})) as {inputs?: Record<string, unknown>; terms?: Record<string, unknown>; overrides?: SettingsOverrides};
  const inputs = Object.fromEntries(Object.entries(body.inputs || {}).filter(([, value]) => value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) as Record<string, CrmWorkbookInputValue>;
  const current = lead.estimatorData || {};
  const updated = await updateCrmLead(path[1], {estimatorData: {
    ...current,
    workbookInputs: {...(current.workbookInputs || {}), ...inputs},
    engineOutputs: {...(current.engineOutputs || {}), workbookOverrides: body.overrides || current.engineOutputs?.workbookOverrides},
    offerDiscount: String(body.terms?.discount ?? current.offerDiscount ?? ''),
    offerVatRate: String(body.terms?.vatRate ?? current.offerVatRate ?? '0'),
    scheduleStartDate: String(body.terms?.startDate ?? current.scheduleStartDate ?? ''),
  }});
  return NextResponse.json({ok: true, lead: updated});
}

export async function POST(request: NextRequest, {params}: RouteContext) {
  if (!await authorize('viewEstimates')) return errorResponse('Forbidden', 403);
  const path = (await params).path || [];
  if (path[0] !== 'leads' || !path[1] || path[2] !== 'estimates') return errorResponse('Estimate route not found', 404);
  const lead = await getCrmLeadById(path[1]);
  if (!lead) return errorResponse('Lead not found', 404);
  const body = await request.json().catch(() => ({})) as {inputs?: Record<string, unknown>; terms?: Parameters<typeof calculateWorkbookEstimate>[2]; overrides?: SettingsOverrides};
  const stored = leadToWorkbook(lead);
  const inputs = (body.inputs || stored.inputs) as Parameters<typeof calculateWorkbookEstimate>[1];
  const terms = body.terms || stored.terms;
  try {
    const result = calculateWorkbookEstimate(lead, inputs, terms, body.overrides);
    if (path[3] !== 'preview') return NextResponse.json({id: Date.now(), createdAt: new Date().toISOString(), settingsVersionId: result.settingsVersionId, offerTotal: result.offer.total});
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : 'Estimate calculation failed', 422);
  }
}
