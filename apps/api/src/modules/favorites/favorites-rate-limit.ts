import { Ratelimit } from '@upstash/ratelimit';

import { createAppLogger } from '../../common/logger';
import { API_RATE_LIMIT_REDIS_PREFIX } from '../../common/rate-limit/constants';
import { getApiRateLimitRedis } from '../../common/rate-limit/redis';

const FAVORITE_TOGGLE_RATE_LIMIT_MAX = 30;
const FAVORITE_TOGGLE_RATE_LIMIT_WINDOW = '1 m' as const;
const FAVORITE_TOGGLE_SURFACE = 'favoriteToggle';

const logger = createAppLogger('favorites-rate-limit');

let limiter: Ratelimit | null | undefined;
let redisErrorWarned = false;

function getFavoriteToggleLimiter(): Ratelimit | null {
  if (limiter !== undefined) {
    return limiter;
  }

  const redis = getApiRateLimitRedis();
  if (!redis) {
    limiter = null;
    return limiter;
  }

  limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      FAVORITE_TOGGLE_RATE_LIMIT_MAX,
      FAVORITE_TOGGLE_RATE_LIMIT_WINDOW,
    ),
    prefix: `${API_RATE_LIMIT_REDIS_PREFIX}:${FAVORITE_TOGGLE_SURFACE}`,
  });
  return limiter;
}

/** Fail-open when Redis is unset or unavailable. */
export async function allowFavoriteToggleRequest(userId: string): Promise<boolean> {
  const rateLimiter = getFavoriteToggleLimiter();
  if (!rateLimiter) {
    return true;
  }

  try {
    const result = await rateLimiter.limit(`user:${userId}`);
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
export function resetFavoriteToggleRateLimitForTests(): void {
  limiter = undefined;
  redisErrorWarned = false;
}
