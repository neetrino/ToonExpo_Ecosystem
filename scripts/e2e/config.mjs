import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** Monorepo root (scripts/e2e → ../..). */
export const ROOT = resolve(here, '../..');

export const E2E_BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3010';
export const E2E_API_URL = process.env.E2E_API_URL ?? 'http://localhost:4010';
export const E2E_BOS_API_KEY = process.env.E2E_BOS_API_KEY ?? 'e2e-test-key';

export const DEMO_COMPANY_SLUG = 'demo-development';
export const SUNRISE_SLUG = 'sunrise-residence';
export const HIDDEN_COURT_SLUG = 'hidden-court';
export const SUNRISE_NAME = 'Sunrise Residence';
export const HIDDEN_COURT_NAME = 'Hidden Court';
export const DRAFT_PARTNER_NAME = 'Draft Partner Demo';

export const DEMO_BUILDER_EMAIL = 'builder@demo.toonexpo.local';

/** Marker prefix for throwaway emails / request ids / company names. */
export function e2eMarker(runId) {
  return `e2e-${runId}`;
}

export function buyerEmail(runId) {
  return `${e2eMarker(runId)}-buyer@e2e.toonexpo.local`;
}

export function bosEmail(runId) {
  return `${e2eMarker(runId)}-bos@e2e.toonexpo.local`;
}

export const BUYER_PASSWORD = 'E2eBuyerPass1!';
export const BUYER_NAME = 'E2E Buyer';
export const BUYER_PHONE = '+37499111222';

export const READY_POLL_MS = 1000;
export const READY_TIMEOUT_MS = 120_000;
export const ANALYTICS_WAIT_MS = 2500;
