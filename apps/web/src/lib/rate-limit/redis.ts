import { Redis } from '@upstash/redis';

import { loadWebEnv } from '@/lib/env';

let redisSingleton: Redis | null | undefined;
let missingConfigWarned = false;

/**
 * Shared Upstash Redis client for rate limiting.
 * Returns `null` when REST URL/token are unset so callers can fail open
 * (required for local/CI without Upstash).
 */
export function getRateLimitRedis(): Redis | null {
  if (redisSingleton !== undefined) {
    return redisSingleton;
  }

  const env = loadWebEnv();
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (!missingConfigWarned) {
      missingConfigWarned = true;
      console.warn(
        '[rate-limit] UPSTASH_REDIS_REST_URL/TOKEN unset — failing open (limits disabled)',
      );
    }
    redisSingleton = null;
    return redisSingleton;
  }

  redisSingleton = new Redis({ url, token });
  return redisSingleton;
}

/** Test-only: reset singleton + warn flag. */
export function resetRateLimitRedisForTests(): void {
  redisSingleton = undefined;
  missingConfigWarned = false;
}
