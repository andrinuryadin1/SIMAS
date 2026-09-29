/**
 * Simple in-memory rate limiter untuk login dan cron endpoints
 * Production: gunakan Redis (Upstash/Vercel KV) atau database
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

export function rateLimit(config: RateLimitConfig) {
  const { maxRequests, windowMs, keyPrefix = "rl" } = config;

  return async function checkRateLimit(key: string): Promise<{
    success: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const now = Date.now();
    const fullKey = `${keyPrefix}:${key}`;
    const entry = rateLimitStore.get(fullKey);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      rateLimitStore.set(fullKey, {
        count: 1,
        resetTime: now + windowMs,
      });
      return {
        success: true,
        remaining: maxRequests - 1,
        resetTime: now + windowMs,
      };
    }

    if (entry.count >= maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      };
    }

    entry.count++;
    rateLimitStore.set(fullKey, entry);

    return {
      success: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  };
}

// Pre-configured rate limiters
export const loginRateLimiter = rateLimit({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyPrefix: "login",
});

export const cronRateLimiter = rateLimit({
  maxRequests: 10,
  windowMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: "cron",
});

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);