const SET_PASSWORD_TOKEN_PARAM = 'token';

/**
 * Reads the invite/reset token from a URL hash (`#token=...`).
 * Fragments are never sent to servers or included in Referer headers.
 */
export const extractSetPasswordTokenFromHash = (hash: string): string | null => {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (raw.trim().length === 0) {
    return null;
  }

  const token = new URLSearchParams(raw).get(SET_PASSWORD_TOKEN_PARAM);
  if (typeof token === 'string' && token.trim().length > 0) {
    return token.trim();
  }

  return null;
};

/** Removes the token fragment from the address bar without reloading. */
export const stripSetPasswordTokenFromUrl = (): void => {
  const { pathname, search } = window.location;
  window.history.replaceState(null, '', `${pathname}${search}`);
};
