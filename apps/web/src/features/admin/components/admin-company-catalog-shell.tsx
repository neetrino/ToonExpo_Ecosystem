'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { CatalogScopeProvider } from '@/features/builder/catalog-scope-context';
import { useAdminCompanyQuery } from '@/features/admin/hooks/use-admin-companies';
import { Link } from '@/i18n/navigation';

type AdminCompanyCatalogShellProps = {
  companyId: string;
  children: ReactNode;
};

/**
 * Admin catalog shell: company breadcrumb + catalog scope for portal components.
 */
export const AdminCompanyCatalogShell = ({
  companyId,
  children,
}: AdminCompanyCatalogShellProps) => {
  const t = useTranslations('Admin.companies.catalog');
  const companyQuery = useAdminCompanyQuery(companyId);

  const companyName = companyQuery.data?.name ?? t('companyFallback');

  return (
    <CatalogScopeProvider scope={{ mode: 'admin', companyId }}>
      <div className="flex flex-col gap-6">
        <nav
          aria-label={t('breadcrumbLabel')}
          className="flex flex-wrap items-center gap-2 text-sm"
        >
          <Link href="/admin/companies" className="text-ink-secondary hover:text-ink">
            {t('breadcrumbCompanies')}
          </Link>
          <span className="text-ink-muted" aria-hidden>
            /
          </span>
          <Link
            href={`/admin/companies/${companyId}`}
            className="text-ink-secondary hover:text-ink"
          >
            {companyName}
          </Link>
          <span className="text-ink-muted" aria-hidden>
            /
          </span>
          <Link
            href={`/admin/companies/${companyId}/catalog/projects`}
            className="font-medium text-ink"
          >
            {t('breadcrumbCatalog')}
          </Link>
        </nav>
        {children}
      </div>
    </CatalogScopeProvider>
  );
};
