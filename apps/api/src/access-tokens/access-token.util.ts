import { createHash, randomBytes } from "node:crypto";

import { ACCOUNT_ACCESS_TOKEN_BYTES } from "../common/constants/app.constants.js";

/**
 * Creates a cryptographically random opaque account-access token.
 */
export const createAccessToken = (): string =>
  randomBytes(ACCOUNT_ACCESS_TOKEN_BYTES).toString("base64url");

/**
 * Hashes a raw access token with the server pepper (SHA-256 of pepper:token).
 */
export const hashAccessToken = (token: string, pepper: string): string =>
  createHash("sha256").update(`${pepper}:${token}`).digest("hex");
