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

export const DEFAULT_SESSION_COOKIE_NAME = "toonexpo_session";

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
 * ADAPTIVE VALUE — confirm with owner.
 * Minimum password length for buyer registration/login validation.
 */
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_MAX_LENGTH = 128;

export const NAME_MAX_LENGTH = 120;

export const PHONE_MAX_LENGTH = 32;

export const EMAIL_MAX_LENGTH = 254;

/**
 * Precomputed argon2id hash used only for constant-time login when the user is missing.
 * Password material is not a real credential.
 */
export const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=65536,t=3,p=4$ER0Utc+ij9NOUKMOECoagQ$JU7nhYe9bsg4LO+2teIJtK/yJQmagTDISNzYL5lb/uI";
