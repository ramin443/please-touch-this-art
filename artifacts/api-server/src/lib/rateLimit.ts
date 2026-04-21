export interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
}

export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  const buckets = new Map<string, Bucket>();

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      const existing = buckets.get(key);
      if (!existing || existing.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + options.windowMs });
        return { allowed: true, remaining: options.maxRequests - 1 };
      }
      if (existing.count >= options.maxRequests) {
        return { allowed: false, remaining: 0 };
      }
      existing.count += 1;
      return {
        allowed: true,
        remaining: options.maxRequests - existing.count,
      };
    },
  };
}
