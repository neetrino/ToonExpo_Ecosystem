'use client';

import { FolderOpen, SearchX, FolderKanban } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';

import { AdminCreateProjectSheet } from '@/features/admin/components/admin-create-project-sheet';
import {
  AdminProjectBuildingsSheet,
  type AdminProjectBuildingsTarget,
} from '@/features/admin/components/admin-project-buildings-sheet';
import { AdminProjectsResultsSkeleton } from '@/features/admin/components/admin-projects-results-skeleton';
import { AdminProjectsTable } from '@/features/admin/components/admin-projects-table';
import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
  ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS,
  ADMIN_VIEW_MODE_KEYS,
} from '@/features/admin/constants';
import {
  useAdminCompaniesQuery,
  useAdminProjectsQuery,
} from '@/features/admin/hooks/use-admin-companies';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import { ListPageHeader } from '@/shared/ui/list-page-header';
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

const buildAdminProjectsHref = (pathname: string, page: number, companyId?: string): string => {
  const params = new URLSearchParams();
  if (companyId) {
    params.set('companyId', companyId);
  }
  if (page > FIRST_PAGE) {
    params.set('page', String(page));
  }
  const query = params.toString();
  return query.length > 0 ? `${pathname}?${query}` : pathname;
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
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.projects,
  );
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [buildingsProject, setBuildingsProject] = useState<AdminProjectBuildingsTarget | null>(
    null,
  );
  const trimmedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(trimmedSearch, ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS);
  /* Typing is debounced; clearing applies at once so the full list returns immediately. */
  const activeSearch = trimmedSearch.length === 0 ? '' : debouncedSearch;

  const projectsQuery = useAdminProjectsQuery({
    page,
    pageSize,
    ...(companyId ? { companyId } : {}),
    ...(activeSearch ? { search: activeSearch } : {}),
  });
  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);

  /*
   * Kept results are the previous term's rows, so track which term the rendered
   * data belongs to: until it matches the input, the list must not be shown.
   */
  const loadedSearchRef = useRef(activeSearch);
  if (!projectsQuery.isPlaceholderData && projectsQuery.data) {
    loadedSearchRef.current = activeSearch;
  }
  const isSearchSettling = loadedSearchRef.current !== trimmedSearch;

  const builderCompanies = useMemo(() => {
    const companies = companiesQuery.data?.data ?? [];
    return companies
      .filter((company) => company.type === 'builder')
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [companiesQuery.data]);

  const buildListHref = (nextPage: number, nextCompanyId?: string): string =>
    buildAdminProjectsHref(pathname, nextPage, nextCompanyId);

  /** Search always looks at the whole list, so a new term restarts pagination. */
  const handleSearchChange = (value: string): void => {
    setSearch(value);
    if (page > FIRST_PAGE) {
      router.replace(buildListHref(FIRST_PAGE, companyId));
    }
  };

  const handleClearSearch = (): void => {
    handleSearchChange('');
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
        icon={FolderKanban}
        title={t('title')}
        subtitle={t('subtitle', { count: response.meta.total })}
        search={search}
        searchPlaceholder={t('filters.searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        filters={filterConfigs}
        filterValues={{ [ADMIN_PROJECTS_FILTER_COMPANY_KEY]: companyId ?? '' }}
        onSearchChange={handleSearchChange}
        onFilterChange={(key, value) => {
          if (key === ADMIN_PROJECTS_FILTER_COMPANY_KEY) {
            router.replace(buildListHref(FIRST_PAGE, value || undefined));
          }
        }}
        onClearAll={() => {
          setSearch('');
          router.replace(buildListHref(FIRST_PAGE, undefined));
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

      {isSearchSettling ? (
        <AdminProjectsResultsSkeleton label={t('loading')} viewMode={effectiveViewMode} />
      ) : response.data.length === 0 ? (
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
        <AdminProjectsTable
          projects={response.data}
          viewMode={effectiveViewMode}
          searchKey={activeSearch}
          onOpenBuildings={(project) => {
            setBuildingsProject({
              id: project.id,
              name: project.name,
              builderCompanyId: project.builderCompanyId,
            });
          }}
        />
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

      <AdminProjectBuildingsSheet
        project={buildingsProject}
        onClose={() => {
          setBuildingsProject(null);
        }}
      />
    </div>
  );
};
