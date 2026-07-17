import { Ratelimit } from '@upstash/ratelimit';

import { createAppLogger } from '../../common/logger';
import { API_RATE_LIMIT_REDIS_PREFIX } from '../../common/rate-limit/constants';
import { getApiRateLimitRedis } from '../../common/rate-limit/redis';

const MEDIA_PRESIGN_RATE_LIMIT_MAX = 20;
const MEDIA_PRESIGN_RATE_LIMIT_WINDOW = '1 m' as const;
const MEDIA_PRESIGN_SURFACE = 'mediaPresign';

const logger = createAppLogger('uploads-rate-limit');

let limiter: Ratelimit | null | undefined;
let redisErrorWarned = false;

function getMediaPresignLimiter(): Ratelimit | null {
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
    limiter: Ratelimit.slidingWindow(MEDIA_PRESIGN_RATE_LIMIT_MAX, MEDIA_PRESIGN_RATE_LIMIT_WINDOW),
    prefix: `${API_RATE_LIMIT_REDIS_PREFIX}:${MEDIA_PRESIGN_SURFACE}`,
  });
  return limiter;
}

/** Fail-open when Redis is unset or unreachable. */
export async function allowMediaPresignRequest(userId: string): Promise<boolean> {
  const rateLimiter = getMediaPresignLimiter();
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
export function resetMediaPresignRateLimitForTests(): void {
  limiter = undefined;
  redisErrorWarned = false;
}
