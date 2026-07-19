import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadEnv } from 'dotenv';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
/** `apps/web-e2e/src/helpers` → monorepo root (4 levels up). */
export const MONOREPO_ROOT = path.resolve(packageRoot, '../../../..');

loadEnv({ path: path.join(MONOREPO_ROOT, '.env') });

export const DEFAULT_WEB_PORT = 3000;
export const DEFAULT_API_PORT = 4000;
export const DEFAULT_SEED_PASSWORD = 'ChangeMeAdmin123!';

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

export const SEED_BUYER_EMAIL = 'buyer@toonexpo.local';
export const SEED_BUILDER_ADMIN_EMAIL = 'builder.admin@toonexpo.local';
export const SEED_PLATFORM_ADMIN_EMAIL = 'admin@toonexpo.local';
export const SEED_BUILDER_COMPANY_ID = 'seed_company_glendale';

export const SEED_PROJECT_NAME = 'Northern Avenue Residences';
export const SEED_PROJECT_ID = 'seed_project_northern_avenue';
export const SEED_BUILDING_ID = 'seed_building_northern_a';
export const SEED_BUILDING_NAME = 'Building A';
export const SEED_FLOOR_ID = 'seed_floor_seed_building_northern_a_n3';
export const SEED_FLOOR_LABEL = 'Floor 3';
export const SEED_APARTMENT_VISIBLE_AFTER_LOGIN_ID =
  'seed_apt_northern-avenue-residences_building_a_f3_1';
export const SEED_APARTMENT_NUMBER = '301';
