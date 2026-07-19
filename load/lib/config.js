/** Shared runtime configuration from k6 environment variables. */

export const API_PREFIX = '/api/v1';

export const CSRF_HEADER = 'X-CSRF-Token';

export const DEFAULT_SESSION_COOKIE = 'toonexpo_session';

export const DEFAULT_CSRF_COOKIE = 'toonexpo_csrf';

export const DEFAULT_LOAD_PASSWORD = 'ChangeMeAdmin123!';

export const DEFAULT_SEED_PROJECT_ID = 'seed_project_northern_avenue';

export const DEFAULT_SEED_APARTMENT_ID =
  'seed_apt_northern-avenue-residences_building_a_f3_1';

/**
 * @returns {boolean}
 */
export function isSmokeMode() {
  const value = (__ENV.SMOKE || '').toLowerCase();
  return value === '1' || value === 'true' || value === 'yes';
}

/**
 * @returns {{
 *   baseUrl: string;
 *   apiUrl: string;
 *   smoke: boolean;
 *   vus: number;
 *   sessionCookieName: string;
 *   csrfCookieName: string;
 *   buyerEmail: string;
 *   buyerPassword: string;
 *   builderEmail: string;
 *   builderPassword: string;
 *   staffEmail: string;
 *   staffPassword: string;
 *   qrTokens: string[];
 *   stampedePath: string;
 *   seedProjectId: string;
 *   seedApartmentId: string;
 *   thinkTimeMinSec: number;
 *   thinkTimeMaxSec: number;
 * }}
 */
export function loadConfig() {
  const baseUrl = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const apiUrl = (__ENV.API_URL || 'http://localhost:4000').replace(/\/$/, '');

  return {
    baseUrl,
    apiUrl,
    smoke: isSmokeMode(),
    vus: Number.parseInt(__ENV.VUS || '20', 10),
    sessionCookieName: __ENV.SESSION_COOKIE_NAME || DEFAULT_SESSION_COOKIE,
    csrfCookieName: __ENV.CSRF_COOKIE_NAME || DEFAULT_CSRF_COOKIE,
    buyerEmail: __ENV.LOAD_BUYER_EMAIL || 'buyer@toonexpo.local',
    buyerPassword:
      __ENV.LOAD_BUYER_PASSWORD || __ENV.SEED_ADMIN_PASSWORD || DEFAULT_LOAD_PASSWORD,
    builderEmail: __ENV.LOAD_BUILDER_EMAIL || 'builder.admin@toonexpo.local',
    builderPassword:
      __ENV.LOAD_BUILDER_PASSWORD || __ENV.SEED_ADMIN_PASSWORD || DEFAULT_LOAD_PASSWORD,
    staffEmail: __ENV.LOAD_STAFF_EMAIL || '',
    staffPassword:
      __ENV.LOAD_STAFF_PASSWORD || __ENV.SEED_ADMIN_PASSWORD || DEFAULT_LOAD_PASSWORD,
    qrTokens: parseQrTokens(),
    stampedePath: __ENV.STAMPEDE_PATH || `${API_PREFIX}/projects?page=1&pageSize=10`,
    seedProjectId: __ENV.LOAD_PROJECT_ID || DEFAULT_SEED_PROJECT_ID,
    seedApartmentId: __ENV.LOAD_APARTMENT_ID || DEFAULT_SEED_APARTMENT_ID,
    thinkTimeMinSec: Number.parseFloat(__ENV.THINK_TIME_MIN_SEC || '1'),
    thinkTimeMaxSec: Number.parseFloat(__ENV.THINK_TIME_MAX_SEC || '3'),
  };
}

/**
 * @returns {string[]}
 */
function parseQrTokens() {
  const inline = (__ENV.LOAD_QR_TOKENS || '').trim();
  if (inline.length > 0) {
    return inline
      .split(',')
      .map((token) => token.trim())
      .filter((token) => token.length > 0);
  }

  const filePath = (__ENV.LOAD_QR_TOKENS_FILE || '').trim();
  if (filePath.length === 0) {
    return [];
  }

  try {
    const raw = open(filePath);
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));
  } catch (_error) {
    console.warn(`Could not read LOAD_QR_TOKENS_FILE=${filePath}; QR resolve steps will be skipped.`);
    return [];
  }
}

/**
 * @param {ReturnType<typeof loadConfig>} config
 * @returns {string}
 */
export function apiUrl(config, path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${config.apiUrl}${normalizedPath}`;
}

/**
 * @param {ReturnType<typeof loadConfig>} config
 * @returns {string}
 */
export function stampedeUrl(config) {
  const path = config.stampedePath.startsWith('/')
    ? config.stampedePath
    : `/${config.stampedePath}`;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (path.startsWith(API_PREFIX)) {
    return `${config.apiUrl}${path}`;
  }

  return `${config.baseUrl}${path}`;
}
