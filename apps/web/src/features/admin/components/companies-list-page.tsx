'use client';

import { Building2, SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  buildCompanyReadinessMap,
  CompaniesTable,
} from '@/features/admin/components/companies-table';
import { CompanyDetailSheet } from '@/features/admin/components/company-detail-sheet';
import { CreateCompanySheet } from '@/features/admin/components/create-company-sheet';
import {
  ADMIN_COMPANIES_DEFAULT_PAGE_SIZE,
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS,
  ADMIN_VIEW_MODE_KEYS,
} from '@/features/admin/constants';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { useAdminReadinessAssessmentsQuery } from '@/features/admin/hooks/use-admin-readiness';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const FIRST_PAGE = 1;

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < FIRST_PAGE) {
    return FIRST_PAGE;
  }
  return Math.floor(parsed);
};

const buildCompaniesHref = (pathname: string, page: number): string => {
  if (page <= FIRST_PAGE) {
    return pathname;
  }
  return `${pathname}?page=${page}`;
};

/**
 * Admin companies list with search, pagination, create sheet, and detail sheet.
 */
export const CompaniesListPage = () => {
  const t = useTranslations('Admin.companies');
  const tCommon = useTranslations('Common.integratedSearch');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = parsePage(searchParams.get('page'));
  const pageSize = ADMIN_COMPANIES_DEFAULT_PAGE_SIZE;
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(trimmedSearch, ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS);
  const activeSearch = trimmedSearch.length === 0 ? '' : debouncedSearch;

  const query = useAdminCompaniesQuery(page, pageSize, {
    type: 'builder',
    ...(activeSearch ? { search: activeSearch } : {}),
  });
  const readinessQuery = useAdminReadinessAssessmentsQuery({
    page: 1,
    pageSize: ADMIN_COMPANIES_MAX_PAGE_SIZE,
    targetType: 'builder_company',
  });
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.companies,
  );

  const loadedSearchRef = useRef(activeSearch);
  if (!query.isPlaceholderData && query.data) {
    loadedSearchRef.current = activeSearch;
  }
  const isSearchSettling = loadedSearchRef.current !== trimmedSearch;

  const readinessByCompanyId = useMemo(
    () => buildCompanyReadinessMap(readinessQuery.data?.data ?? []),
    [readinessQuery.data?.data],
  );

  const clearCreateParam = useCallback((): void => {
    if (searchParams.get('create') !== '1') {
      return;
    }
    const next = new URLSearchParams(searchParams.toString());
    next.delete('create');
    const queryString = next.toString();
    router.replace(queryString.length > 0 ? `${pathname}?${queryString}` : pathname);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setSelectedCompanyId(null);
      setCreateSheetOpen(true);
    }
  }, [searchParams]);

  const handleCloseCreateSheet = (): void => {
    setCreateSheetOpen(false);
    clearCreateParam();
  };

  const handleSelectCompany = (companyId: string): void => {
    setCreateSheetOpen(false);
    clearCreateParam();
    setSelectedCompanyId(companyId);
  };

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    if (page > FIRST_PAGE) {
      router.replace(buildCompaniesHref(pathname, FIRST_PAGE));
    }
  };

  const response = query.data;
  const totalCount = response?.meta.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <ListPageHeader
        icon={Building2}
        title={t('title')}
        subtitle={query.isLoading ? t('loading') : t('subtitle', { count: totalCount })}
        search={search}
        searchPlaceholder={t('searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        onSearchChange={handleSearchChange}
        onClearAll={() => {
          handleSearchChange('');
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
                setSelectedCompanyId(null);
                setCreateSheetOpen(true);
              }}
            >
              <AddActionLabel>{t('newCompany')}</AddActionLabel>
            </Button>
          </>
        }
      />

      {query.isLoading ? null : query.isError || !response ? (
        <p role="alert" className="text-sm text-danger">
          {t('error')}
        </p>
      ) : isSearchSettling ? (
        <p className="text-sm text-ink-secondary">{t('loading')}</p>
      ) : response.data.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center">
          <EmptyState
            icon={activeSearch ? SearchX : Building2}
            title={activeSearch ? t('noResultsTitle') : t('empty')}
            description={activeSearch ? t('noResults', { query: activeSearch }) : undefined}
            actionLabel={activeSearch ? t('clearSearch') : undefined}
            onAction={activeSearch ? () => handleSearchChange('') : undefined}
            className="w-full max-w-md border-solid border-border/70 bg-surface-elevated px-6 py-10 shadow-sm sm:px-10 sm:py-12"
          />
        </div>
      ) : (
        <>
          <CompaniesTable
            companies={response.data}
            readinessByCompanyId={readinessByCompanyId}
            onSelectCompany={handleSelectCompany}
            viewMode={effectiveViewMode}
          />

          <CatalogPagination
            page={response.meta.page}
            totalPages={response.meta.totalPages}
            previousHref={
              response.meta.page > 1 ? buildCompaniesHref(pathname, response.meta.page - 1) : null
            }
            nextHref={
              response.meta.page < response.meta.totalPages
                ? buildCompaniesHref(pathname, response.meta.page + 1)
                : null
            }
            previousLabel={t('pagination.previous')}
            nextLabel={t('pagination.next')}
            ariaLabel={t('pagination.ariaLabel')}
          />
        </>
      )}

      <CreateCompanySheet open={createSheetOpen} onClose={handleCloseCreateSheet} />
      <CompanyDetailSheet
        companyId={selectedCompanyId}
        open={selectedCompanyId != null}
        onClose={() => setSelectedCompanyId(null)}
      />
    </div>
  );
};
