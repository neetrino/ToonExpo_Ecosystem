import type { PlatformRole } from '@toonexpo/domain';

/** Route groups that require authentication. */
export type ProtectedArea = 'buyer' | 'builder' | 'admin' | 'entrance' | 'partner';

/**
 * Roles allowed into each protected area. `buyer` allows any authenticated
 * user, so it is not constrained to a specific role set.
 */
const AREA_ROLE_ACCESS: Record<Exclude<ProtectedArea, 'buyer'>, readonly PlatformRole[]> = {
  /** Admins may enter /portal while acting on behalf (cookie-gated by assertBuilderSession). */
  builder: ['BUILDER', 'BIGPROJECTS_ADMIN'],
  admin: ['BIGPROJECTS_ADMIN'],
  entrance: ['ENTRANCE_STAFF'],
  partner: ['PARTNER'],
};

/** Locale-relative path prefixes mapped to their protected area. */
const AREA_PATH_PREFIXES: ReadonlyArray<readonly [prefix: string, area: ProtectedArea]> = [
  ['/account', 'buyer'],
  ['/portal', 'builder'],
  ['/admin', 'admin'],
  ['/checkin', 'entrance'],
  ['/partner', 'partner'],
];

/**
 * Returns the protected area a locale-relative pathname belongs to, or `null`
 * when the path is public.
 */
export function getProtectedArea(localeRelativePath: string): ProtectedArea | null {
  const normalized = localeRelativePath === '' ? '/' : localeRelativePath;
  for (const [prefix, area] of AREA_PATH_PREFIXES) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
      return area;
    }
  }
  return null;
}

/** Whether a role may access the given protected area. */
export function canAccessArea(area: ProtectedArea, role: PlatformRole): boolean {
  if (area === 'buyer') {
    return true;
  }
  return AREA_ROLE_ACCESS[area].includes(role);
}
