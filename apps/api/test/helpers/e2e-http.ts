/**
 * Shared HTTP/cookie helpers for API e2e specs.
 */

export const findSetCookie = (
  setCookieHeader: string[] | undefined,
  name: string,
): string | undefined => {
  if (!setCookieHeader) {
    return undefined;
  }
  return setCookieHeader.find((value) => value.startsWith(`${name}=`));
};

export const cookiePair = (setCookie: string): string => setCookie.split(';')[0] ?? '';

export const uniqueEmail = (prefix: string, suffix: string): string =>
  `${prefix}${suffix}.${Date.now()}.${Math.random().toString(16).slice(2)}@example.com`;
