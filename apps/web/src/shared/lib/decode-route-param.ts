const MAX_URI_DECODE_PASSES = 2;

const decodeOnce = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/**
 * Unwraps a route/API path param that may still be percent-encoded (once or twice).
 * next-intl Link + encodeURIComponent in hrefs can leave `%D5%BF…` or `%20` in params.
 */
export const decodeRouteParam = (value: string): string => {
  let current = value;
  for (let pass = 0; pass < MAX_URI_DECODE_PASSES; pass += 1) {
    const next = decodeOnce(current);
    if (next === current) {
      return current;
    }
    current = next;
  }
  return current;
};

/**
 * Encodes a path segment once, even if the value is already percent-encoded.
 */
export const encodePathSegment = (value: string): string =>
  encodeURIComponent(decodeRouteParam(value));
