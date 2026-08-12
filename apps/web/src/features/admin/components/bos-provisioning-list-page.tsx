'use client';

import type { BosProvisioningStatus } from '@toonexpo/contracts';
import { SearchX, Workflow } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  BOS_PROVISIONING_FILTER_STATUS_KEY,
  buildBosProvisioningFilterConfigs,
} from '@/features/admin/components/bos-provisioning-filters';
import { BosProvisioningTable } from '@/features/admin/components/bos-provisioning-table';
import {
  ADMIN_BOS_PROVISIONING_DEFAULT_PAGE_SIZE,
  ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS,
  ADMIN_VIEW_MODE_KEYS,
} from '@/features/admin/constants';
import { useAdminBosProvisioningListQuery } from '@/features/admin/hooks/use-admin-bos-provisioning';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
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

const buildBosHref = (pathname: string, page: number): string => {
  if (page <= FIRST_PAGE) {
    return pathname;
  }
  return `${pathname}?page=${page}`;
};

/**
 * Admin BOS provisioning history list with status filter and pagination.
 */
export const BosProvisioningListPage = () => {
  const t = useTranslations('Admin.bos');
  const tCommon = useTranslations('Common.integratedSearch');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = parsePage(searchParams.get('page'));
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(trimmedSearch, ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS);
  const activeSearch = trimmedSearch.length === 0 ? '' : debouncedSearch;
  const [statusFilter, setStatusFilter] = useState<BosProvisioningStatus | ''>('');
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.bos,
  );

  const listQuery = useAdminBosProvisioningListQuery({
    page,
    pageSize: ADMIN_BOS_PROVISIONING_DEFAULT_PAGE_SIZE,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(activeSearch ? { search: activeSearch } : {}),
  });

  const filterConfigs = useMemo(
    () =>
      buildBosProvisioningFilterConfigs({
        status: t('filters.status'),
        allStatuses: t('filters.allStatuses'),
        statusOption: (status) => t(`filters.statuses.${status}`),
      }),
    [t],
  );

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    if (page > FIRST_PAGE) {
      router.replace(buildBosHref(pathname, FIRST_PAGE));
    }
  };

  if (listQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (listQuery.isError || !listQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const response = listQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <ListPageHeader
        icon={Workflow}
        title={t('title')}
        subtitle={t('subtitle', { count: response.meta.total })}
        search={search}
        searchPlaceholder={tCommon('searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        filters={filterConfigs}
        filterValues={{ [BOS_PROVISIONING_FILTER_STATUS_KEY]: statusFilter }}
        onSearchChange={handleSearchChange}
        onFilterChange={(key, value) => {
          if (key === BOS_PROVISIONING_FILTER_STATUS_KEY) {
            setStatusFilter(value as BosProvisioningStatus | '');
            if (page > FIRST_PAGE) {
              router.replace(buildBosHref(pathname, FIRST_PAGE));
            }
          }
        }}
        onClearAll={() => {
          setSearch('');
          setStatusFilter('');
          if (page > FIRST_PAGE) {
            router.replace(buildBosHref(pathname, FIRST_PAGE));
          }
        }}
        actions={<ViewModeToggle value={viewMode} onChange={setViewMode} />}
      />

      {response.data.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center">
          <EmptyState
            icon={activeSearch ? SearchX : Workflow}
            title={activeSearch ? t('noResultsTitle') : t('empty')}
            description={activeSearch ? t('noResults', { query: activeSearch }) : undefined}
            actionLabel={activeSearch ? t('clearSearch') : undefined}
            onAction={activeSearch ? () => handleSearchChange('') : undefined}
            className="w-full max-w-md border-solid border-border/70 bg-surface-elevated px-6 py-10 shadow-sm sm:px-10 sm:py-12"
          />
        </div>
      ) : (
        <BosProvisioningTable requests={response.data} viewMode={effectiveViewMode} />
      )}

      <CatalogPagination
        page={response.meta.page}
        totalPages={response.meta.totalPages}
        previousHref={
          response.meta.page > FIRST_PAGE
            ? buildBosHref(pathname, response.meta.page - 1)
            : null
        }
        nextHref={
          response.meta.page < response.meta.totalPages
            ? buildBosHref(pathname, response.meta.page + 1)
            : null
        }
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        ariaLabel={t('pagination.ariaLabel')}
      />
    </div>
  );
};
