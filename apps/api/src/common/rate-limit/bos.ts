import { createHash } from 'node:crypto';

import { Ratelimit } from '@upstash/ratelimit';
import { createAppLogger } from '../logger';

import {
  API_RATE_LIMIT_REDIS_PREFIX,
  BOS_PROVISIONING_RATE_LIMIT_MAX,
  BOS_PROVISIONING_RATE_LIMIT_SURFACE,
  BOS_PROVISIONING_RATE_LIMIT_WINDOW,
} from './constants';
import { getApiRateLimitRedis } from './redis';

const logger = createAppLogger('rate-limit-check');

let bosLimiter: Ratelimit | null | undefined;
let redisErrorWarned = false;

function getBosProvisioningLimiter(): Ratelimit | null {
  if (bosLimiter !== undefined) {
    return bosLimiter;
  }

  const redis = getApiRateLimitRedis();
  if (!redis) {
    bosLimiter = null;
    return bosLimiter;
  }

  bosLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      BOS_PROVISIONING_RATE_LIMIT_MAX,
      BOS_PROVISIONING_RATE_LIMIT_WINDOW,
    ),
    prefix: `${API_RATE_LIMIT_REDIS_PREFIX}:${BOS_PROVISIONING_RATE_LIMIT_SURFACE}`,
  });
  return bosLimiter;
}

/**
 * Stable fingerprint of the API key for Redis keys (never store the raw secret).
 * Falls back to IP when the header is missing (should not happen after auth).
 */
export function bosRateLimitKey(apiKeyHeader: string | undefined, ip: string): string {
  if (apiKeyHeader) {
    const fingerprint = createHash('sha256')
      .update(apiKeyHeader, 'utf8')
      .digest('hex')
      .slice(0, 16);
    return `key:${fingerprint}`;
  }
  return `ip:${ip || 'unknown'}`;
}

/**
 * Returns true when the caller is within the BOS provisioning limit.
 * Fail-open when Redis is unset or unreachable.
 */
export async function allowBosProvisioningRequest(key: string): Promise<boolean> {
  const limiter = getBosProvisioningLimiter();
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

/** Test-only: clear limiter cache and warn flag. */
export function resetBosRateLimitForTests(): void {
  bosLimiter = undefined;
  redisErrorWarned = false;
}
