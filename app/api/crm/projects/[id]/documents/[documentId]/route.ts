import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {findCrmLeadRowById, getCrmLeadById, isLeadAssignedToSalesUser} from '@/lib/crmLeadsStore';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {createCrmSupabaseClient} from '@/lib/crmStorage';
import {canPerform} from '@/lib/permissions';

export async function GET(request: NextRequest, {params}: {params: Promise<{id: string; documentId: string}>}) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  if (!canPerform(session.role, 'viewProjects')) return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
  const {id, documentId} = await params;
  const lead = await getCrmLeadById(id);
  if (!lead) return NextResponse.json({ok: false, error: 'Project not found'}, {status: 404});
  const leadRow = await findCrmLeadRowById(id);
  if (!leadRow) return NextResponse.json({ok: false, error: 'Project not found'}, {status: 404});
  if (session.role === 'sales') {
    const salesUser = await getCrmUserByEmail(session.email);
    if (!salesUser || !(await isLeadAssignedToSalesUser(id, salesUser.id))) return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
  }

  const supabase = createCrmSupabaseClient();
  const {data, error} = await supabase.from('project_documents').select('file_name,mime_type,content_base64').eq('id', documentId).eq('lead_id', leadRow.id).maybeSingle();
  if (error || !data) return NextResponse.json({ok: false, error: 'Document not found'}, {status: 404});
  const content = Buffer.from(data.content_base64, 'base64');
  return new NextResponse(content, {headers: {'Content-Type': data.mime_type, 'Content-Disposition': `inline; filename="${data.file_name.replace(/[^a-zA-Z0-9._ -]/g, '_')}"`, 'Cache-Control': 'private, no-store'}});
}
