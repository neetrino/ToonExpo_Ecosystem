import { Ratelimit } from '@upstash/ratelimit';

import { createAppLogger } from '../../common/logger';
import { API_RATE_LIMIT_REDIS_PREFIX } from '../../common/rate-limit/constants';
import { getApiRateLimitRedis } from '../../common/rate-limit/redis';

const MAX_REQUESTS = 10;
const WINDOW = '1 m' as const;
const logger = createAppLogger('public-request-rate-limit');
let limiter: Ratelimit | null | undefined;
let warned = false;

function getLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter;
  const redis = getApiRateLimitRedis();
  if (!redis) return (limiter = null);
  limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, WINDOW),
    prefix: `${API_RATE_LIMIT_REDIS_PREFIX}:publicRequest`,
  });
  return limiter;
}

export async function allowPublicRequest(ip: string): Promise<boolean> {
  const rateLimiter = getLimiter();
  if (!rateLimiter) return true;
  try {
    return (await rateLimiter.limit(`ip:${ip}`)).success;
  } catch (error) {
    if (!warned) {
      warned = true;
      logger.warn({ err: error }, 'Upstash error — failing open');
    }
    return true;
  }
}
