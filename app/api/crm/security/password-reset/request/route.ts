import {NextRequest, NextResponse} from 'next/server';
import {issuePasswordResetToken, getCrmUserByEmail} from '@/lib/crmUsersStore';
import {isCrmHost} from '@/lib/internalRouting';
import {z} from 'zod';

const requestResetSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production' && !isCrmHost(req.nextUrl.hostname)) {
    return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
  }

  const json = await req.json().catch(() => ({}));
  const validation = requestResetSchema.safeParse(json);

  if (!validation.success) {
    return NextResponse.json({ok: false, error: 'Valid email is required'}, {status: 400});
  }

  const {email} = validation.data;

  const user = await getCrmUserByEmail(email);
  if (!user) {
    // Return success even if user not found to prevent user enumeration
    return NextResponse.json({ok: true});
  }

  const token = await issuePasswordResetToken(user.id, email);
  const responseBody: Record<string, unknown> = {ok: true, expiresAt: token.expiresAt};

  if (process.env.NODE_ENV !== 'production') {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(req.url).origin;
    responseBody.resetUrl = `${baseUrl.replace(/\/$/, '')}/crm/reset-password/${token.token}`;
  }

  return NextResponse.json(responseBody);
}
