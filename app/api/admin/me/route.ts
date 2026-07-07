import {NextResponse} from 'next/server';
import {isSuperadminAuthenticated} from '@/lib/adminAuth';

export async function GET() {
  const ok = await isSuperadminAuthenticated();
  return NextResponse.json({ok});
}
