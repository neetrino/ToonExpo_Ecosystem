/** Redis key namespace for all web rate-limit counters. */
export const RATE_LIMIT_REDIS_PREFIX = 'toonexpo:rl';

/** Sliding-window limits per abuse-prone surface (requests / window). */
export const RATE_LIMIT_MAX = {
  login: 10,
  register: 5,
  publicRequest: 5,
  qr: 30,
  setPassword: 5,
  /** Builder media presign (signed R2 PUT URLs) per userId. */
  mediaPresign: 20,
} as const;

/** Window duration shared by all web surfaces. */
export const RATE_LIMIT_WINDOW = '1 m' as const;

export type RateLimitSurface = keyof typeof RATE_LIMIT_MAX;

export const RATE_LIMITED_ERROR_KEY = 'rateLimited' as const;

export type RateLimitedErrorKey = typeof RATE_LIMITED_ERROR_KEY;
