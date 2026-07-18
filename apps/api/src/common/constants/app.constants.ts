/**
 * Shared runtime constants for the NestJS API.
 */

export const DEFAULT_API_PORT = 4000;

export const API_SERVICE_NAME = "toonexpo-api";

export const API_PACKAGE_VERSION = "0.0.0";

export const SWAGGER_PATH = "docs";

export const HEALTH_DB_PROBE_SQL = "SELECT 1";

export const NODE_ENV_PRODUCTION = "production";

export const NODE_ENV_TEST = "test";

export const NODE_ENV_DEVELOPMENT = "development";

/** Opaque session token entropy (≥256 bits). */
export const SESSION_TOKEN_BYTES = 32;

/**
 * ADAPTIVE VALUE — confirm with owner.
 * Idle window before sliding expiry requires activity (7 days).
 */
export const DEFAULT_SESSION_IDLE_TTL_SECONDS = 7 * 24 * 60 * 60;

/**
 * ADAPTIVE VALUE — confirm with owner.
 * Absolute session lifetime from creation (30 days).
 */
export const DEFAULT_SESSION_ABSOLUTE_TTL_SECONDS = 30 * 24 * 60 * 60;

/**
 * Approved starting point (2026-07-19): coalesce session lastSeenAt / idle
 * sliding updates so authenticated traffic does not UPDATE sessions every request.
 */
export const SESSION_TOUCH_INTERVAL_MS = 10 * 60 * 1000;

export const DEFAULT_SESSION_COOKIE_NAME = "toonexpo_session";

/**
 * Cloud Run (and similar) terminate TLS at the platform frontend.
 * Trust only the first proxy hop so `req.ip` reflects the client.
 */
export const TRUST_PROXY_HOPS = 1;

/**
 * Approved starting points for Neon/pg pool (tune after load test).
 * Keep Cloud Run max instances × DB_POOL_MAX under the Neon connection budget.
 */
export const DEFAULT_DB_POOL_MAX = 8;

export const DEFAULT_DB_POOL_CONNECTION_TIMEOUT_MS = 5_000;

export const DEFAULT_DB_STATEMENT_TIMEOUT_MS = 10_000;

/** Safe HTTP methods that never require CSRF tokens. */
export const CSRF_SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * ADAPTIVE VALUE — confirm with owner.
 * Auth endpoint rate limit: attempts per IP per window.
 */
export const AUTH_RATE_LIMIT_LIMIT = 10;

/**
 * ADAPTIVE VALUE — confirm with owner.
 * Auth endpoint rate limit window in milliseconds (1 minute).
 */
export const AUTH_RATE_LIMIT_TTL_MS = 60_000;

/**
 * Global throttler uses a higher ceiling than auth-only endpoints because it
 * covers all routes; auth limits remain the baseline per {@link AUTH_RATE_LIMIT_LIMIT}.
 */
export const GLOBAL_RATE_LIMIT_AUTH_MULTIPLIER = 10;

/** Default global rate limit derived from auth baseline × multiplier. */
export const DEFAULT_GLOBAL_RATE_LIMIT =
  AUTH_RATE_LIMIT_LIMIT * GLOBAL_RATE_LIMIT_AUTH_MULTIPLIER;

/**
 * ADAPTIVE VALUE — confirm with owner.
 * Forgot-password rate limit: attempts per IP per window (stricter).
 */
export const FORGOT_PASSWORD_RATE_LIMIT_LIMIT = 3;

/**
 * ADAPTIVE VALUE — confirm with owner.
 * Forgot-password rate limit window in milliseconds (1 minute).
 */
export const FORGOT_PASSWORD_RATE_LIMIT_TTL_MS = 60_000;

/**
 * ADAPTIVE VALUE — confirm with owner.
 * Minimum password length for buyer registration/login validation.
 */
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_MAX_LENGTH = 128;

export const NAME_MAX_LENGTH = 120;

