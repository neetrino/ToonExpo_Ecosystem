'use client';

import { FolderOpen, SearchX, FolderKanban } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AdminCreateProjectSheet } from '@/features/admin/components/admin-create-project-sheet';
import {
  decodeIntegratedFilterIds,
  encodeIntegratedFilterIds,
  parseIdListParam,
} from '@/features/admin/components/admin-inventory-list-filters';
import {
  AdminProjectBuildingsSheet,
  type AdminProjectBuildingsTarget,
} from '@/features/admin/components/admin-project-buildings-sheet';
import { AdminProjectsTable } from '@/features/admin/components/admin-projects-table';
import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
  ADMIN_INVENTORY_SEARCH_WIDTH_CLASS,
  ADMIN_VIEW_MODE_KEYS,
} from '@/features/admin/constants';
import {
  useAdminBuilderCompaniesQuery,
  useAdminProjectsQuery,
} from '@/features/admin/hooks/use-admin-companies';
import { useBulkDeleteProjectsMutation } from '@/features/admin/hooks/use-inventory-bulk-delete';
import { useInventoryListSelection } from '@/features/admin/hooks/use-inventory-list-selection';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { HOME_FEATURED_PROJECT_LIMIT } from '@/features/catalog/constants/home-featured';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useDebouncedSearch } from '@/shared/hooks/use-debounced-search';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import { ListSelectionToolbar } from '@/shared/ui/list-selection-toolbar';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const ADMIN_PROJECTS_FILTER_COMPANY_KEY = 'companyId';

const FIRST_PAGE = 1;

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < FIRST_PAGE) {
    return FIRST_PAGE;
  }
  return Math.floor(parsed);
};

const buildAdminProjectsHref = (
  pathname: string,
  page: number,
  companyIds: readonly string[],
): string => {
  const params = new URLSearchParams();
  const companyEncoded = encodeIntegratedFilterIds(companyIds);
  if (companyEncoded) {
    params.set('companyId', companyEncoded);
  }
  if (page > FIRST_PAGE) {
    params.set('page', String(page));
  }
  const query = params.toString();
  return query.length > 0 ? `${pathname}?${query}` : pathname;
};

/**
 * Admin projects hub: all projects with optional company filters.
 */
