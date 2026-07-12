/** Redis key namespace for API rate-limit counters. */
export const API_RATE_LIMIT_REDIS_PREFIX = 'toonexpo:rl';

/** BOS provisioning: 60 requests / minute per API-key fingerprint (or IP). */
export const BOS_PROVISIONING_RATE_LIMIT_MAX = 60;

export const BOS_PROVISIONING_RATE_LIMIT_WINDOW = '1 m' as const;

export const BOS_PROVISIONING_RATE_LIMIT_SURFACE = 'bosProvisioning' as const;

export const RATE_LIMITED_HTTP_CODE = 'RATE_LIMITED' as const;
