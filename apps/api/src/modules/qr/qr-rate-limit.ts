import { Ratelimit } from '@upstash/ratelimit';

import { createAppLogger } from '../../common/logger';
import { API_RATE_LIMIT_REDIS_PREFIX } from '../../common/rate-limit/constants';
import { getApiRateLimitRedis } from '../../common/rate-limit/redis';

const QR_RATE_LIMIT_MAX = 30;
const QR_RATE_LIMIT_WINDOW = '1 m' as const;
const logger = createAppLogger('qr-rate-limit');
let limiter: Ratelimit | null | undefined;
let redisErrorWarned = false;

function getQrLimiter(): Ratelimit | null {
  if (limiter !== undefined) {
    return limiter;
  }
  const redis = getApiRateLimitRedis();
  limiter = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(QR_RATE_LIMIT_MAX, QR_RATE_LIMIT_WINDOW),
        prefix: `${API_RATE_LIMIT_REDIS_PREFIX}:qr`,
      })
    : null;
  return limiter;
}

/** Fail-open when Redis is unavailable so QR remains usable at the venue. */
export async function allowQrRequest(key: string): Promise<boolean> {
  const rateLimiter = getQrLimiter();
  if (!rateLimiter) {
    return true;
  }
  try {
    return (await rateLimiter.limit(key)).success;
  } catch (error) {
    if (!redisErrorWarned) {
      redisErrorWarned = true;
      logger.warn({ err: error }, 'Upstash error — failing open');
    }
    return true;
  }
}
