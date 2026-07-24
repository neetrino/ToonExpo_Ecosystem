'use client';

import type { ApartmentSalesStatus, MediaAssetSummary } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { useAdminFloorApartmentsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { catalogApartmentDetailHref } from '@/features/builder/catalog-scope';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { Link } from '@/i18n/navigation';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';
import { SideSheet } from '@/shared/ui/side-sheet';

type AdminFloorApartmentsSheetProps = {
  open: boolean;
  companyId: string;
  floorId: string;
  floorLabel: string;
  floorplan: MediaAssetSummary | null;
  onClose: () => void;
};

/**
 * Nested sheet: floor plan (if uploaded) then apartments on that floor.
 */
export const AdminFloorApartmentsSheet = ({
  open,
  companyId,
  floorId,
  floorLabel,
  floorplan,
  onClose,
}: AdminFloorApartmentsSheetProps) => {
  const t = useTranslations('Admin.buildings.inventory');
  const query = useAdminFloorApartmentsQuery(companyId, floorId);
  const apartments = query.data ?? [];

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      title={floorLabel}
      description={t('floorSheetSubtitle')}
      size="comfortable"
      stackLevel={1}
    >
      <div className="flex flex-col gap-6">
        {floorplan ? (
          <section className="overflow-hidden rounded-lg bg-surface">
            <div className="border-b border-border px-3 py-2">
              <h2 className="text-sm font-semibold text-ink">{t('floorplanTitle')}</h2>
            </div>
            <div className="bg-surface-elevated p-3">
              <img
                src={floorplan.fileUrl}
                alt={floorplan.altText ?? t('floorplanAlt')}
                className="mx-auto max-h-72 w-full object-contain"
              />
            </div>
          </section>
        ) : (
          <p className="text-sm text-ink-secondary">{t('noFloorplan')}</p>
        )}

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
                    href={catalogApartmentDetailHref({ mode: 'admin', companyId }, apartment.id)}
                    className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3 py-2.5 transition-colors hover:bg-brand-soft/40"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-ink">
                      {t('apartmentUnit', { number: apartment.number })}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-ink-secondary">
                        {t(`sales.${apartment.salesStatus as ApartmentSalesStatus}`)}
                      </span>
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
  );
};
