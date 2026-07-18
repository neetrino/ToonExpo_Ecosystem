/** Mirrors NestJS auth DTO limits for client-side Zod schemas. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const NAME_MAX_LENGTH = 120;
export const PHONE_MIN_LENGTH = 5;
export const PHONE_MAX_LENGTH = 32;
export const EMAIL_MAX_LENGTH = 254;

/** Digits plus optional phone punctuation (matches NestJS RegisterDto). */
export const PHONE_PATTERN = /^[+0-9()\-\s]+$/;

/** TanStack Query key for the authenticated user. */
export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;
