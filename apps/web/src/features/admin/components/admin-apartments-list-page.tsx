'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { AdminApartmentsTable } from '@/features/admin/components/admin-apartments-table';
import { AdminCreateApartmentSheet } from '@/features/admin/components/admin-create-apartment-sheet';
import {
  AdminInventoryListShell,
  useAdminInventoryListParams,
} from '@/features/admin/components/admin-inventory-list-shell';
import { ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import { useAdminApartmentsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { usePathname } from '@/i18n/navigation';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';

/**
 * Admin apartments hub list.
 */
export const AdminApartmentsListPage = () => {
  const t = useTranslations('Admin.apartments');
  const { page, pageSize, companyId, buildingId } = useAdminInventoryListParams();
  const query = useAdminApartmentsQuery(page, pageSize, companyId, buildingId);
  const response = query.data;
  const [showCreate, setShowCreate] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { viewMode, setViewMode } = usePersistedViewMode(ADMIN_VIEW_MODE_KEYS.apartments);
  const returnTo = (() => {
    const queryString = searchParams.toString();
    return queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
  })();

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
            viewMode={viewMode}
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
