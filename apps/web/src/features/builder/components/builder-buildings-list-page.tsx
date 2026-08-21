'use client';

import { Building } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AdminBuildingInventorySheet } from '@/features/admin/components/admin-building-inventory-sheet';
import { AdminBuildingsTable } from '@/features/admin/components/admin-buildings-table';
import { ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS } from '@/features/admin/constants';
import { PORTAL_INVENTORY_SHEET_SCOPE } from '@/features/admin/inventory-sheet-scope';
import {
  BuilderInventoryListShell,
  useBuilderInventoryListParams,
} from '@/features/builder/components/builder-inventory-list-shell';
import { PortalCreateBuildingSheet } from '@/features/builder/components/portal-create-building-sheet';
import { BUILDINGS_VIEW_MODE_KEY } from '@/features/builder/constants';
import { usePortalInventoryBuildingsQuery } from '@/features/builder/hooks/use-portal-inventory-hub';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';

const FIRST_PAGE = 1;

/**
 * Builder buildings hub — card opens inventory glance (floors → apartments) like admin.
 */
export const BuilderBuildingsListPage = () => {
  const t = useTranslations('Admin.buildings');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, pageSize } = useBuilderInventoryListParams();
  const [search, setSearch] = useState('');
  const trimmedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(trimmedSearch, ADMIN_PROJECTS_SEARCH_DEBOUNCE_MS);
  const activeSearch = trimmedSearch.length === 0 ? '' : debouncedSearch;
  const query = usePortalInventoryBuildingsQuery(
    page,
    pageSize,
    undefined,
    activeSearch || undefined,
  );
  const response = query.data;
  const [showCreate, setShowCreate] = useState(false);
  const [sheetFloorId, setSheetFloorId] = useState<string | null>(null);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(BUILDINGS_VIEW_MODE_KEY);

  const buildingId = searchParams.get('buildingId')?.trim() || null;

  useEffect(() => {
    setSheetFloorId(null);
  }, [buildingId]);

  const currentHref = (() => {
    const queryString = searchParams.toString();
    return queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
  })();

  const buildHref = (next: { page?: number; buildingId?: string | null }): string => {
    const params = new URLSearchParams();
    const nextPage = next.page ?? page;
    const nextBuildingId = next.buildingId === undefined ? buildingId : next.buildingId;

    if (nextPage > FIRST_PAGE) {
      params.set('page', String(nextPage));
    }
    if (nextBuildingId) {
      params.set('buildingId', nextBuildingId);
    }

    const queryString = params.toString();
    return queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
  };

  const replaceHref = (href: string): void => {
    if (href === currentHref) {
      return;
    }
    router.replace(href);
  };

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    if (page > FIRST_PAGE) {
      replaceHref(buildHref({ page: FIRST_PAGE }));
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
        icon={Building}
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
          <AdminBuildingsTable
            buildings={response.data}
            viewMode={effectiveViewMode}
            showCompany={false}
            onSelectBuilding={(id) => {
              setSheetFloorId(null);
              replaceHref(buildHref({ buildingId: id }));
            }}
          />
        ) : null}
      </BuilderInventoryListShell>

      <PortalCreateBuildingSheet
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
        }}
      />

      <AdminBuildingInventorySheet
        buildingId={buildingId}
        floorId={sheetFloorId}
        sheetScope={PORTAL_INVENTORY_SHEET_SCOPE}
        onClose={() => {
          setSheetFloorId(null);
          replaceHref(buildHref({ buildingId: null }));
        }}
        onSelectFloor={setSheetFloorId}
        onCloseFloor={() => {
          setSheetFloorId(null);
        }}
      />
    </>
  );
};
