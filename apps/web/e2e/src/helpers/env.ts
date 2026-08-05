import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadEnv } from 'dotenv';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
/** `apps/web/e2e/src/helpers` → monorepo root (5 levels up). */
export const MONOREPO_ROOT = path.resolve(packageRoot, '../../../../..');

loadEnv({ path: path.join(MONOREPO_ROOT, '.env') });

const requireEnvironmentValue = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for Playwright against a populated database`);
  }
  return value;
};

export const DEFAULT_WEB_PORT = 3000;
export const DEFAULT_API_PORT = 4000;

/**
 * Prefer localhost for Playwright. Root `APP_URL` is often a LAN IP for phone
 * testing and breaks auth cookies / CORS when e2e drives Chromium.
 */
export const WEB_ORIGIN =
  process.env['PLAYWRIGHT_BASE_URL']?.trim() || `http://localhost:${DEFAULT_WEB_PORT}`;

export const API_ORIGIN =
  process.env['PLAYWRIGHT_API_URL']?.trim() ||
  `http://localhost:${process.env['PORT']?.trim() || DEFAULT_API_PORT}`;

export const API_HEALTH_URL = `${API_ORIGIN.replace(/\/$/, '')}/api/v1/health`;

export const E2E_APARTMENT_ID = requireEnvironmentValue('E2E_APARTMENT_ID');
export const E2E_APARTMENT_NUMBER = requireEnvironmentValue('E2E_APARTMENT_NUMBER');
export const E2E_BUILDER_ADMIN_EMAIL = requireEnvironmentValue('E2E_BUILDER_ADMIN_EMAIL');
export const E2E_BUILDER_ADMIN_PASSWORD = requireEnvironmentValue('E2E_BUILDER_ADMIN_PASSWORD');
export const E2E_BUILDER_COMPANY_ID = requireEnvironmentValue('E2E_BUILDER_COMPANY_ID');
export const E2E_BUYER_EMAIL = requireEnvironmentValue('E2E_BUYER_EMAIL');
export const E2E_BUYER_PASSWORD = requireEnvironmentValue('E2E_BUYER_PASSWORD');
export const E2E_FLOOR_LABEL = requireEnvironmentValue('E2E_FLOOR_LABEL');
export const E2E_PLATFORM_ADMIN_EMAIL = requireEnvironmentValue('E2E_PLATFORM_ADMIN_EMAIL');
export const E2E_PLATFORM_ADMIN_PASSWORD = requireEnvironmentValue('E2E_PLATFORM_ADMIN_PASSWORD');
export const E2E_PROJECT_ID = requireEnvironmentValue('E2E_PROJECT_ID');
export const E2E_PROJECT_NAME = requireEnvironmentValue('E2E_PROJECT_NAME');
export const E2E_PROJECT_NAME_HY = process.env['E2E_PROJECT_NAME_HY']?.trim() || E2E_PROJECT_NAME;
