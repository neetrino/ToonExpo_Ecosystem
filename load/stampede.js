import { check, sleep } from 'k6';

import { isSmokeMode, loadConfig, stampedeUrl } from './lib/config.js';
import { checkStatus, webGet } from './lib/http.js';
import { SCENARIO, buildOptions, buildThresholds } from './lib/thresholds.js';

const SCENARIO_NAME = SCENARIO.STAMPEDE;

export const options = isSmokeMode()
  ? {
      scenarios: {
        smoke: {
          executor: 'per-vu-iterations',
          vus: 2,
          iterations: 5,
          maxDuration: '20s',
          tags: { scenario: SCENARIO_NAME },
        },
      },
      thresholds: buildThresholds(SCENARIO_NAME, { includeCacheHit: true, peak: true }),
    }
  : buildOptions(
      SCENARIO_NAME,
      [
        { duration: '5s', target: 1 },
        { duration: '10s', target: 50 },
        { duration: '20s', target: 50 },
        { duration: '10s', target: 0 },
      ],
      { includeCacheHit: true, peak: true },
    );

export function setup() {
  const config = loadConfig();
  console.warn(
    [
      'Cache stampede scenario expects a manual cache purge before the burst.',
      'Trigger publish purge via the revalidate webhook (WEB_REVALIDATE_URL + REVALIDATE_SECRET)',
      'or expire CDN/Next TTL, then run this script immediately.',
      `Target URL: ${stampedeUrl(config)}`,
    ].join(' '),
  );
  return { targetUrl: stampedeUrl(config) };
}

export default function cacheMissStampede(data) {
  const config = loadConfig();
  const tags = { scenario: SCENARIO_NAME, endpoint: 'catalog_projects' };

  const response = webGet(data.targetUrl, tags);
  checkStatus(response, 'stampede target', [200, 404]);

  check(response, {
    'stampede response under 5s': (res) => res.timings.duration < 5000,
  });

  sleep(0.05);
}
