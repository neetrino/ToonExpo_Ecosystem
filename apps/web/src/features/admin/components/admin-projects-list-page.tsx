'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { AdminProjectsTable } from '@/features/admin/components/admin-projects-table';
import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
  ADMIN_VIEW_MODE_KEYS,
} from '@/features/admin/constants';
import {
  useAdminCompaniesQuery,
  useAdminProjectsQuery,
} from '@/features/admin/hooks/use-admin-companies';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { Select } from '@/shared/ui/select';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};

/**
 * Admin projects hub: all projects with optional company filter.
 */
export const AdminProjectsListPage = () => {
  const t = useTranslations('Admin.projects');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = parsePage(searchParams.get('page'));
  const companyId = searchParams.get('companyId')?.trim() || undefined;
  const pageSize = ADMIN_INVENTORY_DEFAULT_PAGE_SIZE;
  const { viewMode, setViewMode } = usePersistedViewMode(ADMIN_VIEW_MODE_KEYS.projects);

  const projectsQuery = useAdminProjectsQuery(page, pageSize, companyId);
  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);

  const builderCompanies = useMemo(() => {
    const companies = companiesQuery.data?.data ?? [];
    return companies
      .filter((company) => company.type === 'builder')
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [companiesQuery.data]);

  const buildListHref = (nextPage: number, nextCompanyId?: string): string => {
    const params = new URLSearchParams();
    if (nextCompanyId) {
      params.set('companyId', nextCompanyId);
    }
    if (nextPage > 1) {
      params.set('page', String(nextPage));
    }
    const query = params.toString();
    return query.length > 0 ? `${pathname}?${query}` : pathname;
  };

  if (projectsQuery.isLoading || companiesQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (projectsQuery.isError || !projectsQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const response = projectsQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-page-title text-ink">{t('title')}</h1>
        <p className="text-sm text-ink-secondary">
          {t('subtitle', { count: response.meta.total })}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          size="fit"
          className="h-10"
          value={companyId ?? ''}
          aria-label={t('filters.company')}
          onChange={(event) => {
            const nextCompanyId = event.target.value || undefined;
            router.replace(buildListHref(1, nextCompanyId));
          }}
        >
          <option value="">{t('filters.allCompanies')}</option>
          {builderCompanies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </Select>

        <ViewModeToggle value={viewMode} onChange={setViewMode} />
      </div>

      {response.data.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <AdminProjectsTable projects={response.data} viewMode={viewMode} />
      )}

      <CatalogPagination
        page={response.meta.page}
        totalPages={response.meta.totalPages}
        buildHref={(nextPage) => buildListHref(nextPage, companyId)}
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        ariaLabel={t('pagination.ariaLabel')}
      />
    </div>
  );
};
