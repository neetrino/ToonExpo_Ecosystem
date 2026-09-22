'use client';

import type { AdminBuildingListItem } from '@toonexpo/contracts';
import { Building } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AdminBuildingInventorySheet } from '@/features/admin/components/admin-building-inventory-sheet';
import { AdminBuildingsTable } from '@/features/admin/components/admin-buildings-table';
import { AdminCreateBuildingSheet } from '@/features/admin/components/admin-create-building-sheet';
import {
  AdminInventoryListShell,
  useAdminInventoryListParams,
} from '@/features/admin/components/admin-inventory-list-shell';
import { ReadinessManagementModal } from '@/features/admin/components/readiness-management-modal';
import { ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import { useBulkDeleteBuildingsMutation } from '@/features/admin/hooks/use-inventory-bulk-delete';
import { useInventoryListSelection } from '@/features/admin/hooks/use-inventory-list-selection';
import { useAdminBuildingsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useDebouncedSearch } from '@/shared/hooks/use-debounced-search';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { ListSelectionToolbar } from '@/shared/ui/list-selection-toolbar';

const FIRST_PAGE = 1;

/**
 * Admin buildings hub list with inventory glance sheet and readiness popup.
 */
export const AdminBuildingsListPage = () => {
  const t = useTranslations('Admin.buildings');
  const { page, pageSize, companyIds, companyId, projectId } = useAdminInventoryListParams();
  const [search, setSearch] = useState('');
  const activeSearch = useDebouncedSearch(search);
  const query = useAdminBuildingsQuery(page, pageSize, companyIds, projectId, {
    ...(activeSearch ? { search: activeSearch } : {}),
  });
  const response = query.data;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [showCreate, setShowCreate] = useState(false);
  const [sheetFloorId, setSheetFloorId] = useState<string | null>(null);
  const [readinessBuilding, setReadinessBuilding] = useState<AdminBuildingListItem | null>(null);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.buildings,
  );
  const buildings = response?.data ?? [];
  const listBulk = useInventoryListSelection(buildings, effectiveViewMode, { enabled: true });
  const bulkDeleteMutation = useBulkDeleteBuildingsMutation();

  const buildingId = searchParams.get('buildingId')?.trim() || null;

  useEffect(() => {
    setSheetFloorId(null);
  }, [buildingId]);

  const currentHref = (() => {
    const queryString = searchParams.toString();
    return queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
  })();

  const buildHref = (next: {
    page?: number;
    companyId?: string;
    projectId?: string;
    buildingId?: string | null;
  }): string => {
    const params = new URLSearchParams();
    const nextCompanyId = next.companyId ?? companyId;
    const nextProjectId = next.projectId ?? projectId;
    const nextPage = next.page ?? page;
    const nextBuildingId = next.buildingId === undefined ? buildingId : next.buildingId;

    if (nextCompanyId) {
      params.set('companyId', nextCompanyId);
    }
    if (nextProjectId) {
      params.set('projectId', nextProjectId);
    }
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
          <div className="flex flex-col gap-3">
            <ListSelectionToolbar
              selectedCount={listBulk.selectedCount}
              onClear={listBulk.selectionClear}
              onConfirmDelete={() => bulkDeleteMutation.mutateAsync(listBulk.selectedTargets)}
            />
            <AdminBuildingsTable
              buildings={response.data}
              viewMode={effectiveViewMode}
              listSelection={listBulk.listSelection}
              onSelectBuilding={(id) => {
                setSheetFloorId(null);
                replaceHref(buildHref({ buildingId: id }));
              }}
              onOpenReadiness={setReadinessBuilding}
            />
          </div>
        ) : null}
      </AdminInventoryListShell>

      <AdminCreateBuildingSheet
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
        }}
        defaultCompanyId={companyId}
      />

      <AdminBuildingInventorySheet
        buildingId={buildingId}
        floorId={sheetFloorId}
        onClose={() => {
          setSheetFloorId(null);
          replaceHref(buildHref({ buildingId: null }));
        }}
        onSelectFloor={setSheetFloorId}
        onCloseFloor={() => {
          setSheetFloorId(null);
        }}
      />

      <ReadinessManagementModal
        target={readinessBuilding ? { kind: 'building', building: readinessBuilding } : null}
        onClose={() => {
          setReadinessBuilding(null);
        }}
      />
    </>
  );
};
