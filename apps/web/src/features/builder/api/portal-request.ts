import type { ApiFetchOptions } from '@/shared/api/client';
import { toCatalogApiPath, type CatalogScope } from '@/features/builder/catalog-scope';

export type PortalRequestOptions = {
  cookieHeader?: string | undefined;
  scope?: CatalogScope | undefined;
};

const DEFAULT_SCOPE: CatalogScope = { mode: 'portal' };

export const resolveCatalogScope = (options: PortalRequestOptions = {}): CatalogScope =>
  options.scope ?? DEFAULT_SCOPE;

export const catalogPath = (portalPath: string, options: PortalRequestOptions = {}): string =>
  toCatalogApiPath(resolveCatalogScope(options), portalPath);

const jsonCredentials = {
  credentials: 'include' as const,
  headers: { 'Content-Type': 'application/json' },
};

/**
 * Forwards Cookie header for SSR portal fetches.
 */
export const withPortalCookie = (
  options: ApiFetchOptions,
  cookieHeader?: string,
): ApiFetchOptions => {
  if (!cookieHeader) {
    return options;
  }
  return {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      Cookie: cookieHeader,
    },
  };
};

export { jsonCredentials };
