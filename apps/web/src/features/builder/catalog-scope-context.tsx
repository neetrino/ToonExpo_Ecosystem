'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { CatalogScope } from '@/features/builder/catalog-scope';

const CatalogScopeContext = createContext<CatalogScope>({ mode: 'portal' });

type CatalogScopeProviderProps = {
  scope: CatalogScope;
  children: ReactNode;
};

/**
 * Provides portal vs admin-company catalog routing context.
 */
export const CatalogScopeProvider = ({ scope, children }: CatalogScopeProviderProps) => (
  <CatalogScopeContext.Provider value={scope}>{children}</CatalogScopeContext.Provider>
);

export const useCatalogScope = (): CatalogScope => useContext(CatalogScopeContext);
