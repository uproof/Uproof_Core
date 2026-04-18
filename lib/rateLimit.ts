// Simple in-memory rate limiter for development
// For production, use Redis-based rate limiter
// This will reset on serverless cold starts (~every hour)

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

// Cleanup expired entries
declare global {
  var _rateLimitCleanup: NodeJS.Timeout | undefined;
}

if (typeof globalThis !== 'undefined' && !globalThis._rateLimitCleanup) {
  globalThis._rateLimitCleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimits.entries()) {
      if (now > entry.resetTime) {
        rateLimits.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

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
  const key = identifier;

  let entry = rateLimits.get(key);

  // Check if entry expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimits.set(key, entry);
  }

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const allowed = entry.count < config.maxRequests;

  if (allowed) {
    entry.count++;
  }

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  };
}

export const RATE_LIMITS = {
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 minutes
  CONTACT: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  API_MUTATION: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
};
