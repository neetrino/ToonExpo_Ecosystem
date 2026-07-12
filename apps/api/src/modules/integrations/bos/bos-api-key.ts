import { timingSafeEqual } from 'node:crypto';

export type BosApiKeyCheckResult = 'ok' | 'disabled' | 'unauthorized';

/**
 * Constant-time comparison of the configured BOS API key against the request header.
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

  const expected = Buffer.from(configuredKey, 'utf8');
  const provided = Buffer.from(providedHeader, 'utf8');
  if (expected.length !== provided.length) {
    return 'unauthorized';
  }
  return timingSafeEqual(expected, provided) ? 'ok' : 'unauthorized';
}
