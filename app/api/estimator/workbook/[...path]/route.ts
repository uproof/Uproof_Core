import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {canPerform} from '@/lib/permissions';
import {getCrmLeadById, updateCrmLead} from '@/lib/crmLeadsStore';
import {calculateWorkbookEstimate, defaultWorkbookInputs, leadToWorkbook, workbookBundle, workbookInputSchema, type WorkbookSettingsOverrides} from '@/lib/workbookEstimator';
import type {CrmWorkbookInputValue} from '@/lib/crmEstimator';

type RouteContext = {params: Promise<{path: string[]}>};

async function auth() {
  const session = await getAdminSession();
  return session && canPerform(session.role, 'viewEstimates') ? session : null;
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ok: false, error: message}, {status});
}

export async function GET(_request: NextRequest, {params}: RouteContext) {
  const session = await auth();
  if (!session) return jsonError('Unauthorized', 401);
  const path = (await params).path || [];
  if (path[0] === 'settings' && path[1] === 'active') {
    return NextResponse.json({version: {id: 1, importedAt: '2026-09-16', note: 'Workbook parity engine'}, values: workbookBundle.settings});
  }
  if (path[0] === 'inputs' && path[1] === 'schema') return NextResponse.json(workbookInputSchema());
  if (path[0] === 'leads' && path[1]) {
    const lead = await getCrmLeadById(path[1]);
    if (!lead) return jsonError('Lead not found', 404);
    const {inputs, terms} = leadToWorkbook(lead);
    return NextResponse.json({id: lead.id, terms, inputs});
  }
  return jsonError('Workbook estimator route not found', 404);
}

export async function PUT(request: NextRequest, {params}: RouteContext) {
  const session = await auth();
  if (!session || !canPerform(session.role, 'manageEstimates')) return jsonError('Forbidden', 403);
  const path = (await params).path || [];
  if (path[0] !== 'leads' || !path[1]) return jsonError('Lead route not found', 404);
  const body = await request.json().catch(() => ({}));
  const lead = await getCrmLeadById(path[1]);
  if (!lead) return jsonError('Lead not found', 404);
  const next = body && typeof body === 'object' ? body as {inputs?: Record<string, unknown>; terms?: Record<string, unknown>} : {};
  const current = lead.estimatorData || {};
  const workbookInputs = Object.fromEntries(Object.entries(next.inputs || {}).filter(([, value]) => value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) as Record<string, CrmWorkbookInputValue>;
  const updated = await updateCrmLead(path[1], {estimatorData: {
    ...current,
    workbookInputs: {...(current.workbookInputs || {}), ...workbookInputs},
    offerDiscount: String(next.terms?.discount ?? current.offerDiscount ?? ''),
    offerVatRate: String(next.terms?.vatRate ?? current.offerVatRate ?? '0'),
    scheduleStartDate: String(next.terms?.startDate ?? current.scheduleStartDate ?? ''),
  }});
  return NextResponse.json({ok: true, lead: updated});
}

export async function POST(request: NextRequest, {params}: RouteContext) {
  const session = await auth();
  if (!session || !canPerform(session.role, 'viewEstimates')) return jsonError('Forbidden', 403);
  const path = (await params).path || [];
  if (path[0] !== 'leads' || !path[1] || path[2] !== 'estimates' || path[3] !== 'preview') return jsonError('Preview route not found', 404);
  const body = await request.json().catch(() => ({}));
  const lead = await getCrmLeadById(path[1]);
  if (!lead) return jsonError('Lead not found', 404);
  const inputs = body.inputs && typeof body.inputs === 'object' ? body.inputs : defaultWorkbookInputs();
  const terms = body.terms && typeof body.terms === 'object' ? body.terms : leadToWorkbook(lead).terms;
  const result = calculateWorkbookEstimate(lead, inputs, terms, body.overrides as WorkbookSettingsOverrides | undefined);
  return NextResponse.json(result);
}
