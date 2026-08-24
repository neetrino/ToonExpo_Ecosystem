'use client';

import { Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { AdminApartmentsTable } from '@/features/admin/components/admin-apartments-table';
import { AdminCreateApartmentSheet } from '@/features/admin/components/admin-create-apartment-sheet';
import {
  AdminInventoryListShell,
  useAdminInventoryListParams,
} from '@/features/admin/components/admin-inventory-list-shell';
import {
  ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS,
  ADMIN_VIEW_MODE_KEYS,
} from '@/features/admin/constants';
import { useAdminApartmentsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { HOME_FEATURED_APARTMENT_LIMIT } from '@/features/catalog/constants/home-featured';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';

const FIRST_PAGE = 1;

/**
 * Admin apartments hub list.
 */
export const AdminApartmentsListPage = () => {
  const t = useTranslations('Admin.apartments');
  const { page, pageSize, companyId, buildingId, floorId } = useAdminInventoryListParams();
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(trimmedSearch, ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS);
  const activeSearch = trimmedSearch.length === 0 ? '' : debouncedSearch;
  const query = useAdminApartmentsQuery(
    page,
    pageSize,
    companyId,
    buildingId,
    activeSearch || undefined,
    floorId,
  );
  const response = query.data;
  const [showCreate, setShowCreate] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.apartments,
  );
  const returnTo = (() => {
    const queryString = searchParams.toString();
    return queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
  })();

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    if (page > FIRST_PAGE) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      const queryString = params.toString();
      router.replace(queryString.length > 0 ? `${pathname}?${queryString}` : pathname);
    }
  };

  return (
    <>
      <AdminInventoryListShell
        title={t('title')}
        subtitle={
          response
            ? t('subtitleWithFeatured', {
                count: response.meta.total,
                featured: response.meta.featuredOnHomeTotal,
                limit: HOME_FEATURED_APARTMENT_LIMIT,
              })
            : t('subtitle', { count: 0 })
        }
        empty={t('empty')}
        loading={t('loading')}
        error={t('error')}
        isLoading={query.isLoading}
        isError={query.isError || !response}
        total={response?.meta.total ?? 0}
        page={response?.meta.page ?? page}
        totalPages={response?.meta.totalPages ?? 0}
        search={search}
        onSearchChange={handleSearchChange}
        icon={Home}
        showBuildingFilter
        showFloorFilter
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        headerActions={
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setShowCreate(true);
            }}
          >
            <AddActionLabel>{t('create.cta')}</AddActionLabel>
          </Button>
        }
      >
        {response ? (
          <AdminApartmentsTable
            apartments={response.data}
            returnTo={returnTo}
            viewMode={effectiveViewMode}
          />
        ) : null}
      </AdminInventoryListShell>

      <AdminCreateApartmentSheet
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
        }}
        defaultCompanyId={companyId}
        defaultBuildingId={buildingId}
      />
    </>
  );
};
