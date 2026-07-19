import { check } from 'k6';

import { login, registerBuyer } from './lib/auth.js';
import { isSmokeMode, loadConfig } from './lib/config.js';
import { apiGet, checkStatus } from './lib/http.js';
import { SCENARIO, buildOptions, buildThresholds } from './lib/thresholds.js';

const SCENARIO_NAME = SCENARIO.AUTH;

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
        { duration: '20s', target: 3 },
        { duration: '1m', target: 15 },
        { duration: '20s', target: 0 },
      ],
      { peak: true },
    );

/**
 * @returns {{ email?: string; password?: string }}
 */
export function setup() {
  if (!isSmokeMode()) {
    return {};
  }

  const uniqueSuffix = `${Date.now()}_setup`;
  const email = `loadtest+${uniqueSuffix}@toonexpo.local`;
  const password = `LoadTest!${uniqueSuffix.slice(-8)}`;

  const registered = registerBuyer(
    {
      name: `Load Test ${uniqueSuffix}`,
      email,
      phone: '+37491000000',
      password,
    },
    { scenario: SCENARIO_NAME, endpoint: 'auth_register' },
  );

  check(registered, {
    'smoke registration established session': (session) => session !== null,
  });

  return { email, password };
}

export default function registrationLoginStorm(data) {
  const config = loadConfig();
  const tags = { scenario: SCENARIO_NAME };

  if (isSmokeMode()) {
    const loggedIn = login(data.email, data.password, {
      ...tags,
      endpoint: 'auth_login',
    });
    check(loggedIn, {
      'smoke login succeeded': (session) => session !== null,
    });

    if (loggedIn) {
      const me = apiGet('/api/v1/auth/me', tags, loggedIn.jar);
      checkStatus(me, 'auth me after login');
    }
    return;
  }

  const uniqueSuffix = `${Date.now()}_${__VU}_${__ITER}`;
  const email = `loadtest+${uniqueSuffix}@toonexpo.local`;
  const password = `LoadTest!${uniqueSuffix.slice(-8)}`;

  const registered = registerBuyer(
    {
      name: `Load Test ${uniqueSuffix}`,
      email,
      phone: '+37491000000',
      password,
    },
    { ...tags, endpoint: 'auth_register' },
  );

  check(registered, {
    'registration established session': (session) => session !== null,
  });

  if (registered) {
    const me = apiGet('/api/v1/auth/me', tags, registered.jar);
    checkStatus(me, 'auth me after register');
  }

  const loggedIn = login(email, password, { ...tags, endpoint: 'auth_login' });
  check(loggedIn, {
    'login storm succeeded': (session) => session !== null,
  });

  if (loggedIn) {
    const me = apiGet('/api/v1/auth/me', tags, loggedIn.jar);
    checkStatus(me, 'auth me after login');
  }

  if (__ITER % 5 === 0 && config.buyerEmail) {
    const seedLogin = login(config.buyerEmail, config.buyerPassword, {
      ...tags,
      endpoint: 'auth_login_seed',
    });
    check(seedLogin, {
      'seed buyer login succeeded': (session) => session !== null,
    });
  }
}
