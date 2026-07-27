'use client';

import type { BosProvisioningStatus } from '@toonexpo/contracts';
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
  ADMIN_VIEW_MODE_KEYS,
} from '@/features/admin/constants';
import { useAdminBosProvisioningListQuery } from '@/features/admin/hooks/use-admin-bos-provisioning';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};

/**
 * Admin BOS provisioning history list with status filter and pagination.
 */
export const BosProvisioningListPage = () => {
  const t = useTranslations('Admin.bos');
  const tCommon = useTranslations('Common.integratedSearch');
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get('page'));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BosProvisioningStatus | ''>('');
  const { viewMode, setViewMode } = usePersistedViewMode(ADMIN_VIEW_MODE_KEYS.bos);

  const listQuery = useAdminBosProvisioningListQuery({
    page,
    pageSize: ADMIN_BOS_PROVISIONING_DEFAULT_PAGE_SIZE,
    ...(statusFilter ? { status: statusFilter } : {}),
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
        title={t('title')}
        subtitle={t('subtitle', { count: response.meta.total })}
        search={search}
        searchPlaceholder={tCommon('searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        filters={filterConfigs}
        filterValues={{ [BOS_PROVISIONING_FILTER_STATUS_KEY]: statusFilter }}
        onSearchChange={setSearch}
        onFilterChange={(key, value) => {
          if (key === BOS_PROVISIONING_FILTER_STATUS_KEY) {
            setStatusFilter(value as BosProvisioningStatus | '');
          }
        }}
        onClearAll={() => {
          setStatusFilter('');
        }}
        actions={<ViewModeToggle value={viewMode} onChange={setViewMode} />}
      />

      {response.data.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <BosProvisioningTable requests={response.data} viewMode={viewMode} />
      )}

      <CatalogPagination
        page={response.meta.page}
        totalPages={response.meta.totalPages}
        buildHref={(nextPage) =>
          nextPage <= 1 ? '/admin/integrations/bos' : `/admin/integrations/bos?page=${nextPage}`
        }
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        ariaLabel={t('pagination.ariaLabel')}
      />
    </div>
  );
};
