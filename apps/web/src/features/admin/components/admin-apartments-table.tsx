'use client';

import type { AdminApartmentListItem, ApartmentSalesStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { AdminApartmentCard } from '@/features/admin/components/admin-apartment-card';
import { catalogApartmentDetailHref } from '@/features/builder/catalog-scope';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { Link } from '@/i18n/navigation';
import { ApartmentSalesStatusBadge } from '@/shared/ui/apartment-sales-status-badge';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type AdminApartmentsTableProps = {
  apartments: AdminApartmentListItem[];
  returnTo: string;
  viewMode?: ViewMode | undefined;
};

/**
 * Admin apartments collection as cards or table.
 */
export const AdminApartmentsTable = ({
  apartments,
  returnTo,
  viewMode = VIEW_MODE_CARDS,
}: AdminApartmentsTableProps) => {
  const t = useTranslations('Admin.apartments');

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {apartments.map((apartment) => (
          <AdminApartmentCard key={apartment.id} apartment={apartment} returnTo={returnTo} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full min-w-[56rem] border-collapse text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.unit')}</th>
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.building')}</th>
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.floor')}</th>
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.company')}</th>
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.project')}</th>
            <th className="px-3 py-2.5 text-center font-medium">{t('columns.status')}</th>
            <th className="px-3 py-2.5 text-center font-medium">{t('columns.sales')}</th>
          </tr>
        </thead>
        <tbody>
          {apartments.map((apartment) => {
            const salesStatus = apartment.salesStatus as ApartmentSalesStatus;

            return (
              <tr key={apartment.id} className="border-t border-border hover:bg-surface/60">
                <td className="px-3 py-2.5 align-middle">
                  <Link
                    href={catalogApartmentDetailHref(
                      { mode: 'admin', companyId: apartment.builderCompanyId },
                      apartment.id,
                      { returnTo },
                    )}
                    className="font-medium text-brand hover:underline"
                  >
                    {t('unit', { number: apartment.number })}
                  </Link>
                </td>
                <td className="px-3 py-2.5 align-middle text-ink-secondary">
                  {apartment.buildingName}
                </td>
                <td className="px-3 py-2.5 align-middle text-ink-secondary">
                  {t('floorNumber', { number: apartment.floorNumber })}
                </td>
                <td className="px-3 py-2.5 align-middle text-ink-secondary">
                  {apartment.companyName}
                </td>
                <td className="px-3 py-2.5 align-middle text-ink-secondary">
                  {apartment.projectName}
                </td>
                <td className="px-3 py-2.5 text-center align-middle">
                  <PublicationStatusBadge
                    status={apartment.publicationStatus}
                    className={LIST_STATUS_BADGE_COMPACT_CLASS}
                  />
                </td>
                <td className="px-3 py-2.5 text-center align-middle">
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
  );
};
