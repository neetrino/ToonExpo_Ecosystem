'use client';

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
import { ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import { useAdminBuildingsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { usePathname, useRouter } from '@/i18n/navigation';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';

/**
 * Admin buildings hub list with inventory glance sheet.
 */
export const AdminBuildingsListPage = () => {
  const t = useTranslations('Admin.buildings');
  const { page, pageSize, companyId } = useAdminInventoryListParams();
  const query = useAdminBuildingsQuery(page, pageSize, companyId);
  const response = query.data;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [showCreate, setShowCreate] = useState(false);
  const [sheetFloorId, setSheetFloorId] = useState<string | null>(null);
  const { viewMode, setViewMode } = usePersistedViewMode(ADMIN_VIEW_MODE_KEYS.buildings);

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
    buildingId?: string | null;
  }): string => {
    const params = new URLSearchParams();
    const nextCompanyId = next.companyId ?? companyId;
    const nextPage = next.page ?? page;
    const nextBuildingId = next.buildingId === undefined ? buildingId : next.buildingId;

    if (nextCompanyId) {
      params.set('companyId', nextCompanyId);
    }
    if (nextPage > 1) {
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
            viewMode={viewMode}
            onSelectBuilding={(id) => {
              setSheetFloorId(null);
              replaceHref(buildHref({ buildingId: id }));
            }}
          />
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
    </>
  );
};
