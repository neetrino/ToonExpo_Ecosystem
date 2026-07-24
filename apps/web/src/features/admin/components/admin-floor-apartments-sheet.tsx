'use client';

import type { ApartmentSalesStatus, MediaAssetSummary } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AdminFloorAddApartmentsSheet } from '@/features/admin/components/admin-floor-add-apartments-sheet';
import { FloorPlanGlanceIcon } from '@/features/admin/components/floor-plan-glance-icon';
import { FloorPlanLightbox } from '@/features/admin/components/floor-plan-lightbox';
import { useAdminFloorApartmentsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { catalogApartmentDetailHref } from '@/features/builder/catalog-scope';
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
  floorplan: MediaAssetSummary | null;
  onClose: () => void;
  /** Nested under building sheet = 1; standalone from floors hub = 0. */
  stackLevel?: number | undefined;
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
  floorplan,
  onClose,
  stackLevel = 1,
}: AdminFloorApartmentsSheetProps) => {
  const t = useTranslations('Admin.buildings.inventory');
  const createT = useTranslations('Admin.apartments.create');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useAdminFloorApartmentsQuery(companyId, floorId);
  const apartments = query.data ?? [];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const returnTo = (() => {
    const queryString = searchParams.toString();
    return queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
  })();

  useEffect(() => {
    if (!open) {
      setAddOpen(false);
      setLightboxOpen(false);
    }
  }, [open]);

  return (
    <>
      <SideSheet
        open={open}
        onClose={onClose}
        title={floorLabel}
        description={t('floorSheetSubtitle')}
        size="comfortable"
        stackLevel={stackLevel}
        headerActions={
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
        }
      >
        <div className="flex flex-col gap-6">
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
                      href={catalogApartmentDetailHref({ mode: 'admin', companyId }, apartment.id, {
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
        onClose={() => {
          setAddOpen(false);
        }}
      />
    </>
  );
};
