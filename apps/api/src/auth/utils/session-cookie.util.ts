import type { CookieOptions } from "express";

import { NODE_ENV_PRODUCTION } from "../../common/constants/app.constants.js";

/**
 * Cookie options for the httpOnly opaque session token.
 */
export const buildSessionCookieOptions = (
  nodeEnv: string,
  maxAgeMs: number,
): CookieOptions => ({
  httpOnly: true,
  secure: nodeEnv === NODE_ENV_PRODUCTION,
  sameSite: "lax",
  path: "/",
  maxAge: maxAgeMs,
});

/**
 * Cookie options for the double-submit CSRF token (readable by same-origin JS).
 */
export const buildCsrfCookieOptions = (
  nodeEnv: string,
  maxAgeMs: number,
): CookieOptions => ({
  httpOnly: false,
  secure: nodeEnv === NODE_ENV_PRODUCTION,
  sameSite: "lax",
  path: "/",
  maxAge: maxAgeMs,
});
