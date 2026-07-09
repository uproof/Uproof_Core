import {NextRequest, NextResponse} from 'next/server';
import {issuePasswordResetToken, getCrmUserByEmail} from '@/lib/crmUsersStore';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const email = String(body.email || '').trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ok: false, error: 'Email is required'}, {status: 400});
  }

  const user = await getCrmUserByEmail(email);
  if (!user) {
    return NextResponse.json({ok: true});
  }

  const token = await issuePasswordResetToken(user.id, email);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(req.url).origin;
  const resetUrl = `${baseUrl.replace(/\/$/, '')}/crm/reset-password/${token.token}`;

  return NextResponse.json({ok: true, resetUrl, expiresAt: token.expiresAt});
}