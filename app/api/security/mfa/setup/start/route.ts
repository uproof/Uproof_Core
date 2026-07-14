import QRCode from 'qrcode';
import {NextResponse} from 'next/server';

export async function POST(req: Request) {
  await req.arrayBuffer().catch(() => undefined);
  return NextResponse.json({ok: false, error: 'Authenticator setup is disabled. Use password-only login.'}, {status: 410});
}