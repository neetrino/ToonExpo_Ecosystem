import http from 'k6/http';
import { check } from 'k6';

import { loginSerializable, restoreSession } from './lib/auth.js';
import { API_PREFIX, apiUrl, isSmokeMode, loadConfig } from './lib/config.js';
import {
  activeEventId,
  apiGet,
  apiPost,
  checkStatus,
  firstVenueMapId,
  thinkTime,
} from './lib/http.js';
import { SCENARIO, buildOptions, buildThresholds } from './lib/thresholds.js';

const SCENARIO_NAME = SCENARIO.EXPO;

export const options = isSmokeMode()
  ? {
      scenarios: {
        smoke: {
          executor: 'per-vu-iterations',
          vus: 2,
          iterations: 2,
          maxDuration: '20s',
          tags: { scenario: SCENARIO_NAME },
        },
      },
      thresholds: buildThresholds(SCENARIO_NAME, { peak: true }),
    }
  : buildOptions(
      SCENARIO_NAME,
      [
        { duration: '30s', target: 10 },
        { duration: '3m', target: 50 },
        { duration: '30s', target: 0 },
      ],
      { peak: true },
    );

/**
 * @returns {{
 *   builderSession: import('./lib/auth.js').SerializableSession;
 *   staffSession: import('./lib/auth.js').SerializableSession | null;
 *   qrTokens: string[];
 *   hasStaff: boolean;
 *   hasQrTokens: boolean;
 * }}
 */
export function setup() {
  const config = loadConfig();
  const builderSession = loginSerializable(config.builderEmail, config.builderPassword, {
    scenario: SCENARIO_NAME,
    endpoint: 'auth_login_builder_setup',
  });

  if (!builderSession) {
    throw new Error(
      `Builder login failed for ${config.builderEmail}. Set LOAD_BUILDER_EMAIL / LOAD_BUILDER_PASSWORD (or wait for auth rate-limit reset).`,
    );
  }

  let staffSession = null;
  if (config.staffEmail && config.staffPassword) {
    staffSession = loginSerializable(config.staffEmail, config.staffPassword, {
      scenario: SCENARIO_NAME,
      endpoint: 'auth_login_staff_setup',
    });
  }

  return {
    builderSession,
    staffSession,
    qrTokens: config.qrTokens,
    hasStaff: staffSession !== null,
    hasQrTokens: config.qrTokens.length > 0,
  };
}

export default function expoDayPeak(data) {
  const config = loadConfig();
  const tags = { scenario: SCENARIO_NAME };
  const builderAuth = restoreSession(data.builderSession);

  const currentEvent = apiGet(`${API_PREFIX}/events/current`, {
    ...tags,
    endpoint: 'expo_current_event',
  }, null, [200, 404]);
  checkStatus(currentEvent, 'current event', [200, 404]);

  const venueMapId = firstVenueMapId(currentEvent);
  if (venueMapId) {
    const booths = apiGet(`${API_PREFIX}/venue-maps/${venueMapId}/booths?locale=hy`, {
      ...tags,
      endpoint: 'expo_booths',
    }, null, [200, 404]);
    checkStatus(booths, 'booth list', [200, 404]);

    const search = apiGet(`${API_PREFIX}/venue-maps/${venueMapId}/search?q=gl&locale=hy`, {
      ...tags,
      endpoint: 'expo_booth_search',
    }, null, [200, 404]);
    checkStatus(search, 'booth search', [200, 404]);

    const entrances = apiGet(`${API_PREFIX}/venue-maps/${venueMapId}/entrance-nodes`, {
      ...tags,
      endpoint: 'expo_entrances',
    }, null, [200, 404]);
    checkStatus(entrances, 'entrance nodes', [200, 404]);
  }

  thinkTime(config.thinkTimeMinSec, config.thinkTimeMaxSec);

  if (data.hasQrTokens) {
    const token = data.qrTokens[__ITER % data.qrTokens.length];
    const resolve = http.post(
      apiUrl(config, `${API_PREFIX}/qr/resolve`),
      JSON.stringify({ token }),
      {
        jar: builderAuth.jar,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': builderAuth.csrfToken,
        },
        tags: { ...tags, endpoint: 'qr_resolve' },
        responseCallback: http.expectedStatuses(200, 404),
      },
    );
    checkStatus(resolve, 'qr resolve', [200, 404]);
  } else {
    check(null, {
      'qr resolve skipped (no LOAD_QR_TOKENS)': () => true,
    });
  }

  if (data.hasStaff && data.hasQrTokens && data.staffSession) {
    const staffAuth = restoreSession(data.staffSession);
    const eventId =
      activeEventId(
        apiGet(`${API_PREFIX}/checkin/active-event`, {
          ...tags,
          endpoint: 'checkin_active_event',
        }, staffAuth.jar, [200, 404]),
      ) || null;

    if (eventId) {
      const token = data.qrTokens[__VU % data.qrTokens.length];
      const scan = apiPost(
        `${API_PREFIX}/checkin/scan`,
        { token, eventId },
        { ...tags, endpoint: 'checkin_scan' },
        staffAuth.jar,
        staffAuth.csrfToken,
        [200, 201, 409, 404],
      );
      checkStatus(scan, 'checkin scan', [200, 201, 409, 404]);
    }
  } else {
    check(null, {
      'check-in skipped (needs LOAD_STAFF_* + LOAD_QR_TOKENS)': () => true,
    });
  }
}
