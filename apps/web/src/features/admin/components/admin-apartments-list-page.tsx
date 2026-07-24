'use client';

import type { AdminApartmentListItem, ApartmentSalesStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AdminCreateApartmentSheet } from '@/features/admin/components/admin-create-apartment-sheet';
import {
  AdminInventoryListShell,
  useAdminInventoryListParams,
} from '@/features/admin/components/admin-inventory-list-shell';
import { useAdminApartmentsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { Link } from '@/i18n/navigation';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';

/**
 * Admin apartments hub list.
 */
export const AdminApartmentsListPage = () => {
  const t = useTranslations('Admin.apartments');
  const { page, pageSize, companyId, buildingId } = useAdminInventoryListParams();
  const query = useAdminApartmentsQuery(page, pageSize, companyId, buildingId);
  const response = query.data;
  const [showCreate, setShowCreate] = useState(false);

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
        {response ? <ApartmentsTable apartments={response.data} /> : null}
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

type ApartmentsTableProps = {
  apartments: AdminApartmentListItem[];
};

const ApartmentsTable = ({ apartments }: ApartmentsTableProps) => {
  const t = useTranslations('Admin.apartments');

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {apartments.map((apartment) => (
        <Link
          key={apartment.id}
          href={`/admin/projects/apartments/${apartment.id}?companyId=${encodeURIComponent(apartment.builderCompanyId)}`}
          className="flex flex-col gap-2 rounded-lg bg-surface-elevated p-4 shadow-xs transition-[box-shadow] hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="min-w-0 truncate font-semibold text-ink">
              {t('unit', { number: apartment.number })}
            </span>
            <PublicationStatusBadge
              status={apartment.publicationStatus}
              className={LIST_STATUS_BADGE_COMPACT_CLASS}
            />
          </div>
          <p className="truncate text-sm text-ink-secondary">
            {apartment.buildingName} · {t('floorNumber', { number: apartment.floorNumber })}
          </p>
          <p className="truncate text-sm text-ink-muted">
            {apartment.projectName} · {apartment.companyName}
          </p>
          <p className="text-sm text-ink-secondary">
            {t(`sales.${apartment.salesStatus as ApartmentSalesStatus}`)}
          </p>
        </Link>
      ))}
    </div>
  );
};
