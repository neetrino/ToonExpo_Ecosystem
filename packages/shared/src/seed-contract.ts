/**
 * Stable local/dev seed contract shared by `packages/db` seed and Playwright smoke.
 * Keep IDs/emails in sync with catalog plans in `packages/db/prisma/seed-data.ts`.
 */

/** Dev-only fallback when `SEED_ADMIN_PASSWORD` is unset. Never use in production. */
export const DEV_SEED_ADMIN_PASSWORD = 'ChangeMeAdmin123!';

export const SEED_PLATFORM_ADMIN_EMAIL = 'admin@toonexpo.local';
export const SEED_COMPANY_ADMIN_EMAIL = 'builder.admin@toonexpo.local';
export const SEED_BUYER_EMAIL = 'buyer@toonexpo.local';

export const SEED_PLATFORM_ADMIN_ID = 'seed_user_platform_admin';
export const SEED_COMPANY_ADMIN_ID = 'seed_user_company_admin';
export const SEED_BUYER_ID = 'seed_user_buyer';
export const SEED_BUYER_PROFILE_ID = 'seed_buyer_profile';
export const SEED_BUYER_QR_ID = 'seed_qr_buyer';
export const SEED_COMPANY_MEMBER_ID = 'seed_member_company_admin';

/** First seed builder — used by company-admin membership + admin catalog smoke. */
export const SEED_BUILDER_COMPANY_ID = 'seed_company_glendale';

export const SEED_PROJECT_ID = 'seed_project_northern_avenue';
export const SEED_PROJECT_NAME = 'Northern Avenue Residences';
export const SEED_BUILDING_ID = 'seed_building_northern_a';
export const SEED_BUILDING_NAME = 'Building A';
export const SEED_FLOOR_ID = 'seed_floor_seed_building_northern_a_n3';
export const SEED_FLOOR_LABEL = 'Floor 3';

/**
 * First apt on Building A / Floor 3 — `visible_after_login` per `buildApartments`.
 * Formula: `seed_apt_{project.slug}_{building.name}_f{floor}_{index}`.
 */
export const SEED_APARTMENT_VISIBLE_AFTER_LOGIN_ID =
  'seed_apt_northern-avenue-residences_building_a_f3_1';
export const SEED_APARTMENT_NUMBER = '301';
