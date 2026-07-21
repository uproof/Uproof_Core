import {NextRequest, NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/adminAuth';
import {createCrmUser, getCrmUsers} from '@/lib/crmUsersStore';
import {checkRateLimit, RATE_LIMITS} from '@/lib/rateLimit';
import {canPerform} from '@/lib/permissions';
import {validatePasswordPolicy} from '@/lib/secretVault';
import {z} from 'zod';

const createUserSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120, 'Name must be at most 120 characters'),
  password: z.string().trim().min(1, 'Password is required'),
});

function publicCrmUser(user: Awaited<ReturnType<typeof getCrmUsers>>[number]) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAtUtc: user.updatedAtUtc,
  };
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  if (!canPerform(session.role, 'viewCrmUsers')) {
    return NextResponse.json({ok: false, error: 'Only superadmin can list CRM users'}, {status: 403});
  }

  const users = await getCrmUsers();
  const salesUsers = users.filter((user) => user.role === 'sales');
  return NextResponse.json({ok: true, users: salesUsers.map(publicCrmUser)});
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
    }

    if (!canPerform(session.role, 'createCrmUsers')) {
      return NextResponse.json({ok: false, error: 'Only superadmin can create CRM users'}, {status: 403});
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const limiter = await checkRateLimit(`crm-user-create:${session.sid}:${ip}`, RATE_LIMITS.API_MUTATION);
    if (!limiter.allowed) {
      return NextResponse.json({ok: false, error: 'Too many requests'}, {status: 429});
    }

    const json = await req.json().catch(() => ({}));
    const validation = createUserSchema.safeParse(json);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input';
      return NextResponse.json({ok: false, error: firstError}, {status: 400});
    }

    const {email, name, password} = validation.data;

    const passwordPolicyError = validatePasswordPolicy(password);
    if (passwordPolicyError) {
      return NextResponse.json({ok: false, error: passwordPolicyError}, {status: 400});
    }

    const user = await createCrmUser({
      email,
      name,
      role: 'sales',
      password,
    });

    return NextResponse.json({
      ok: true,
      user: publicCrmUser(user),
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to create CRM user';
    if (/already been registered|already exists|duplicate/i.test(message)) {
      return NextResponse.json({ok: false, error: 'A user with this email already exists. Use password update instead.'}, {status: 409});
    }
    return NextResponse.json({ok: false, error: message}, {status: 500});
  }
}
