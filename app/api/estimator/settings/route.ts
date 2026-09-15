import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {canPerform} from '@/lib/permissions';
import {getEstimatorSettings, saveEstimatorSettings} from '@/lib/estimatorSettingsStore';

export async function GET() {
  const session = await getAdminSession();
  if (!session || !canPerform(session.role, 'viewEstimates')) return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
  try { const settings = await getEstimatorSettings(); return NextResponse.json({ok: true, settings, revision: settings.revision}); }
  catch { return NextResponse.json({ok: false, error: 'Unable to load estimator settings'}, {status: 503}); }
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminSession();
  if (!session || !canPerform(session.role, 'updateAssignedLeads')) return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
  try { const settings = await saveEstimatorSettings((await request.json()).settings); return NextResponse.json({ok: true, settings, revision: settings.revision}); }
  catch { return NextResponse.json({ok: false, error: 'Unable to save estimator settings'}, {status: 503}); }
}