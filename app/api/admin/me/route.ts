import {NextResponse} from 'next/server';
import {isAdminAuthenticated} from '@/lib/adminAuth';

export async function GET() {
  const ok = isAdminAuthenticated();
  return NextResponse.json({ok});
}
