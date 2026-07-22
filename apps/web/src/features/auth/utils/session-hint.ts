import { CSRF_COOKIE_NAME } from '@toonexpo/contracts';

/** Default Nest session cookie name (httpOnly; mirrored for SSR Cookie header checks). */
export const DEFAULT_SESSION_COOKIE_NAME = 'toonexpo_session';

/**
 * Same-origin tab hint so Client Components can detect a session after login
 * even when the CSRF cookie is not readable on `document.cookie` (cross-origin
 * API / `NEXT_PUBLIC_API_URL` mode). Survives full navigations in the same tab.
 */
export const CLIENT_SESSION_HINT_STORAGE_KEY = 'toonexpo_session_hint';

const CLIENT_SESSION_HINT_EVENT = 'toonexpo-session-hint';

const readSessionCookieName = (): string =>
  process.env['SESSION_COOKIE_NAME']?.trim() || DEFAULT_SESSION_COOKIE_NAME;

const cookieHeaderHasName = (cookieHeader: string, name: string): boolean => {
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${name}=`) && trimmed.length > name.length + 1) {
      return true;
    }
  }

  return false;
};

const hasStoredSessionHint = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return sessionStorage.getItem(CLIENT_SESSION_HINT_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

/**
 * SSR / forwarded Cookie header: true when the httpOnly session cookie is present.
 */
export const hasSessionCookieInHeader = (cookieHeader?: string): boolean => {
  if (!cookieHeader) {
    return false;
  }

  return cookieHeaderHasName(cookieHeader, readSessionCookieName());
};

/**
 * Browser hint: CSRF cookie (same-origin proxy) and/or tab sessionStorage flag
 * set at login. Guests skip `/auth/me` probes entirely.
 */
export const hasClientSessionHint = (): boolean => {
  if (typeof document === 'undefined') {
    return false;
  }

  return cookieHeaderHasName(document.cookie, CSRF_COOKIE_NAME) || hasStoredSessionHint();
};

/**
 * Marks this tab as authenticated (call after login/register/set-password).
 */
export const markClientSessionHint = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(CLIENT_SESSION_HINT_STORAGE_KEY, '1');
  } catch {
    // Private mode / quota — cookie hint may still apply.
  }

  window.dispatchEvent(new Event(CLIENT_SESSION_HINT_EVENT));
};

/**
 * Clears the tab session hint (call after logout).
 */
export const clearClientSessionHint = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(CLIENT_SESSION_HINT_STORAGE_KEY);
  } catch {
    // ignore
  }

  window.dispatchEvent(new Event(CLIENT_SESSION_HINT_EVENT));
};

/**
 * Subscribe for `useSyncExternalStore` so login/logout re-enable `useMeQuery`.
 */
export const subscribeClientSessionHint = (onStoreChange: () => void): (() => void) => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const onHint = (): void => {
    onStoreChange();
  };

  window.addEventListener(CLIENT_SESSION_HINT_EVENT, onHint);
  // Cross-tab logout/login via storage (sessionStorage does not fire this; harmless).
  window.addEventListener('storage', onHint);

  return () => {
    window.removeEventListener(CLIENT_SESSION_HINT_EVENT, onHint);
    window.removeEventListener('storage', onHint);
  };
};