export const PHONE_MAX_LENGTH = 32;

export const EMAIL_MAX_LENGTH = 254;

/**
 * Precomputed argon2id hash used only for constant-time login when the user is
 * missing or has no passwordHash yet. Password material is not a real credential.
 */
export const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$ER0Utc+ij9NOUKMOECoagQ$JU7nhYe9bsg4LO+2teIJtK/yJQmagTDISNzYL5lb/uI";

/**
 * ADAPTIVE VALUE — confirm with owner.
 * Set-password / invite token lifetime (7 days).
 */
export const ACCOUNT_ACCESS_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

/**
 * ADAPTIVE VALUE — confirm with owner.
 * Password-reset token lifetime (1 hour).
 */
export const PASSWORD_RESET_TOKEN_TTL_SECONDS = 60 * 60;

/** Generic response body for forgot-password (always the same; no email enumeration). */
export const FORGOT_PASSWORD_RESPONSE_MESSAGE =
  "If the email exists, a link has been sent";

/** Opaque access-token entropy (≥256 bits). */
export const ACCOUNT_ACCESS_TOKEN_BYTES = 32;

/**
 * ADAPTIVE VALUE — confirm with owner.
 * Default page size for admin company lists.
 */
export const ADMIN_COMPANIES_DEFAULT_PAGE_SIZE = 20;

/**
 * ADAPTIVE VALUE — confirm with owner.
 * Maximum page size for admin company lists.
 */
export const ADMIN_COMPANIES_MAX_PAGE_SIZE = 50;

/**
 * ADAPTIVE VALUE — confirm with owner.
 * Default page size for company member lists.
 */
export const COMPANY_MEMBERS_DEFAULT_PAGE_SIZE = 20;

/**
 * ADAPTIVE VALUE — confirm with owner.
 * Maximum page size for company member lists.
 */
export const COMPANY_MEMBERS_MAX_PAGE_SIZE = 50;

export const LIST_MIN_PAGE = 1;

export const COMPANY_NAME_MAX_LENGTH = 200;

export const COMPANY_DESCRIPTION_MAX_LENGTH = 4000;

/**
 * ADAPTIVE VALUE — confirm with owner.
 * QR resolve rate limit: attempts per IP per window.
 */
export const QR_RESOLVE_RATE_LIMIT_LIMIT = 30;

/**
 * ADAPTIVE VALUE — confirm with owner.
 * QR resolve rate limit window in milliseconds (1 minute).
 */
export const QR_RESOLVE_RATE_LIMIT_TTL_MS = 60_000;

/** Public path segment for buyer QR payload URLs (`{APP_URL}/qr/{token}`). */
export const BUYER_QR_PATH_SEGMENT = "qr";

/**
 * ADAPTIVE VALUE — confirm with owner.
 * BOS provisioning rate limit: attempts per IP per window.
 */
export const BOS_PROVISIONING_RATE_LIMIT_LIMIT = 20;

/**
 * ADAPTIVE VALUE — confirm with owner.
 * BOS provisioning rate limit window in milliseconds (1 minute).
 */
export const BOS_PROVISIONING_RATE_LIMIT_TTL_MS = 60_000;

/** Header carrying the BOS service-to-service API key. */
export const BOS_API_KEY_HEADER = "x-bos-api-key";

/** Default page size for admin BOS provisioning lists. */
export const ADMIN_BOS_PROVISIONING_DEFAULT_PAGE_SIZE = 20;

/** Maximum page size for admin BOS provisioning lists. */
export const ADMIN_BOS_PROVISIONING_MAX_PAGE_SIZE = 50;

/** Default page size for buyer QR scan history. */
export const BUYER_QR_SCANS_DEFAULT_PAGE_SIZE = 50;

/** Maximum page size for buyer QR scan history. */
export const BUYER_QR_SCANS_MAX_PAGE_SIZE = 100;

