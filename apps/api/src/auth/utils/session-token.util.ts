import { createHash, randomBytes } from "node:crypto";

import { SESSION_TOKEN_BYTES } from "../../common/constants/app.constants.js";

/**
 * Creates a cryptographically random opaque session token (≥256 bits).
 */
export const createSessionToken = (): string =>
  randomBytes(SESSION_TOKEN_BYTES).toString("base64url");

/**
 * Hashes a raw session token with a server pepper (HMAC-SHA256 via SHA-256 of pepper:token).
 */
export const hashSessionToken = (token: string, pepper: string): string =>
  createHash("sha256").update(`${pepper}:${token}`).digest("hex");
