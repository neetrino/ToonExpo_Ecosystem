'use client';

import type { AdminApartmentListItem, ApartmentSalesStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import type { KeyboardEvent } from 'react';

import { AdminApartmentCard } from '@/features/admin/components/admin-apartment-card';
import { AdminApartmentPriceText } from '@/features/admin/components/admin-apartment-price';
import type { CatalogScope } from '@/features/builder/catalog-scope';
import { catalogApartmentDetailHref } from '@/features/builder/catalog-scope';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { useRouter } from '@/i18n/navigation';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { ApartmentSalesStatusBadge } from '@/shared/ui/apartment-sales-status-badge';
import { cn } from '@/shared/ui/cn';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';
import { ListTableReveal } from '@/shared/ui/motion';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

const TABLE_HEAD_CELL_CLASS = 'px-3 py-2.5 text-center font-medium';
const TABLE_BODY_CELL_CLASS = 'px-3 py-2.5 text-center align-middle';
const TABLE_ROW_CLASS =
  'cursor-pointer border-t border-border hover:bg-surface/60 focus-visible:bg-surface/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/30';

type AdminApartmentsTableProps = {
  apartments: AdminApartmentListItem[];
  returnTo: string;
  viewMode?: ViewMode | undefined;
  showCompany?: boolean | undefined;
  catalogScope?: CatalogScope | undefined;
};

/**
 * Admin apartments collection as cards or table.
 */
export const AdminApartmentsTable = ({
  apartments,
  returnTo,
  viewMode = VIEW_MODE_CARDS,
  showCompany = true,
  catalogScope,
}: AdminApartmentsTableProps) => {
  const t = useTranslations('Admin.apartments');
  const router = useRouter();

  const apartmentHref = (apartment: AdminApartmentListItem): string =>
    catalogApartmentDetailHref(
      catalogScope ?? { mode: 'admin', companyId: apartment.builderCompanyId },
      apartment.id,
      { returnTo },
    );

  const openApartment = (apartment: AdminApartmentListItem): void => {
    router.push(apartmentHref(apartment));
  };

  const onRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    apartment: AdminApartmentListItem,
  ): void => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    openApartment(apartment);
  };

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid className="gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {apartments.map((apartment) => (
          <AdminApartmentCard
            key={apartment.id}
            apartment={apartment}
            returnTo={returnTo}
            showCompany={showCompany}
            showFeatured={catalogScope?.mode !== 'portal'}
            catalogScope={catalogScope}
          />
        ))}
      </AdminListCardGrid>
    );
  }

  return (
    <ListTableReveal>
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full min-w-[56rem] border-collapse text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className={TABLE_HEAD_CELL_CLASS}>{t('columns.unit')}</th>
              <th className={TABLE_HEAD_CELL_CLASS}>{t('columns.building')}</th>
              <th className={TABLE_HEAD_CELL_CLASS}>{t('columns.floor')}</th>
              {showCompany ? (
                <th className={TABLE_HEAD_CELL_CLASS}>{t('columns.company')}</th>
              ) : null}
              <th className={TABLE_HEAD_CELL_CLASS}>{t('columns.project')}</th>
              <th className={TABLE_HEAD_CELL_CLASS}>{t('columns.price')}</th>
              <th className={TABLE_HEAD_CELL_CLASS}>{t('columns.status')}</th>
              <th className={TABLE_HEAD_CELL_CLASS}>{t('columns.sales')}</th>
            </tr>
          </thead>
          <tbody>
            {apartments.map((apartment) => {
              const salesStatus = apartment.salesStatus as ApartmentSalesStatus;

              return (
                <tr
                  key={apartment.id}
                  tabIndex={0}
                  className={TABLE_ROW_CLASS}
                  onClick={() => {
                    openApartment(apartment);
                  }}
                  onKeyDown={(event) => {
                    onRowKeyDown(event, apartment);
                  }}
                >
                  <td className={cn(TABLE_BODY_CELL_CLASS, 'font-medium text-brand')}>
                    {t('unit', { number: apartment.number })}
                  </td>
                  <td className={cn(TABLE_BODY_CELL_CLASS, 'text-ink-secondary')}>
                    {apartment.buildingName}
                  </td>
                  <td className={cn(TABLE_BODY_CELL_CLASS, 'text-ink-secondary')}>
                    {t('floorNumber', { number: apartment.floorNumber })}
                  </td>
                  {showCompany ? (
                    <td className={cn(TABLE_BODY_CELL_CLASS, 'text-ink-secondary')}>
                      {apartment.companyName}
                    </td>
                  ) : null}
                  <td className={cn(TABLE_BODY_CELL_CLASS, 'text-ink-secondary')}>
                    {apartment.projectName}
                  </td>
                  <td className={cn(TABLE_BODY_CELL_CLASS, 'font-medium tabular-nums text-ink')}>
                    <AdminApartmentPriceText apartment={apartment} />
                  </td>
                  <td className={TABLE_BODY_CELL_CLASS}>
                    <PublicationStatusBadge
                      status={apartment.publicationStatus}
                      className={LIST_STATUS_BADGE_COMPACT_CLASS}
                    />
                  </td>
                  <td className={TABLE_BODY_CELL_CLASS}>
                    <ApartmentSalesStatusBadge
                      status={salesStatus}
                      label={t(`sales.${salesStatus}`)}
                      className={LIST_STATUS_BADGE_COMPACT_CLASS}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ListTableReveal>
  );
};
