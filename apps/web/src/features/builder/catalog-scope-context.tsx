'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { CatalogScope } from '@/features/builder/catalog-scope';

const PORTAL_SCOPE: CatalogScope = { mode: 'portal' };

const CatalogScopeContext = createContext<CatalogScope>(PORTAL_SCOPE);

type CatalogScopeProviderProps = {
  scope: CatalogScope;
  children: ReactNode;
};

/**
 * Provides portal vs admin-company catalog routing context.
 * Memoizes admin scope by companyId so inline `{ mode, companyId }` props
 * do not thrash all consumers on every parent render.
 */
export const CatalogScopeProvider = ({ scope, children }: CatalogScopeProviderProps) => {
  const companyId = scope.mode === 'admin' ? scope.companyId : '';
  const value = useMemo<CatalogScope>(
    () => (scope.mode === 'portal' ? PORTAL_SCOPE : { mode: 'admin', companyId }),
    [scope.mode, companyId],
  );
  return <CatalogScopeContext.Provider value={value}>{children}</CatalogScopeContext.Provider>;
};

export const useCatalogScope = (): CatalogScope => useContext(CatalogScopeContext);
