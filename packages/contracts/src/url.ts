import { z } from 'zod';

const HTTP_URL_SCHEMES = ['http:', 'https:'] as const;

/** Returns true when the value is a parseable http or https URL. */
export function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return (HTTP_URL_SCHEMES as readonly string[]).includes(parsed.protocol);
  } catch {
    return false;
  }
}

/** Builds a Zod schema for required http(s) URLs with a max length. */
export function httpUrlSchemaWithMax(maxLength: number) {
  return z.string().trim().max(maxLength).url().refine(isHttpUrl, { message: 'httpUrlOnly' });
}

/** Zod schema for required http(s) URLs; rejects javascript:, data:, and other schemes. */
export const httpUrlSchema = httpUrlSchemaWithMax(2048);

/** Optional http(s) URL with trim-to-empty preprocessing. */
export function optionalHttpUrlSchema(maxLength: number) {
  return z.preprocess((value) => {
    if (typeof value !== 'string') {
      return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }, httpUrlSchemaWithMax(maxLength).optional());
}
