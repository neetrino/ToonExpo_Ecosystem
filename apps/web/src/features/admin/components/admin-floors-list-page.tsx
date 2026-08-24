'use client';

import type { AdminFloorListItem } from '@toonexpo/contracts';
import { Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AdminCreateFloorSheet } from '@/features/admin/components/admin-create-floor-sheet';
import { AdminFloorApartmentsSheet } from '@/features/admin/components/admin-floor-apartments-sheet';
import { AdminFloorsTable } from '@/features/admin/components/admin-floors-table';
import {
  AdminInventoryListShell,
  useAdminInventoryListParams,
} from '@/features/admin/components/admin-inventory-list-shell';
import {
  ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS,
  ADMIN_VIEW_MODE_KEYS,
} from '@/features/admin/constants';
import {
  useAdminBuildingInventoryGlanceQuery,
  useAdminFloorsQuery,
} from '@/features/admin/hooks/use-admin-inventory';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';

const FIRST_PAGE = 1;

/**
 * Admin floors hub — card/list opens a single floor apartments sheet.
 */
export const AdminFloorsListPage = () => {
  const t = useTranslations('Admin.floors');
  const inventoryT = useTranslations('Admin.buildings.inventory');
  const { page, pageSize, companyIds, buildingIds, companyId, buildingId } =
    useAdminInventoryListParams();
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(trimmedSearch, ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS);
  const activeSearch = trimmedSearch.length === 0 ? '' : debouncedSearch;
  const query = useAdminFloorsQuery(
    page,
    pageSize,
    companyIds,
    buildingIds,
    activeSearch || undefined,
  );
  const response = query.data;
  const [showCreate, setShowCreate] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<AdminFloorListItem | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.floors,
  );

  const glanceQuery = useAdminBuildingInventoryGlanceQuery(selectedFloor?.buildingId ?? '');
  const floorplan = useMemo(() => {
    if (!selectedFloor || !glanceQuery.data) {
      return null;
    }
    return (
      glanceQuery.data.floors.find((floor) => floor.id === selectedFloor.id)?.floorplan ?? null
    );
  }, [selectedFloor, glanceQuery.data]);

  const floorLabel = selectedFloor
    ? selectedFloor.displayLabel?.trim() ||
      selectedFloor.name?.trim() ||
      inventoryT('floorCode', { number: selectedFloor.number })
    : inventoryT('floorFallback');

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
        icon={Layers}
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
          <AdminFloorsTable
            floors={response.data}
            viewMode={effectiveViewMode}
            onSelectFloor={(floor) => {
              setSelectedFloor(floor);
            }}
          />
        ) : null}
      </AdminInventoryListShell>

      <AdminCreateFloorSheet
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
        }}
        defaultCompanyId={companyId}
        defaultBuildingId={buildingId}
      />

      {selectedFloor ? (
        <AdminFloorApartmentsSheet
          open
          stackLevel={0}
          companyId={selectedFloor.builderCompanyId}
          buildingId={selectedFloor.buildingId}
          floorId={selectedFloor.id}
          floorLabel={floorLabel}
          publicationStatus={selectedFloor.publicationStatus}
          floorplan={floorplan}
          onClose={() => {
            setSelectedFloor(null);
          }}
        />
      ) : null}
    </>
  );
};
