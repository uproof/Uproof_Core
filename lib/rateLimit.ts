import {createSupabaseAdminClient} from '@/lib/supabase/server';
import {nowIso} from '@/lib/crmDb';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // milliseconds
}

let remoteRateLimitsEnabled = true;

function getSupabaseErrorInfo(error: unknown) {
  if (!error || typeof error !== 'object') {
    return {message: '', status: 0, code: ''};
  }

  const candidate = error as {message?: unknown; status?: unknown; code?: unknown; details?: unknown; hint?: unknown};
  const status = Number(candidate.status);
  const message = [candidate.message, candidate.details, candidate.hint].filter((part) => typeof part === 'string' && part.trim()).join(' ');
  return {
    message,
    status: Number.isFinite(status) ? status : 0,
    code: typeof candidate.code === 'string' ? candidate.code : '',
  };
}

function isRemoteRateLimitUnavailable(error: unknown) {
  const info = getSupabaseErrorInfo(error);
  return (
    info.status === 403 ||
    info.status === 404 ||
    info.status === 42501 ||
    /permission denied|does not exist|schema cache|relation .*rate_limits|rate_limits/i.test(info.message) ||
    /42501/.test(info.code)
  );
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

  const stored = await writeRateLimitRecord(identifier, nextCount, resetTime);
  if (process.env.NODE_ENV === 'production' && !stored) {
    return {allowed: false, remaining: 0, resetTime};
  }

  return {
    allowed,
    remaining: Math.max(0, config.maxRequests - nextCount),
    resetTime,
  };
}

export async function isRateLimitAllowed(identifier: string, config: RateLimitConfig): Promise<boolean> {
  const now = Date.now();
  const record = await readRateLimitRecord(identifier);
  if (process.env.NODE_ENV === 'production' && !remoteRateLimitsEnabled) {
    return false;
  }
  return !record || now > record.resetTime || record.count < config.maxRequests;
}

export async function clearRateLimit(identifier: string): Promise<void> {
  if (remoteRateLimitsEnabled) {
    const supabase = createSupabaseAdminClient();
    if (supabase) {
      const {error} = await supabase.from('rate_limits').delete().eq('identifier', identifier);
      if (!error) {
        inMemoryRateLimits.delete(identifier);
        return;
      }

      if (isRemoteRateLimitUnavailable(error)) {
        remoteRateLimitsEnabled = false;
      }
    }
  }

  inMemoryRateLimits.delete(identifier);
}

export const RATE_LIMITS = {
  LOGIN: { maxRequests: 20, windowMs: 10 * 60 * 1000 }, // 20 per 10 minutes
  CONTACT: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  API_MUTATION: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
};

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const inMemoryRateLimits = new Map<string, RateLimitRecord>();

async function readRateLimitRecord(identifier: string): Promise<RateLimitRecord | null> {
  if (remoteRateLimitsEnabled) {
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

      if (error && isRemoteRateLimitUnavailable(error)) {
        remoteRateLimitsEnabled = false;
      }
    } else {
      remoteRateLimitsEnabled = false;
    }
  }

  return inMemoryRateLimits.get(identifier) || null;
}

async function writeRateLimitRecord(identifier: string, count: number, resetTime: number): Promise<boolean> {
  const payload = {
    identifier,
    count,
    reset_at: resetTime,
    updated_at_utc: nowIso(),
  };

  if (remoteRateLimitsEnabled) {
    const supabase = createSupabaseAdminClient();
    if (supabase) {
      const {error} = await supabase.from('rate_limits').upsert(payload);
      if (!error) {
        inMemoryRateLimits.set(identifier, {count, resetTime});
        return true;
      }

      if (isRemoteRateLimitUnavailable(error)) {
        remoteRateLimitsEnabled = false;
      }
      if (process.env.NODE_ENV === 'production') {
        return false;
      }
    }
  }

  inMemoryRateLimits.set(identifier, {count, resetTime});
  return process.env.NODE_ENV !== 'production';
}
