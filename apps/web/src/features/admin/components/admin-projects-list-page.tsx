'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AdminCreateProjectSheet } from '@/features/admin/components/admin-create-project-sheet';
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
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const ADMIN_PROJECTS_FILTER_COMPANY_KEY = 'companyId';

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
  const tCommon = useTranslations('Common.integratedSearch');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = parsePage(searchParams.get('page'));
  const companyId = searchParams.get('companyId')?.trim() || undefined;
  const pageSize = ADMIN_INVENTORY_DEFAULT_PAGE_SIZE;
  const { viewMode, setViewMode } = usePersistedViewMode(ADMIN_VIEW_MODE_KEYS.projects);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

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

  const filterConfigs = useMemo(
    (): IntegratedSearchFilterConfig[] => [
      {
        key: ADMIN_PROJECTS_FILTER_COMPANY_KEY,
        label: t('filters.company'),
        allOptionLabel: t('filters.allCompanies'),
        options: builderCompanies.map((company) => ({
          value: company.id,
          label: company.name,
        })),
      },
    ],
    [builderCompanies, t],
  );

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
      <ListPageHeader
        title={t('title')}
        subtitle={t('subtitle', { count: response.meta.total })}
        search={search}
        searchPlaceholder={tCommon('searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        filters={filterConfigs}
        filterValues={{ [ADMIN_PROJECTS_FILTER_COMPANY_KEY]: companyId ?? '' }}
        onSearchChange={setSearch}
        onFilterChange={(key, value) => {
          if (key === ADMIN_PROJECTS_FILTER_COMPANY_KEY) {
            router.replace(buildListHref(1, value || undefined));
          }
        }}
        onClearAll={() => {
          setSearch('');
          router.replace(buildListHref(1, undefined));
        }}
        actions={
          <>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="shrink-0"
              onClick={() => {
                setCreateOpen(true);
              }}
            >
              <AddActionLabel>{t('create.cta')}</AddActionLabel>
            </Button>
          </>
        }
      />

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

      <AdminCreateProjectSheet
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
        }}
        defaultCompanyId={companyId}
      />
    </div>
  );
};
