'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { useAdminProjectScopeQuery } from '@/features/admin/hooks/use-admin-companies';
import { CatalogScopeProvider } from '@/features/builder/catalog-scope-context';

type AdminProjectScopeShellProps = {
  projectId: string;
  children: ReactNode;
};

/**
 * Resolves builder company for an admin project route and provides catalog scope.
 */
export const AdminProjectScopeShell = ({ projectId, children }: AdminProjectScopeShellProps) => {
  const t = useTranslations('Admin.projects');
  const scopeQuery = useAdminProjectScopeQuery(projectId);

  if (scopeQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (scopeQuery.isError || !scopeQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  return (
    <CatalogScopeProvider scope={{ mode: 'admin', companyId: scopeQuery.data.builderCompanyId }}>
      {children}
    </CatalogScopeProvider>
  );
};
