'use client';

import type { AccountType, UserStatus } from '@toonexpo/contracts';
import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { UsersTable } from '@/features/admin/components/users-table';
import {
  ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
  ADMIN_VIEW_MODE_KEYS,
} from '@/features/admin/constants';
import { useAdminUsersQuery } from '@/features/admin/hooks/use-admin-users';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const FILTER_ACCOUNT_TYPE_KEY = 'accountType';
const FILTER_STATUS_KEY = 'status';

const ACCOUNT_TYPES: AccountType[] = [
  'buyer',
  'platform_admin',
  'entrance_staff',
  'company_member',
];

const USER_STATUSES: UserStatus[] = ['invited', 'active', 'inactive', 'blocked'];

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};

const parseAccountType = (raw: string | null): AccountType | undefined => {
  if (!raw) {
    return undefined;
  }
  return ACCOUNT_TYPES.includes(raw as AccountType) ? (raw as AccountType) : undefined;
};

const parseStatus = (raw: string | null): UserStatus | undefined => {
  if (!raw) {
    return undefined;
  }
  return USER_STATUSES.includes(raw as UserStatus) ? (raw as UserStatus) : undefined;
};

/**
 * Admin users directory: paginated list with filters and cards/table views.
 */
export const UsersListPage = () => {
  const t = useTranslations('Admin.users');
  const tCommon = useTranslations('Common.integratedSearch');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = parsePage(searchParams.get('page'));
  const accountType = parseAccountType(searchParams.get(FILTER_ACCOUNT_TYPE_KEY));
  const status = parseStatus(searchParams.get(FILTER_STATUS_KEY));
  const pageSize = ADMIN_INVENTORY_DEFAULT_PAGE_SIZE;
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.users,
  );
  const [search, setSearch] = useState('');

  const usersQuery = useAdminUsersQuery({
    page,
    pageSize,
    ...(accountType ? { accountType } : {}),
    ...(status ? { status } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  });

  const buildListHref = (next: {
    page?: number;
    accountType?: AccountType | '';
    status?: UserStatus | '';
  }): string => {
    const params = new URLSearchParams();
    const nextAccountType =
      next.accountType === undefined ? accountType : next.accountType || undefined;
    const nextStatus = next.status === undefined ? status : next.status || undefined;
    const nextPage = next.page ?? page;

    if (nextAccountType) {
      params.set(FILTER_ACCOUNT_TYPE_KEY, nextAccountType);
    }
    if (nextStatus) {
      params.set(FILTER_STATUS_KEY, nextStatus);
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
        key: FILTER_ACCOUNT_TYPE_KEY,
        label: t('filters.accountType'),
        allOptionLabel: t('filters.allAccountTypes'),
        options: ACCOUNT_TYPES.map((type) => ({
          value: type,
          label: t(`accountTypes.${type}`),
        })),
      },
      {
        key: FILTER_STATUS_KEY,
        label: t('filters.status'),
        allOptionLabel: t('filters.allStatuses'),
        options: USER_STATUSES.map((value) => ({
          value,
          label: t(`statuses.${value}`),
        })),
      },
    ],
    [t],
  );

  if (usersQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (usersQuery.isError || !usersQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const response = usersQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <ListPageHeader
        icon={Users}
        title={t('title')}
        subtitle={t('subtitle', { count: response.meta.total })}
        search={search}
        searchPlaceholder={t('filters.searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        filters={filterConfigs}
        filterValues={{
          [FILTER_ACCOUNT_TYPE_KEY]: accountType ?? '',
          [FILTER_STATUS_KEY]: status ?? '',
        }}
        onSearchChange={setSearch}
        onFilterChange={(key, value) => {
          if (key === FILTER_ACCOUNT_TYPE_KEY) {
            router.replace(
              buildListHref({ page: 1, accountType: (value as AccountType | '') || '' }),
            );
            return;
          }
          if (key === FILTER_STATUS_KEY) {
            router.replace(buildListHref({ page: 1, status: (value as UserStatus | '') || '' }));
          }
        }}
        onClearAll={() => {
          setSearch('');
          router.replace(buildListHref({ page: 1, accountType: '', status: '' }));
        }}
        actions={<ViewModeToggle value={viewMode} onChange={setViewMode} />}
      />

      {response.data.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <UsersTable users={response.data} viewMode={effectiveViewMode} />
      )}

      <CatalogPagination
        page={response.meta.page}
        totalPages={response.meta.totalPages}
        previousHref={
          response.meta.page > 1
            ? buildListHref({ page: response.meta.page - 1 })
            : null
        }
        nextHref={
          response.meta.page < response.meta.totalPages
            ? buildListHref({ page: response.meta.page + 1 })
            : null
        }
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        ariaLabel={t('pagination.ariaLabel')}
      />
    </div>
  );
};
