import {createSupabaseAdminClient} from '@/lib/supabase/server';
import {nowIso} from '@/lib/crmDb';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
}> {
  const now = Date.now();
  const record = await readRateLimitRecord(identifier);

  let count = 0;
  let resetTime = now + config.windowMs;

  if (record && now <= record.resetTime) {
    count = record.count;
    resetTime = record.resetTime;
  }

  const allowed = count < config.maxRequests;
  const nextCount = allowed ? count + 1 : count;

  await writeRateLimitRecord(identifier, nextCount, resetTime);

  return {
    allowed,
    remaining: Math.max(0, config.maxRequests - nextCount),
    resetTime,
  };
}

export const RATE_LIMITS = {
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 minutes
  CONTACT: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  API_MUTATION: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
};

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const inMemoryRateLimits = new Map<string, RateLimitRecord>();

async function readRateLimitRecord(identifier: string): Promise<RateLimitRecord | null> {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {data, error} = await supabase
      .from('rate_limits')
      .select('count,reset_at')
      .eq('identifier', identifier)
      .maybeSingle();

    if (!error && data) {
      return {
        count: Number(data.count || 0),
        resetTime: Number(data.reset_at || 0),
      };
    }
  }

  return inMemoryRateLimits.get(identifier) || null;
}

async function writeRateLimitRecord(identifier: string, count: number, resetTime: number): Promise<void> {
  const payload = {
    identifier,
    count,
    reset_at: resetTime,
    updated_at_utc: nowIso(),
  };

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const {error} = await supabase.from('rate_limits').upsert(payload);
    if (!error) {
      inMemoryRateLimits.set(identifier, {count, resetTime});
      return;
    }
  }

  inMemoryRateLimits.set(identifier, {count, resetTime});
}
