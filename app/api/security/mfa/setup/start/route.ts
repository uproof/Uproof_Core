import QRCode from 'qrcode';
import {NextResponse} from 'next/server';
import {getMfaSetupSession} from '@/lib/adminAuth';
import {buildOtpAuthUri, generateMfaSecret, signPendingMfaEnrollment} from '@/lib/mfa';
import {getCrmUserByEmail, getPlainMfaSecret} from '@/lib/crmUsersStore';

export async function POST() {
  const session = await getMfaSetupSession();
  if (!session) {
    return NextResponse.json({ok: false, error: 'Unauthorized'}, {status: 401});
  }

  const user = await getCrmUserByEmail(session.email);
  if (!user) {
    return NextResponse.json({ok: false, error: 'Account not found'}, {status: 404});
  }

  const existingSecret = getPlainMfaSecret(user);
  if (existingSecret) {
    return NextResponse.json({ok: true, alreadyConfigured: true});
  }

  const issuer = session.role === 'superadmin' ? 'UpRoof Admin' : 'UpRoof CRM';
  const secret = generateMfaSecret();
  const otpauthUri = buildOtpAuthUri({issuer, accountName: user.email, secret});
  const qrDataUrl = await QRCode.toDataURL(otpauthUri, {width: 256, margin: 1});
  const enrollmentToken = signPendingMfaEnrollment({email: user.email, role: session.role, secret});

  return NextResponse.json({
    ok: true,
    enrollmentToken,
    secret,
    qrDataUrl,
    otpauthUri,
    issuer,
    accountName: user.email,
  });
}