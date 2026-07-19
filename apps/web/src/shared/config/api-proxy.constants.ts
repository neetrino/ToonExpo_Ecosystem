/** Server-only env var: when set, Next.js rewrites `/api/v1/*` to this origin. */
export const API_PROXY_TARGET_ENV = "API_PROXY_TARGET" as const;

/** Must match `@toonexpo/contracts` `API_V1_PREFIX`. */
export const API_V1_PREFIX = "/api/v1" as const;
