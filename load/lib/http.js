import { sleep } from 'k6';
import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';

import { API_PREFIX, CSRF_HEADER, apiUrl, loadConfig } from './config.js';

export const publicCacheHitRate = new Rate('public_cache_hit_ratio');

/**
 * @param {number[]} statuses
 * @returns {import('k6/http').ResponseCallbackFn}
 */
function statusCallback(statuses) {
  return http.expectedStatuses(...statuses);
}

/**
 * @param {number} minSec
 * @param {number} maxSec
 */
export function thinkTime(minSec, maxSec) {
  const minMs = Math.max(minSec, 0) * 1000;
  const maxMs = Math.max(maxSec, minSec) * 1000;
  const durationMs = minMs + Math.random() * (maxMs - minMs);
  if (durationMs > 0) {
    sleep(durationMs / 1000);
  }
}

/**
 * @param {import('k6/http').RefinedResponse<any>} response
 */
export function recordPublicCacheHit(response) {
  const cacheStatus = (
    response.headers['Cf-Cache-Status'] ||
    response.headers['cf-cache-status'] ||
    response.headers['X-Next-Cache'] ||
    response.headers['x-next-cache'] ||
    ''
  ).toUpperCase();

  const hit =
    cacheStatus === 'HIT' ||
    cacheStatus === 'STALE' ||
    cacheStatus === 'HIT-STALE' ||
    cacheStatus.includes('HIT');

  publicCacheHitRate.add(hit);
}

/**
 * @param {string} path
 * @param {Record<string, string>} tags
 * @param {import('k6/http').CookieJar | null=} jar
 * @param {number[]=} expectedStatuses
 */
export function apiGet(path, tags, jar = null, expectedStatuses = [200]) {
  const config = loadConfig();
  const params = {
    tags: { scenario: tags.scenario, endpoint: tags.endpoint, ...tags },
    responseCallback: statusCallback(expectedStatuses),
  };

  if (jar) {
    params.jar = jar;
  }

  const response = http.get(apiUrl(config, path), params);
  recordPublicCacheHit(response);
  return response;
}

/**
 * @param {string} path
 * @param {unknown} body
 * @param {Record<string, string>} tags
 * @param {import('k6/http').CookieJar} jar
 * @param {string} csrfToken
 * @param {number[]=} expectedStatuses
 */
export function apiPost(path, body, tags, jar, csrfToken, expectedStatuses = [200, 201]) {
  const config = loadConfig();
  return http.post(apiUrl(config, path), JSON.stringify(body), {
    jar,
    headers: {
      'Content-Type': 'application/json',
      [CSRF_HEADER]: csrfToken,
    },
    tags: { scenario: tags.scenario, endpoint: tags.endpoint, ...tags },
    responseCallback: statusCallback(expectedStatuses),
  });
}

/**
 * @param {string} path
 * @param {unknown} body
 * @param {Record<string, string>} tags
 * @param {import('k6/http').CookieJar} jar
 * @param {string} csrfToken
 * @param {number[]=} expectedStatuses
 */
export function apiPatch(path, body, tags, jar, csrfToken, expectedStatuses = [200]) {
  const config = loadConfig();
  return http.patch(apiUrl(config, path), JSON.stringify(body), {
    jar,
    headers: {
      'Content-Type': 'application/json',
      [CSRF_HEADER]: csrfToken,
    },
    tags: { scenario: tags.scenario, endpoint: tags.endpoint, ...tags },
    responseCallback: statusCallback(expectedStatuses),
  });
}

/**
 * @param {string} url
 * @param {Record<string, string>} tags
 * @param {number[]=} expectedStatuses
 */
export function webGet(url, tags, expectedStatuses = [200]) {
  const response = http.get(url, {
    tags: { scenario: tags.scenario, endpoint: tags.endpoint, ...tags },
    responseCallback: statusCallback(expectedStatuses),
  });
  recordPublicCacheHit(response);
  return response;
}

/**
 * @param {import('k6/http').RefinedResponse<any>} response
 * @param {string} name
 * @param {number[]} acceptableStatuses
 */
export function checkStatus(response, name, acceptableStatuses = [200]) {
  return check(response, {
    [`${name} status`]: (res) => acceptableStatuses.includes(res.status),
  });
}

/**
 * @param {import('k6/http').RefinedResponse<any>} response
 * @returns {Record<string, unknown> | null}
 */
export function parseJson(response) {
  try {
    return /** @type {Record<string, unknown>} */ (JSON.parse(response.body));
  } catch (_error) {
    return null;
  }
}

/**
 * @param {import('k6/http').RefinedResponse<any>} response
 * @returns {string | null}
 */
export function firstProjectId(response) {
  const body = parseJson(response);
  const data = body && Array.isArray(body.data) ? body.data : null;
  if (!data || data.length === 0) {
    return null;
  }
  const first = /** @type {{ id?: string }} */ (data[0]);
  return first.id || null;
}

/**
 * @param {import('k6/http').RefinedResponse<any>} response
 * @returns {string | null}
 */
export function firstApartmentId(response) {
  const body = parseJson(response);
  const buildings = body && Array.isArray(body.buildings) ? body.buildings : null;
  if (!buildings) {
    return null;
  }

  for (const building of buildings) {
    const floors = /** @type {{ apartments?: Array<{ id?: string }> }[]} */ (
      building.floors || []
    );
    for (const floor of floors) {
      const apartments = floor.apartments || [];
      if (apartments.length > 0 && apartments[0].id) {
        return apartments[0].id;
      }
    }
  }

  return null;
}

/**
 * @param {import('k6/http').RefinedResponse<any>} response
 * @returns {string | null}
 */
export function firstVenueMapId(response) {
  const body = parseJson(response);
  const maps = body && Array.isArray(body.venueMaps) ? body.venueMaps : null;
  if (!maps || maps.length === 0) {
    return null;
  }
  const first = /** @type {{ id?: string }} */ (maps[0]);
  return first.id || null;
}

/**
 * @param {import('k6/http').RefinedResponse<any>} response
 * @returns {string | null}
 */
export function firstDealId(response) {
  const body = parseJson(response);
  const data = body && Array.isArray(body.data) ? body.data : null;
  if (!data || data.length === 0) {
    return null;
  }
  const first = /** @type {{ id?: string }} */ (data[0]);
  return first.id || null;
}

/**
 * @param {import('k6/http').RefinedResponse<any>} response
 * @returns {string | null}
 */
export function activeEventId(response) {
  const body = parseJson(response);
  if (!body || typeof body.id !== 'string') {
    return null;
  }
  return body.id;
}
