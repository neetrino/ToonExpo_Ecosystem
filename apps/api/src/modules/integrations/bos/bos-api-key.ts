import { createHash, timingSafeEqual } from 'node:crypto';

export type BosApiKeyCheckResult = 'ok' | 'disabled' | 'unauthorized';

function sha256Digest(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

/**
 * Constant-time comparison of the configured BOS API key against the request header.
 * Both sides are SHA-256 hashed first so length of the raw secret is never branched on.
 * Returns `disabled` when the integration key is unset (endpoint must respond 503).
 */
export function checkBosApiKey(
  configuredKey: string | undefined,
  providedHeader: string | undefined,
): BosApiKeyCheckResult {
  if (!configuredKey) {
    return 'disabled';
  }
  if (!providedHeader) {
    return 'unauthorized';
  }

  const expected = sha256Digest(configuredKey);
  const provided = sha256Digest(providedHeader);
  return timingSafeEqual(expected, provided) ? 'ok' : 'unauthorized';
}
