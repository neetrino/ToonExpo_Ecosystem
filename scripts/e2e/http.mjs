/**
 * Minimal cookie jar + fetch helpers for NestJS session login.
 * Uses Headers.getSetCookie when available (Node 18+).
 */

import { E2E_BASE_URL } from './config.mjs';

export class CookieJar {
  /** @type {Map<string, string>} */
  #cookies = new Map();

  /**
   * @param {string} name
   * @param {string} value
   */
  set(name, value) {
    this.#cookies.set(name, value);
  }

  /**
   * @param {Response} response
   */
  absorb(response) {
    const setCookies =
      typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : [response.headers.get('set-cookie')].filter(Boolean);

    for (const raw of setCookies) {
      if (!raw) continue;
      const [pair] = raw.split(';');
      const eq = pair.indexOf('=');
      if (eq <= 0) continue;
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (value === '' || value.toLowerCase() === 'deleted') {
        this.#cookies.delete(name);
      } else {
        this.#cookies.set(name, value);
      }
    }
  }

  header() {
    if (this.#cookies.size === 0) return '';
    return [...this.#cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }

  /** Nest httpOnly session cookie (`toonexpo.sid`). */
  hasSession() {
    return this.#cookies.has('toonexpo.sid');
  }

  clear() {
    this.#cookies.clear();
  }
}

/**
 * @param {string} url
 * @param {RequestInit & { jar?: CookieJar }} [init]
 */
export async function fetchWithJar(url, init = {}) {
  const { jar, headers, redirect = 'manual', ...rest } = init;
  const hdrs = new Headers(headers);
  if (jar) {
    const cookie = jar.header();
    if (cookie) hdrs.set('cookie', cookie);
  }
  const response = await fetch(url, { ...rest, headers: hdrs, redirect });
  if (jar) jar.absorb(response);
  return response;
}

/**
 * Nest CSRF + JSON login against the API origin (direct; no Next `/nest` proxy).
 * @param {string} apiBaseUrl
 * @param {CookieJar} jar
 * @param {{ email: string; password: string }} creds
 * @param {string} [appOrigin] Frontend origin for AppOriginGuard (must match APP_URL)
 */
export async function loginWithCredentials(
  apiBaseUrl,
  jar,
  creds,
  appOrigin = E2E_BASE_URL,
) {
  const csrfRes = await fetchWithJar(`${apiBaseUrl}/auth/csrf`, { jar });
  if (!csrfRes.ok) {
    throw new Error(`csrf failed: ${csrfRes.status}`);
  }
  const { csrfToken } = /** @type {{ csrfToken?: string }} */ (await csrfRes.json());
  if (!csrfToken) throw new Error('csrfToken missing');

  const loginRes = await fetchWithJar(`${apiBaseUrl}/auth/login`, {
    jar,
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-csrf-token': csrfToken,
      origin: appOrigin,
    },
    body: JSON.stringify({
      email: creds.email,
      password: creds.password,
    }),
  });

  if (!loginRes.ok) {
    const text = await loginRes.text().catch(() => '');
    throw new Error(`login failed (status ${loginRes.status}): ${text.slice(0, 200)}`);
  }

  if (!jar.hasSession()) {
    throw new Error(
      `login did not set toonexpo.sid (status ${loginRes.status})`,
    );
  }
  return loginRes;
}

/**
 * @param {Response} response
 */
export function locationOf(response) {
  return response.headers.get('location') ?? '';
}

/**
 * Follow redirects manually while absorbing cookies (max hops).
 * @param {string} url
 * @param {CookieJar | undefined} jar
 * @param {number} [maxHops]
 */
export async function fetchFollow(url, jar, maxHops = 5) {
  let current = url;
  /** @type {Response | null} */
  let last = null;
  for (let i = 0; i < maxHops; i += 1) {
    last = await fetchWithJar(current, { jar, redirect: 'manual' });
    if (last.status < 300 || last.status >= 400) return last;
    const loc = locationOf(last);
    if (!loc) return last;
    current = new URL(loc, current).toString();
  }
  return last;
}

/**
 * @param {string} url
 * @param {number} timeoutMs
 * @param {number} intervalMs
 * @param {(res: Response) => boolean | Promise<boolean>} [ok]
 */
export async function waitForReady(url, timeoutMs, intervalMs, ok = (r) => r.ok) {
  const start = Date.now();
  let lastError = '';
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (await ok(res)) return;
      lastError = `status ${res.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Timed out waiting for ${url} (${lastError})`);
}
