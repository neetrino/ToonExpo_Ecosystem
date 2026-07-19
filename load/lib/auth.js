import http from 'k6/http';
import { check } from 'k6';

import { API_PREFIX, CSRF_HEADER, apiUrl, loadConfig } from './config.js';

/**
 * @typedef {Object} AuthSession
 * @property {import('k6/http').CookieJar} jar
 * @property {string} csrfToken
 */

/**
 * @typedef {Object} SerializableSession
 * @property {string} sessionCookie
 * @property {string} csrfCookie
 * @property {string} csrfToken
 */

/**
 * @param {import('k6/http').RefinedResponse<any>} response
 * @param {string} name
 * @returns {string | null}
 */
function readSetCookie(response, name) {
  const cookies = response.cookies[name];
  if (!cookies || cookies.length === 0) {
    return null;
  }
  return cookies[0].value || null;
}

/**
 * @param {SerializableSession} session
 * @returns {AuthSession}
 */
export function restoreSession(session) {
  const config = loadConfig();
  const jar = http.cookieJar();
  const baseUrl = apiUrl(config, API_PREFIX);

  jar.set(baseUrl, config.sessionCookieName, session.sessionCookie, {
    path: '/',
  });
  jar.set(baseUrl, config.csrfCookieName, session.csrfCookie, {
    path: '/',
  });

  return {
    jar,
    csrfToken: session.csrfToken,
  };
}

/**
 * @param {string} email
 * @param {string} password
 * @param {Record<string, string>=} tags
 * @returns {AuthSession | null}
 */
export function login(email, password, tags = {}) {
  const serialized = loginSerializable(email, password, tags);
  if (!serialized) {
    return null;
  }
  return restoreSession(serialized);
}

/**
 * @param {string} email
 * @param {string} password
 * @param {Record<string, string>=} tags
 * @returns {SerializableSession | null}
 */
export function loginSerializable(email, password, tags = {}) {
  const config = loadConfig();

  const response = http.post(
    apiUrl(config, `${API_PREFIX}/auth/login`),
    JSON.stringify({ email, password }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { ...tags, endpoint: 'auth_login', scenario: tags.scenario || 'auth' },
      responseCallback: http.expectedStatuses(200, 429),
    },
  );

  if (response.status === 429) {
    return null;
  }

  const ok = check(response, {
    'login status 200': (res) => res.status === 200,
  });

  if (!ok) {
    return null;
  }

  let csrfToken = '';
  try {
    const body = /** @type {{ csrfToken?: string }} */ (JSON.parse(response.body));
    csrfToken = body.csrfToken || '';
  } catch (_error) {
    return null;
  }

  const sessionCookie = readSetCookie(response, config.sessionCookieName);
  const csrfCookie = readSetCookie(response, config.csrfCookieName);

  if (!sessionCookie || !csrfCookie) {
    csrfToken = csrfToken || fetchCsrfTokenWithCookie(config, sessionCookie, tags) || '';
  }

  if (!csrfToken || !sessionCookie || !csrfCookie) {
    return null;
  }

  return {
    sessionCookie,
    csrfCookie,
    csrfToken,
  };
}

/**
 * @param {Record<string, unknown>} payload
 * @param {Record<string, string>=} tags
 * @returns {AuthSession | null}
 */
export function registerBuyer(payload, tags = {}) {
  const config = loadConfig();

  const response = http.post(
    apiUrl(config, `${API_PREFIX}/auth/register`),
    JSON.stringify(payload),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { ...tags, endpoint: 'auth_register', scenario: tags.scenario || 'auth' },
      responseCallback: http.expectedStatuses(201, 429),
    },
  );

  if (response.status === 429) {
    return null;
  }

  const ok = check(response, {
    'register status 201': (res) => res.status === 201,
  });

  if (!ok) {
    return null;
  }

  let csrfToken = '';
  try {
    const body = /** @type {{ csrfToken?: string }} */ (JSON.parse(response.body));
    csrfToken = body.csrfToken || '';
  } catch (_error) {
    return null;
  }

  const sessionCookie = readSetCookie(response, config.sessionCookieName);
  const csrfCookie = readSetCookie(response, config.csrfCookieName);

  if (!sessionCookie || !csrfCookie || !csrfToken) {
    return null;
  }

  return restoreSession({ sessionCookie, csrfCookie, csrfToken });
}

/**
 * @param {ReturnType<typeof loadConfig>} config
 * @param {string | null} sessionCookie
 * @param {Record<string, string>} tags
 * @returns {string | null}
 */
function fetchCsrfTokenWithCookie(config, sessionCookie, tags) {
  if (!sessionCookie) {
    return null;
  }

  const jar = http.cookieJar();
  jar.set(apiUrl(config, API_PREFIX), config.sessionCookieName, sessionCookie, {
    path: '/',
  });

  return fetchCsrfToken(config, jar, tags);
}

/**
 * @param {ReturnType<typeof loadConfig>} config
 * @param {import('k6/http').CookieJar} jar
 * @param {Record<string, string>} tags
 * @returns {string | null}
 */
function fetchCsrfToken(config, jar, tags) {
  const response = http.get(apiUrl(config, `${API_PREFIX}/auth/csrf`), {
    jar,
    tags: { ...tags, endpoint: 'auth_csrf', scenario: tags.scenario || 'auth' },
  });

  if (response.status !== 200) {
    return null;
  }

  try {
    const body = /** @type {{ csrfToken?: string }} */ (JSON.parse(response.body));
    return body.csrfToken || null;
  } catch (_error) {
    return null;
  }
}

/**
 * @param {AuthSession} session
 * @param {Record<string, string>=} extra
 * @returns {Record<string, string>}
 */
export function mutationHeaders(session, extra = {}) {
  return {
    'Content-Type': 'application/json',
    [CSRF_HEADER]: session.csrfToken,
    ...extra,
  };
}
