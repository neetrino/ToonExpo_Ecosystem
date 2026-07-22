import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadEnv } from 'dotenv';
import {
  DEV_SEED_ADMIN_PASSWORD,
  SEED_APARTMENT_NUMBER,
  SEED_APARTMENT_VISIBLE_AFTER_LOGIN_ID,
  SEED_BUILDER_COMPANY_ID,
  SEED_BUILDING_ID,
  SEED_BUILDING_NAME,
  SEED_BUYER_EMAIL,
  SEED_COMPANY_ADMIN_EMAIL,
  SEED_FLOOR_ID,
  SEED_FLOOR_LABEL,
  SEED_PLATFORM_ADMIN_EMAIL,
  SEED_PROJECT_ID,
  SEED_PROJECT_NAME,
} from '@toonexpo/shared';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
/** `apps/web/e2e/src/helpers` → monorepo root (5 levels up). */
export const MONOREPO_ROOT = path.resolve(packageRoot, '../../../../..');

loadEnv({ path: path.join(MONOREPO_ROOT, '.env') });

export const DEFAULT_WEB_PORT = 3000;
export const DEFAULT_API_PORT = 4000;
export const DEFAULT_SEED_PASSWORD = DEV_SEED_ADMIN_PASSWORD;

export const WEB_ORIGIN =
  process.env['PLAYWRIGHT_BASE_URL']?.trim() ||
  process.env['APP_URL']?.trim() ||
  `http://localhost:${DEFAULT_WEB_PORT}`;

export const API_ORIGIN =
  process.env['NEXT_PUBLIC_API_URL']?.trim() ||
  `http://localhost:${process.env['PORT']?.trim() || DEFAULT_API_PORT}`;

export const API_HEALTH_URL = `${API_ORIGIN.replace(/\/$/, '')}/api/v1/health`;

export const SEED_PASSWORD =
  process.env['SEED_ADMIN_PASSWORD']?.trim() &&
  process.env['SEED_ADMIN_PASSWORD'].trim().length >= 8
    ? process.env['SEED_ADMIN_PASSWORD'].trim()
    : DEFAULT_SEED_PASSWORD;

export {
  SEED_APARTMENT_NUMBER,
  SEED_APARTMENT_VISIBLE_AFTER_LOGIN_ID,
  SEED_BUILDER_COMPANY_ID,
  SEED_BUILDING_ID,
  SEED_BUILDING_NAME,
  SEED_BUYER_EMAIL,
  SEED_FLOOR_ID,
  SEED_FLOOR_LABEL,
  SEED_PLATFORM_ADMIN_EMAIL,
  SEED_PROJECT_ID,
  SEED_PROJECT_NAME,
};

export const SEED_BUILDER_ADMIN_EMAIL = SEED_COMPANY_ADMIN_EMAIL;
