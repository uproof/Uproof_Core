import {NextResponse} from 'next/server';
import {createSupabaseAdminClient} from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      throw new Error('Supabase unavailable');
    }

    const {error} = await supabase.from('rate_limits').select('identifier').limit(1);
    if (error) {
      throw error;
    }

    return NextResponse.json({ok: true, status: 'ready', timestamp: new Date().toISOString()});
  } catch (error: any) {
    return NextResponse.json({ok: false, status: 'not_ready', error: error?.message || 'unavailable'}, {status: 503});
  }
}
