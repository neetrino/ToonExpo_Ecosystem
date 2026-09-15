'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { AdminProjectRouteProvider } from '@/features/admin/context/admin-project-route-context';
import { useAdminProjectScopeQuery } from '@/features/admin/hooks/use-admin-companies';
import { CatalogScopeProvider } from '@/features/builder/catalog-scope-context';
import { useRouter } from '@/i18n/navigation';
import { isApiErrorStatus } from '@/shared/api/errors';
import { decodeRouteParam, encodePathSegment } from '@/shared/lib/decode-route-param';

type AdminProjectScopeShellProps = {
  projectSlug: string;
  children: ReactNode;
};

/**
 * Resolves builder company + project id for an admin project route (slug in URL).
 */
export const AdminProjectScopeShell = ({ projectSlug, children }: AdminProjectScopeShellProps) => {
  const t = useTranslations('Admin.projects');
  const router = useRouter();
  const routeSlug = decodeRouteParam(projectSlug);
  const scopeQuery = useAdminProjectScopeQuery(routeSlug);

  useEffect(() => {
    const scope = scopeQuery.data;
    if (!scope) {
      return;
    }
    if (scope.projectId === routeSlug || scope.slug === routeSlug) {
      return;
    }
    router.replace(`/admin/projects/${encodePathSegment(scope.slug)}`);
  }, [routeSlug, router, scopeQuery.data]);

  if (scopeQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (scopeQuery.isError || !scopeQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {isApiErrorStatus(scopeQuery.error, 404) ? t('notFound') : t('error')}
      </p>
    );
  }

  const { builderCompanyId, projectId, slug } = scopeQuery.data;

  return (
    <CatalogScopeProvider scope={{ mode: 'admin', companyId: builderCompanyId }}>
      <AdminProjectRouteProvider value={{ projectId, projectSlug: slug }}>
        {children}
      </AdminProjectRouteProvider>
    </CatalogScopeProvider>
  );
};
