import { check } from 'k6';

import { loginSerializable, restoreSession } from './lib/auth.js';
import { isSmokeMode, loadConfig } from './lib/config.js';
import { apiGet, apiPatch, checkStatus, firstDealId } from './lib/http.js';
import { SCENARIO, buildOptions, buildThresholds } from './lib/thresholds.js';

const SCENARIO_NAME = SCENARIO.CRM;

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
      thresholds: buildThresholds(SCENARIO_NAME, { peak: false }),
    }
  : buildOptions(
      SCENARIO_NAME,
      [
        { duration: '20s', target: 3 },
        { duration: '2m', target: 10 },
        { duration: '20s', target: 0 },
      ],
      { peak: false },
    );

export function setup() {
  const config = loadConfig();
  const session = loginSerializable(config.builderEmail, config.builderPassword, {
    scenario: SCENARIO_NAME,
    endpoint: 'auth_login_setup',
  });

  if (!session) {
    throw new Error(
      `Builder login failed for ${config.builderEmail}. Set LOAD_BUILDER_EMAIL / LOAD_BUILDER_PASSWORD (or wait for auth rate-limit reset).`,
    );
  }

  return { session };
}

export default function crmPortalLoad(data) {
  const tags = { scenario: SCENARIO_NAME };
  const auth = restoreSession(data.session);

  const list = apiGet('/api/v1/portal/crm/deals?page=1&pageSize=20', {
    ...tags,
    endpoint: 'crm_deals_list',
  }, auth.jar);
  checkStatus(list, 'crm deals list');

  const dealId = firstDealId(list);
  if (!dealId) {
    check(null, {
      'crm update skipped (no deals in list)': () => true,
    });
    return;
  }

  const detail = apiGet(`/api/v1/portal/crm/deals/${dealId}`, {
    ...tags,
    endpoint: 'crm_deal_detail',
  }, auth.jar);
  checkStatus(detail, 'crm deal detail');

  const update = apiPatch(
    `/api/v1/portal/crm/deals/${dealId}`,
    { status: 'contacted' },
    { ...tags, endpoint: 'crm_deal_update' },
    auth.jar,
    auth.csrfToken,
  );
  checkStatus(update, 'crm deal update');
}