export const AdminProjectsListPage = () => {
  const t = useTranslations('Admin.projects');
  const tCommon = useTranslations('Common.integratedSearch');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = parsePage(searchParams.get('page'));
  const companyIds = parseIdListParam(searchParams, 'companyId');
  const pageSize = ADMIN_INVENTORY_DEFAULT_PAGE_SIZE;
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.projects,
  );
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [buildingsProject, setBuildingsProject] = useState<AdminProjectBuildingsTarget | null>(
    null,
  );
  const activeSearch = useDebouncedSearch(search);

  const projectsQuery = useAdminProjectsQuery({
    page,
    pageSize,
    ...(companyIds.length > 0 ? { companyId: companyIds } : {}),
    ...(activeSearch ? { search: activeSearch } : {}),
  });
  const companiesQuery = useAdminBuilderCompaniesQuery(ADMIN_COMPANIES_MAX_PAGE_SIZE);

  const builderCompanies = useMemo(() => {
    const companies = companiesQuery.data?.data ?? [];
    return companies.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [companiesQuery.data]);

  const buildListHref = (
    nextPage: number,
    nextCompanyIds: readonly string[] = companyIds,
  ): string => buildAdminProjectsHref(pathname, nextPage, nextCompanyIds);

  /** Search always looks at the whole list, so a new term restarts pagination. */
  const handleSearchChange = (value: string): void => {
    setSearch(value);
    if (page > FIRST_PAGE) {
      router.replace(buildListHref(FIRST_PAGE));
    }
  };

  const handleClearSearch = (): void => {
    handleSearchChange('');
  };

  const filterConfigs = useMemo(
    (): IntegratedSearchFilterConfig[] => [
      {
        key: ADMIN_PROJECTS_FILTER_COMPANY_KEY,
        label: t('filters.builder'),
        allOptionLabel: t('filters.allBuilders'),
        searchable: true,
        multiple: true,
        selectedCountLabel: (count) => tCommon('selectedCount', { count }),
        options: builderCompanies.map((company) => ({
          value: company.id,
          label: company.name,
        })),
      },
    ],
    [builderCompanies, t, tCommon],
  );

  const projects = projectsQuery.data?.data ?? [];
  const listBulk = useInventoryListSelection(projects, effectiveViewMode, {
    enabled: true,
  });
  const bulkDeleteMutation = useBulkDeleteProjectsMutation();

  if (
    (projectsQuery.isLoading && !projectsQuery.data) ||
    (companiesQuery.isLoading && !companiesQuery.data)
  ) {
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
        icon={FolderKanban}
        title={t('title')}
        subtitle={t('subtitleWithFeatured', {
          count: response.meta.total,
          featured: response.meta.featuredOnHomeTotal,
          limit: HOME_FEATURED_PROJECT_LIMIT,
        })}
        search={search}
        searchPlaceholder={t('filters.searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        searchClassName={ADMIN_INVENTORY_SEARCH_WIDTH_CLASS}
        filters={filterConfigs}
        filterValues={{
          [ADMIN_PROJECTS_FILTER_COMPANY_KEY]: encodeIntegratedFilterIds(companyIds),
        }}
        onSearchChange={handleSearchChange}
        onApplyFilters={(draft) => {
          router.replace(
            buildListHref(
              FIRST_PAGE,
              decodeIntegratedFilterIds(draft[ADMIN_PROJECTS_FILTER_COMPANY_KEY]),
            ),
          );
        }}
        onFilterChange={(key, value) => {
          if (key === ADMIN_PROJECTS_FILTER_COMPANY_KEY) {
            router.replace(buildListHref(FIRST_PAGE, decodeIntegratedFilterIds(value)));
          }
        }}
        onClearAll={() => {
          setSearch('');
          router.replace(buildListHref(FIRST_PAGE, []));
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
        <div className="flex min-h-72 items-center justify-center">
          <EmptyState
            icon={activeSearch ? SearchX : FolderOpen}
            title={activeSearch ? t('noResultsTitle') : t('emptyTitle')}
            description={activeSearch ? t('noResults', { query: activeSearch }) : undefined}
            actionLabel={activeSearch ? t('clearSearch') : undefined}
            onAction={activeSearch ? handleClearSearch : undefined}
            className="w-full max-w-md border-solid border-border/70 bg-surface-elevated px-6 py-10 shadow-sm sm:px-10 sm:py-12"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <ListSelectionToolbar
            selectedCount={listBulk.selectedCount}
            onClear={listBulk.selectionClear}
            onConfirmDelete={() => bulkDeleteMutation.mutateAsync(listBulk.selectedTargets)}
          />
          <AdminProjectsTable
            projects={response.data}
            viewMode={effectiveViewMode}
            searchKey={activeSearch}
            listSelection={listBulk.listSelection}
            onOpenBuildings={(project) => {
              setBuildingsProject({
                id: project.id,
                name: project.name,
                builderCompanyId: project.builderCompanyId,
              });
            }}
          />
        </div>
      )}

      <CatalogPagination
        page={response.meta.page}
        totalPages={response.meta.totalPages}
        previousHref={
          response.meta.page > 1 ? buildListHref(response.meta.page - 1) : null
        }
        nextHref={
          response.meta.page < response.meta.totalPages
            ? buildListHref(response.meta.page + 1)
            : null
        }
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        ariaLabel={t('pagination.ariaLabel')}
      />

      <AdminCreateProjectSheet
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
        }}
        defaultCompanyId={companyIds.length === 1 ? companyIds[0] : undefined}
      />

      <AdminProjectBuildingsSheet
        project={buildingsProject}
        onClose={() => {
          setBuildingsProject(null);
        }}
      />
    </div>
  );
};
