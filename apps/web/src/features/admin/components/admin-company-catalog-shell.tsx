'use client';

import type { ReactNode } from 'react';

import { CatalogScopeProvider } from '@/features/builder/catalog-scope-context';

type AdminCompanyCatalogShellProps = {
  companyId: string;
  children: ReactNode;
};

/**
 * Admin catalog shell: catalog scope for portal project components.
 */
export const AdminCompanyCatalogShell = ({
  companyId,
  children,
}: AdminCompanyCatalogShellProps) => {
  return (
    <CatalogScopeProvider scope={{ mode: 'admin', companyId }}>{children}</CatalogScopeProvider>
  );
};
