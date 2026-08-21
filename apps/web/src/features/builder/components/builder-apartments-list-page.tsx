'use client';

import { Home } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { AdminApartmentsTable } from '@/features/admin/components/admin-apartments-table';
import { ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS } from '@/features/admin/constants';
import { catalogApartmentsListHref } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import {
  BuilderInventoryListShell,
  useBuilderInventoryListParams,
} from '@/features/builder/components/builder-inventory-list-shell';
import { PortalCreateApartmentSheet } from '@/features/builder/components/portal-create-apartment-sheet';
import { APARTMENTS_VIEW_MODE_KEY } from '@/features/builder/constants';
import { usePortalInventoryApartmentsQuery } from '@/features/builder/hooks/use-portal-inventory-hub';
import { useRouter } from '@/i18n/navigation';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';

const FIRST_PAGE = 1;

/**
 * Builder apartments hub under Projects.
 */
export const BuilderApartmentsListPage = () => {
  const t = useTranslations('Admin.apartments');
  const scope = useCatalogScope();
  const { page, pageSize, buildingId } = useBuilderInventoryListParams();
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(trimmedSearch, ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS);
  const activeSearch = trimmedSearch.length === 0 ? '' : debouncedSearch;
  const query = usePortalInventoryApartmentsQuery(
    page,
    pageSize,
    buildingId,
    activeSearch || undefined,
  );
  const response = query.data;
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { viewMode, effectiveViewMode, setViewMode } =
    usePersistedViewMode(APARTMENTS_VIEW_MODE_KEY);
  const listHref = catalogApartmentsListHref(scope);
  const returnTo = (() => {
    const queryString = searchParams.toString();
    return queryString.length > 0 ? `${listHref}?${queryString}` : listHref;
  })();

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    if (page > FIRST_PAGE) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      const queryString = params.toString();
      router.replace(queryString.length > 0 ? `${listHref}?${queryString}` : listHref);
    }
  };

  return (
    <>
      <BuilderInventoryListShell
        title={t('title')}
        subtitle={t('subtitle', { count: response?.meta.total ?? 0 })}
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
            showCompany={false}
            catalogScope={scope}
          />
        ) : null}
      </BuilderInventoryListShell>

      <PortalCreateApartmentSheet
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
        }}
        defaultBuildingId={buildingId}
      />
    </>
  );
};
