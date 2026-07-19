import { check } from 'k6';

import { loginSerializable, restoreSession } from './lib/auth.js';
import { isSmokeMode, loadConfig } from './lib/config.js';
import { apiGet, checkStatus, thinkTime } from './lib/http.js';
import { SCENARIO, buildOptions, buildThresholds } from './lib/thresholds.js';

const SCENARIO_NAME = SCENARIO.QR;

export const options = isSmokeMode()
  ? {
      scenarios: {
        smoke: {
          executor: 'per-vu-iterations',
          vus: 2,
          iterations: 3,
          maxDuration: '20s',
          tags: { scenario: SCENARIO_NAME },
        },
      },
      thresholds: buildThresholds(SCENARIO_NAME, { peak: true }),
    }
  : buildOptions(
      SCENARIO_NAME,
      [
        { duration: '20s', target: 5 },
        { duration: '2m', target: 30 },
        { duration: '20s', target: 0 },
      ],
      { peak: true },
    );

export function setup() {
  const config = loadConfig();
  const session = loginSerializable(config.buyerEmail, config.buyerPassword, {
    scenario: SCENARIO_NAME,
    endpoint: 'auth_login_setup',
  });

  if (!session) {
    throw new Error(
      `Buyer login failed for ${config.buyerEmail}. Set LOAD_BUYER_EMAIL / LOAD_BUYER_PASSWORD (or wait for auth rate-limit reset).`,
    );
  }

  return { session };
}

export default function qrDisplayStorm(data) {
  const config = loadConfig();
  const tags = { scenario: SCENARIO_NAME, endpoint: 'buyer_qr' };
  const auth = restoreSession(data.session);

  const qr = apiGet('/api/v1/buyer/qr', tags, auth.jar);
  checkStatus(qr, 'buyer qr');

  check(qr, {
    'qr payload present': (res) => {
      if (res.status !== 200) {
        return false;
      }
      try {
        const body = JSON.parse(res.body);
        return typeof body.payloadUrl === 'string' && body.payloadUrl.length > 0;
      } catch (_error) {
        return false;
      }
    },
  });

  thinkTime(config.thinkTimeMinSec * 0.5, config.thinkTimeMaxSec * 0.5);
}
