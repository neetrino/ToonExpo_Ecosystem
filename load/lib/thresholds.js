import { isSmokeMode } from './config.js';
import { publicCacheHitRate } from './http.js';

/** Scenario name constants for threshold tag filters. */
export const SCENARIO = {
  PUBLIC: 'public',
  AUTH: 'auth',
  QR: 'qr',
  EXPO: 'expo',
  CRM: 'crm',
  STAMPEDE: 'stampede',
};

/**
 * Shared pass/fail thresholds aligned with docs/PERFORMANCE_REVIEW.md §15.
 *
 * @param {string} scenario
 * @param {{ includeCacheHit?: boolean; peak?: boolean }=} options
 */
export function buildThresholds(scenario, options = {}) {
  const peak = options.peak === true;
  const errorRateLimit = peak ? 0.01 : 0.001;
  const smoke = isSmokeMode();

  /** @type {Record<string, string[]>} */
  const thresholds = {
    http_req_failed: [`rate<${errorRateLimit}`],
    [`http_req_duration{scenario:${scenario}}`]: [`p(95)<${latencyTarget(scenario, smoke)}`],
  };

  if (scenario === SCENARIO.PUBLIC || scenario === SCENARIO.STAMPEDE) {
    thresholds[`http_req_duration{scenario:${scenario},endpoint:catalog_projects}`] = [
      `p(95)<${smoke ? 2000 : 500}`,
    ];
    thresholds[`http_req_duration{scenario:${scenario},endpoint:catalog_project_detail}`] = [
      `p(95)<${smoke ? 2000 : 500}`,
    ];
    thresholds[`http_req_duration{scenario:${scenario},endpoint:catalog_apartment_detail}`] = [
      `p(95)<${smoke ? 2000 : 500}`,
    ];
    thresholds[`http_req_duration{scenario:${scenario},endpoint:home_html}`] = [
      `p(95)<${smoke ? 3000 : 500}`,
    ];
  }

  if (scenario === SCENARIO.QR || scenario === SCENARIO.EXPO) {
    thresholds[`http_req_duration{scenario:${scenario},endpoint:buyer_qr}`] = [
      `p(95)<${smoke ? 2000 : 1000}`,
    ];
    thresholds[`http_req_duration{scenario:${scenario},endpoint:qr_resolve}`] = [
      `p(95)<${smoke ? 2000 : 1000}`,
    ];
    thresholds[`http_req_duration{scenario:${scenario},endpoint:checkin_scan}`] = [
      `p(95)<${smoke ? 2000 : 1000}`,
    ];
  }

  if (scenario === SCENARIO.CRM) {
    thresholds[`http_req_duration{scenario:${scenario},endpoint:crm_deals_list}`] = [
      `p(95)<${smoke ? 2000 : 1000}`,
    ];
    thresholds[`http_req_duration{scenario:${scenario},endpoint:crm_deal_update}`] = [
      `p(95)<${smoke ? 2000 : 1000}`,
    ];
  }

  if (options.includeCacheHit && !smoke) {
    thresholds.public_cache_hit_ratio = ['rate>0.8'];
  }

  return thresholds;
}

/**
 * @param {string} scenario
 * @param {boolean} smoke
 * @returns {number}
 */
function latencyTarget(scenario, smoke) {
  if (smoke) {
    return 3000;
  }

  switch (scenario) {
    case SCENARIO.PUBLIC:
    case SCENARIO.STAMPEDE:
      return 500;
    case SCENARIO.QR:
    case SCENARIO.EXPO:
    case SCENARIO.CRM:
      return 1000;
    case SCENARIO.AUTH:
      return 1000;
    default:
      return 500;
  }
}

/**
 * @param {Array<{ duration: string; target: number }>} fullStages
 * @param {number} defaultVus
 */
export function buildStages(fullStages, defaultVus) {
  if (isSmokeMode()) {
    return [
      { duration: '5s', target: 2 },
      { duration: '10s', target: 3 },
      { duration: '5s', target: 0 },
    ];
  }

  if (fullStages.length > 0) {
    return fullStages;
  }

  return [
    { duration: '30s', target: Math.min(defaultVus, 5) },
    { duration: '2m', target: defaultVus },
    { duration: '30s', target: 0 },
  ];
}

/**
 * @param {string} scenario
 * @param {Array<{ duration: string; target: number }>} stages
 * @param {{ peak?: boolean; includeCacheHit?: boolean }=} thresholdOptions
 */
export function buildOptions(scenario, stages, thresholdOptions = {}) {
  const config = loadConfigFromThresholds();
  return {
    tags: { scenario },
    stages: buildStages(stages, config.vus),
    thresholds: buildThresholds(scenario, thresholdOptions),
  };
}

/**
 * Avoid circular import with config loadConfig in options builder.
 */
function loadConfigFromThresholds() {
  const vus = Number.parseInt(__ENV.VUS || '20', 10);
  return { vus };
}

export { publicCacheHitRate };
