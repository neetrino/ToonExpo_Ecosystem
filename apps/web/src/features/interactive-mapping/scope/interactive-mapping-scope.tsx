'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { CatalogScope } from '@/features/builder/catalog-scope';

import {
  INTERACTIVE_MAPPING_ADMIN_API_PREFIX,
  INTERACTIVE_MAPPING_ADMIN_BASE_PATH,
  INTERACTIVE_MAPPING_BUILDER_BASE_PATH,
  INTERACTIVE_MAPPING_PORTAL_API_PREFIX,
} from '../constants';

export type InteractiveMappingMode = 'admin' | 'portal';

export type InteractiveMappingScopeValue = {
  mode: InteractiveMappingMode;
  /** UI route prefix (`/admin/...` or `/builder/...`). */
  basePath:
    typeof INTERACTIVE_MAPPING_ADMIN_BASE_PATH | typeof INTERACTIVE_MAPPING_BUILDER_BASE_PATH;
  /** Nest API prefix for wizard endpoints. */
  apiPrefix:
    typeof INTERACTIVE_MAPPING_ADMIN_API_PREFIX | typeof INTERACTIVE_MAPPING_PORTAL_API_PREFIX;
  /** Catalog (canvas/hotspot) API scope — never mixes portals. */
  catalogScope: CatalogScope;
  /** New-project link for empty / CTA states. */
  createProjectHref: '/admin/projects/new' | '/builder/projects/new';
  /** Lab QA route is admin-only. */
  showLabLink: boolean;
};

const ADMIN_SCOPE: InteractiveMappingScopeValue = {
  mode: 'admin',
  basePath: INTERACTIVE_MAPPING_ADMIN_BASE_PATH,
  apiPrefix: INTERACTIVE_MAPPING_ADMIN_API_PREFIX,
  catalogScope: { mode: 'admin', companyId: '' },
  createProjectHref: '/admin/projects/new',
  showLabLink: true,
};

const PORTAL_SCOPE: InteractiveMappingScopeValue = {
  mode: 'portal',
  basePath: INTERACTIVE_MAPPING_BUILDER_BASE_PATH,
  apiPrefix: INTERACTIVE_MAPPING_PORTAL_API_PREFIX,
  catalogScope: { mode: 'portal' },
  createProjectHref: '/builder/projects/new',
  showLabLink: false,
};

const InteractiveMappingScopeContext = createContext<InteractiveMappingScopeValue>(ADMIN_SCOPE);

type InteractiveMappingScopeProviderProps = {
  mode: InteractiveMappingMode;
  children: ReactNode;
};

/**
 * Isolates Admin vs Builder interactive-mapping routes and API prefixes.
 * Admin pages still pass `companyId` into catalog helpers per project.
 */
export const InteractiveMappingScopeProvider = ({
  mode,
  children,
}: InteractiveMappingScopeProviderProps) => {
  const value = mode === 'portal' ? PORTAL_SCOPE : ADMIN_SCOPE;
  return (
    <InteractiveMappingScopeContext.Provider value={value}>
      {children}
    </InteractiveMappingScopeContext.Provider>
  );
};

export const useInteractiveMappingScope = (): InteractiveMappingScopeValue =>
  useContext(InteractiveMappingScopeContext);

/**
 * Resolves catalog scope for canvas/hotspot calls.
 * Portal mode ignores companyId (member company is implied by session).
 * Admin mode requires the project's builderCompanyId.
 */
export const resolveMappingCatalogScope = (
  scope: InteractiveMappingScopeValue,
  companyId: string,
): CatalogScope => {
  if (scope.mode === 'portal') {
    return { mode: 'portal' };
  }
  return { mode: 'admin', companyId };
};
