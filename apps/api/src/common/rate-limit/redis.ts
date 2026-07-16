import { Redis } from '@upstash/redis';
import { createAppLogger } from '../logger';

import { loadApiEnv } from '../env';

const logger = createAppLogger('rate-limit-redis');

let redisSingleton: Redis | null | undefined;
let missingConfigWarned = false;

/**
 * Shared Upstash Redis client for API rate limiting.
 * Returns `null` when REST URL/token are unset so callers can fail open.
 */
export function getApiRateLimitRedis(): Redis | null {
  if (redisSingleton !== undefined) {
    return redisSingleton;
  }

  const env = loadApiEnv();
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (!missingConfigWarned) {
      missingConfigWarned = true;
      logger.warn('UPSTASH_REDIS_REST_URL/TOKEN unset — failing open (limits disabled)');
    }
    redisSingleton = null;
    return redisSingleton;
  }

  redisSingleton = new Redis({ url, token });
  return redisSingleton;
}

/** Test-only: reset singleton + warn flag. */
export function resetApiRateLimitRedisForTests(): void {
  redisSingleton = undefined;
  missingConfigWarned = false;
}
