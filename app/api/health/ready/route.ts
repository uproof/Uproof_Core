import {NextResponse} from 'next/server';
import {getDb} from '@/lib/crmDb';

export async function GET() {
  try {
    const db = getDb();
    db.prepare('SELECT 1').get();
    return NextResponse.json({ok: true, status: 'ready', timestamp: new Date().toISOString()});
  } catch (error: any) {
    return NextResponse.json({ok: false, status: 'not_ready', error: error?.message || 'unavailable'}, {status: 503});
  }
}
