import { Ratelimit } from '@upstash/ratelimit';

import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_REDIS_PREFIX,
  RATE_LIMIT_WINDOW,
  RATE_LIMITED_ERROR_KEY,
  type RateLimitSurface,
  type RateLimitedErrorKey,
} from './constants';
import { resolveClientIp } from './client-ip';
import { getRateLimitRedis } from './redis';

export type RateLimitCheckResult =
  { limited: false } | { limited: true; errorKey: RateLimitedErrorKey };

const limiterCache = new Map<RateLimitSurface, Ratelimit>();
let redisErrorWarned = false;

function getLimiter(surface: RateLimitSurface): Ratelimit | null {
  const redis = getRateLimitRedis();
  if (!redis) {
    return null;
  }

  const cached = limiterCache.get(surface);
  if (cached) {
    return cached;
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX[surface], RATE_LIMIT_WINDOW),
    prefix: `${RATE_LIMIT_REDIS_PREFIX}:${surface}`,
  });
  limiterCache.set(surface, limiter);
  return limiter;
}

function warnRedisFailure(error: unknown): void {
  if (redisErrorWarned) {
    return;
  }
  redisErrorWarned = true;
  console.warn('[rate-limit] Upstash error — failing open', error);
}

/**
 * Sliding-window check. Fail-open when Redis is unset or unreachable
 * so local/CI stay green without Upstash.
 */
export async function assertNotRateLimited(
  surface: RateLimitSurface,
  key: string,
): Promise<RateLimitCheckResult> {
  const limiter = getLimiter(surface);
  if (!limiter) {
    return { limited: false };
  }

  try {
    const result = await limiter.limit(key);
    if (result.success) {
      return { limited: false };
    }
    return { limited: true, errorKey: RATE_LIMITED_ERROR_KEY };
  } catch (error) {
    warnRedisFailure(error);
    return { limited: false };
  }
}

/** Rate-limit by resolved client IP for the given surface. */
export async function assertIpNotRateLimited(
  surface: RateLimitSurface,
): Promise<RateLimitCheckResult> {
  const ip = await resolveClientIp();
  return assertNotRateLimited(surface, ip);
}

/** Test-only: clear limiter cache and error-warn flag. */
export function resetRateLimitCheckForTests(): void {
  limiterCache.clear();
  redisErrorWarned = false;
}
