import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {findCrmLeadRowById, getCrmLeadById, isLeadAssignedToSalesUser} from '@/lib/crmLeadsStore';
import {getCrmUserByEmail} from '@/lib/crmUsersStore';
import {createCrmSupabaseClient} from '@/lib/crmStorage';
import {canPerform} from '@/lib/permissions';
import {checkRateLimit, RATE_LIMITS} from '@/lib/rateLimit';
import {z} from 'zod';

const categorySchema = z.enum(['contract', 'invoice', 'estimate', 'certificate', 'other']);
const MAX_FILE_BYTES = 10 * 1024 * 1024;

async function authorize(request: NextRequest, leadId: string, mutation = false) {
  const session = await getAdminSession();
  if (!session) return {error: NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401})};
  if (!canPerform(session.role, mutation ? 'manageProjects' : 'viewProjects')) return {error: NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403})};
  if (session.role === 'sales') {
    const salesUser = await getCrmUserByEmail(session.email);
    if (!salesUser || !(await isLeadAssignedToSalesUser(leadId, salesUser.id))) return {error: NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403})};
  }
  const lead = await getCrmLeadById(leadId);
  if (!lead) return {error: NextResponse.json({ok: false, error: 'Project not found'}, {status: 404})};
  const row = await findCrmLeadRowById(leadId);
  if (!row) return {error: NextResponse.json({ok: false, error: 'Project not found'}, {status: 404})};
  return {session, leadRowId: row.id};
}

export async function GET(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const access = await authorize(request, id);
  if ('error' in access) return access.error;
  const supabase = createCrmSupabaseClient();
  const {data, error} = await supabase.from('project_documents').select('id,category,file_name,mime_type,file_size,uploaded_by_email,uploaded_at').eq('lead_id', access.leadRowId).order('uploaded_at', {ascending: false});
  if (error) return NextResponse.json({ok: false, error: 'Failed to load project documents'}, {status: 500});
  return NextResponse.json({ok: true, documents: data || []}, {headers: {'Cache-Control': 'no-store'}});
}

export async function POST(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const access = await authorize(request, id, true);
  if ('error' in access) return access.error;
  const limiter = await checkRateLimit(`project-document-upload:${access.session.sid}`, RATE_LIMITS.API_MUTATION);
  if (!limiter.allowed) return NextResponse.json({ok: false, error: 'Too many uploads'}, {status: 429});

  const form = await request.formData();
  const file = form.get('file');
  const category = categorySchema.safeParse(form.get('category'));
  if (!(file instanceof File) || !category.success) return NextResponse.json({ok: false, error: 'A valid file and category are required'}, {status: 400});
  if (file.size <= 0 || file.size > MAX_FILE_BYTES) return NextResponse.json({ok: false, error: 'File must be between 1 byte and 10 MB'}, {status: 413});

  const bytes = Buffer.from(await file.arrayBuffer());
  const supabase = createCrmSupabaseClient();
  const {data, error} = await supabase.from('project_documents').insert({
    lead_id: access.leadRowId,
    category: category.data,
    file_name: file.name.replace(/[^a-zA-Z0-9._ -]/g, '_').slice(0, 180) || 'document',
    mime_type: file.type || 'application/octet-stream',
    file_size: file.size,
    content_base64: bytes.toString('base64'),
    uploaded_by_email: access.session.email,
  }).select('id,category,file_name,mime_type,file_size,uploaded_by_email,uploaded_at').single();
  if (error) return NextResponse.json({ok: false, error: 'Failed to save project document'}, {status: 500});
  return NextResponse.json({ok: true, document: data});
}
