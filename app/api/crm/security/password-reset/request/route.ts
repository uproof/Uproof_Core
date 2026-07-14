import {NextRequest, NextResponse} from 'next/server';
import {issuePasswordResetToken, getCrmUserByEmail} from '@/lib/crmUsersStore';
import {isCrmHost} from '@/lib/internalRouting';
import {parseEmail} from '@/lib/authValidation';

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production' && !isCrmHost(req.nextUrl.hostname)) {
    return NextResponse.json({ok: false, error: 'Forbidden'}, {status: 403});
  }

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const email = parseEmail(body.email);

  if (!email) {
    return NextResponse.json({ok: false, error: 'Email is required'}, {status: 400});
  }

  const user = await getCrmUserByEmail(email);
  if (!user) {
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