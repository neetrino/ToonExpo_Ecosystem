import { Ratelimit } from '@upstash/ratelimit';

import { createAppLogger } from '../../common/logger';
import { API_RATE_LIMIT_REDIS_PREFIX } from '../../common/rate-limit/constants';
import { getApiRateLimitRedis } from '../../common/rate-limit/redis';
import {
  AUTH_RATE_LIMIT_MAX,
  AUTH_RATE_LIMIT_WINDOW,
  type AuthRateLimitSurface,
} from './auth.constants';

const logger = createAppLogger('auth-rate-limit');

const limiters = new Map<AuthRateLimitSurface, Ratelimit | null>();
let redisErrorWarned = false;

function getLimiter(surface: AuthRateLimitSurface): Ratelimit | null {
  if (limiters.has(surface)) {
    return limiters.get(surface) ?? null;
  }

  const redis = getApiRateLimitRedis();
  if (!redis) {
    limiters.set(surface, null);
    return null;
  }

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(AUTH_RATE_LIMIT_MAX[surface], AUTH_RATE_LIMIT_WINDOW),
    prefix: `${API_RATE_LIMIT_REDIS_PREFIX}:${surface}`,
  });
  limiters.set(surface, limiter);
  return limiter;
}

/** Returns true when the caller is within the limit. Fail-open without Redis. */
export async function allowAuthRequest(
  surface: AuthRateLimitSurface,
  key: string,
): Promise<boolean> {
  const limiter = getLimiter(surface);
  if (!limiter) {
    return true;
  }

  try {
    const result = await limiter.limit(key);
    return result.success;
  } catch (error) {
    if (!redisErrorWarned) {
      redisErrorWarned = true;
      logger.warn({ err: error }, 'Upstash error — failing open');
    }
    return true;
  }
}

/** Test-only reset. */
export function resetAuthRateLimitForTests(): void {
  limiters.clear();
  redisErrorWarned = false;
}
