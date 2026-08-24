'use client';

import type { ApartmentSalesStatus, MediaAssetSummary, PublicationStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AdminFloorAddApartmentsSheet } from '@/features/admin/components/admin-floor-add-apartments-sheet';
import { AdminInventorySheetDelete } from '@/features/admin/components/admin-inventory-sheet-delete';
import { FloorPlanGlanceIcon } from '@/features/admin/components/floor-plan-glance-icon';
import { FloorPlanLightbox } from '@/features/admin/components/floor-plan-lightbox';
import {
  useAdminDeleteFloorMutation,
  useAdminFloorApartmentsQuery,
} from '@/features/admin/hooks/use-admin-inventory';
import {
  PLATFORM_INVENTORY_SHEET_SCOPE,
  toCatalogMutationScope,
  type InventorySheetScope,
} from '@/features/admin/inventory-sheet-scope';
import { catalogApartmentDetailHref } from '@/features/builder/catalog-scope';
import { toCatalogPublicationStatus } from '@/features/catalog/utils/catalog-publication-status';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { Link, usePathname } from '@/i18n/navigation';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { ApartmentSalesStatusBadge } from '@/shared/ui/apartment-sales-status-badge';
import { Button } from '@/shared/ui/button';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';
import { SideSheet } from '@/shared/ui/side-sheet';

type AdminFloorApartmentsSheetProps = {
  open: boolean;
  companyId: string;
  buildingId: string;
  floorId: string;
  floorLabel: string;
  publicationStatus: PublicationStatus;
  floorplan: MediaAssetSummary | null;
  onClose: () => void;
  /** Nested under building sheet = 1; standalone from floors hub = 0. */
  stackLevel?: number | undefined;
  sheetScope?: InventorySheetScope | undefined;
};

/**
 * Floor plan (if uploaded) then apartments on that floor.
 */
export const AdminFloorApartmentsSheet = ({
  open,
  companyId,
  buildingId,
  floorId,
  floorLabel,
  publicationStatus,
  floorplan,
  onClose,
  stackLevel = 1,
  sheetScope = PLATFORM_INVENTORY_SHEET_SCOPE,
}: AdminFloorApartmentsSheetProps) => {
  const t = useTranslations('Admin.buildings.inventory');
  const createT = useTranslations('Admin.apartments.create');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mutationScope = toCatalogMutationScope(sheetScope, companyId);
  const query = useAdminFloorApartmentsQuery(companyId, floorId, sheetScope);
  const apartments = query.data ?? [];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteMutation = useAdminDeleteFloorMutation();
  const canDelete = toCatalogPublicationStatus(publicationStatus) === 'draft';
  const deleting = deleteMutation.isPending;

  const returnTo = (() => {
    const queryString = searchParams.toString();
    return queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
  })();

  useEffect(() => {
    if (!open) {
      setAddOpen(false);
      setLightboxOpen(false);
      setConfirmDelete(false);
      setDeleteError(null);
    }
  }, [open]);

  const runDelete = (): void => {
    setDeleteError(null);
    void deleteMutation
      .mutateAsync({ companyId, buildingId, floorId, scope: mutationScope })
      .then(() => {
        setConfirmDelete(false);
        onClose();
      })
      .catch(() => {
        setDeleteError(t('deleteError'));
      });
  };

  return (
    <>
      <SideSheet
        open={open}
        onClose={onClose}
        title={floorLabel}
        description={t('floorSheetSubtitle')}
        size="comfortable"
        stackLevel={stackLevel}
        escapeEnabled={!confirmDelete}
        headerActions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setAddOpen(true);
              }}
            >
              <AddActionLabel>{createT('cta')}</AddActionLabel>
            </Button>
            {canDelete ? (
              <AdminInventorySheetDelete
                confirmTitle={t('deleteFloorTitle')}
                confirmMessage={t('deleteFloorConfirm')}
                open={confirmDelete}
                busy={deleting}
                onOpen={() => {
                  setDeleteError(null);
                  setConfirmDelete(true);
                }}
                onCancel={() => {
                  if (!deleting) {
                    setConfirmDelete(false);
                  }
                }}
                onConfirm={runDelete}
              />
            ) : null}
          </div>
        }
      >
        <div className="flex flex-col gap-6">
          {deleteError ? (
            <p role="alert" className="text-sm text-danger">
              {deleteError}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {floorplan ? (
                <button
                  type="button"
                  className="relative size-12 shrink-0 cursor-zoom-in overflow-hidden rounded-full bg-surface ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                  aria-label={t('floorplanViewHint')}
                  onClick={() => {
                    setLightboxOpen(true);
                  }}
                >
                  <img
                    src={floorplan.fileUrl}
                    alt={floorplan.altText ?? t('floorplanAlt')}
                    className="size-full object-cover"
                  />
                </button>
              ) : null}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{t('floorplanTitle')}</p>
                {!floorplan ? (
                  <p className="text-xs text-ink-secondary">{t('noFloorplan')}</p>
                ) : null}
              </div>
            </div>
            <FloorPlanGlanceIcon
              hasFloorplan={Boolean(floorplan)}
              companyId={companyId}
              buildingId={buildingId}
              floorId={floorId}
              variant="edit"
              sheetScope={sheetScope}
            />
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-ink">{t('apartmentsTitle')}</h2>

            {query.isLoading ? (
              <p className="text-sm text-ink-secondary">{t('loadingApartments')}</p>
            ) : null}

            {query.isError ? (
              <p role="alert" className="text-sm text-danger">
                {t('apartmentsError')}
              </p>
            ) : null}

            {!query.isLoading && !query.isError && apartments.length === 0 ? (
              <p className="text-sm text-ink-secondary">{t('noApartments')}</p>
            ) : null}

            {apartments.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {apartments.map((apartment) => (
                  <li key={apartment.id}>
                    <Link
                      href={catalogApartmentDetailHref(mutationScope, apartment.id, {
                        returnTo,
                      })}
                      className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2.5 transition-colors hover:bg-brand-soft/40"
                    >
                      <span className="min-w-0 truncate text-sm font-medium text-ink">
                        {t('apartmentUnit', { number: apartment.number })}
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <ApartmentSalesStatusBadge
                          status={apartment.salesStatus as ApartmentSalesStatus}
                          label={t(`sales.${apartment.salesStatus as ApartmentSalesStatus}`)}
                          className={LIST_STATUS_BADGE_COMPACT_CLASS}
                        />
                        <PublicationStatusBadge
                          status={apartment.publicationStatus}
                          className={LIST_STATUS_BADGE_COMPACT_CLASS}
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </div>
      </SideSheet>

      {floorplan ? (
        <FloorPlanLightbox
          open={lightboxOpen}
          imageUrl={floorplan.fileUrl}
          alt={floorplan.altText ?? t('floorplanAlt')}
          onClose={() => {
            setLightboxOpen(false);
          }}
        />
      ) : null}

      <AdminFloorAddApartmentsSheet
        open={addOpen}
        companyId={companyId}
        buildingId={buildingId}
        floorId={floorId}
        floorLabel={floorLabel}
        sheetScope={sheetScope}
        onClose={() => {
          setAddOpen(false);
        }}
      />
    </>
  );
};
