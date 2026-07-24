'use client';

import type { AdminApartmentListItem, ApartmentSalesStatus } from '@toonexpo/contracts';
import { Building, Building2, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  ADMIN_INVENTORY_CARD_CLASS,
  AdminInventoryCardMetaRow,
  AdminInventoryPublicationBadge,
} from '@/features/admin/components/admin-inventory-card';
import { catalogApartmentDetailHref } from '@/features/builder/catalog-scope';
import { Link } from '@/i18n/navigation';
import { ApartmentSalesStatusBadge } from '@/shared/ui/apartment-sales-status-badge';

type AdminApartmentCardProps = {
  apartment: AdminApartmentListItem;
  returnTo: string;
};

/**
 * Apartment hub card — same layout language as admin project cards.
 */
export const AdminApartmentCard = ({ apartment, returnTo }: AdminApartmentCardProps) => {
  const t = useTranslations('Admin.apartments');
  const salesStatus = apartment.salesStatus as ApartmentSalesStatus;

  return (
    <Link
      href={catalogApartmentDetailHref(
        { mode: 'admin', companyId: apartment.builderCompanyId },
        apartment.id,
        { returnTo },
      )}
      className={ADMIN_INVENTORY_CARD_CLASS}
    >
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="min-w-0 flex-1 text-base font-semibold tracking-tight text-ink">
            {t('unit', { number: apartment.number })}
          </h2>
          <AdminInventoryPublicationBadge status={apartment.publicationStatus} />
        </div>

        <div className="mt-2 flex flex-col gap-1 text-sm text-ink-secondary">
          <AdminInventoryCardMetaRow icon={<Building className="size-3.5" strokeWidth={2} />}>
            {apartment.buildingName} · {t('floorNumber', { number: apartment.floorNumber })}
          </AdminInventoryCardMetaRow>
          <AdminInventoryCardMetaRow icon={<Building2 className="size-3.5" strokeWidth={2} />}>
            {apartment.companyName}
          </AdminInventoryCardMetaRow>
          <AdminInventoryCardMetaRow icon={<Layers className="size-3.5" strokeWidth={2} />}>
            {apartment.projectName}
          </AdminInventoryCardMetaRow>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3">
        <ApartmentSalesStatusBadge status={salesStatus} label={t(`sales.${salesStatus}`)} />
      </div>
    </Link>
  );
};
