'use client';

import type { AdminApartmentListItem, ApartmentSalesStatus } from '@toonexpo/contracts';
import { Building, Building2, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AdminFeaturedOnHomeButton } from '@/features/admin/components/admin-featured-on-home-button';
import {
  ADMIN_INVENTORY_CARD_CLASS,
  AdminInventoryCardMetaRow,
  AdminInventoryPublicationBadge,
} from '@/features/admin/components/admin-inventory-card';
import { useSetAdminApartmentFeaturedOnHomeMutation } from '@/features/admin/hooks/use-admin-inventory';
import { catalogApartmentDetailHref } from '@/features/builder/catalog-scope';
import { HOME_FEATURED_APARTMENT_LIMIT } from '@/features/catalog/constants/home-featured';
import { Link } from '@/i18n/navigation';
import { ApartmentSalesStatusBadge } from '@/shared/ui/apartment-sales-status-badge';
import { cn } from '@/shared/ui/cn';

type AdminApartmentCardProps = {
  apartment: AdminApartmentListItem;
  returnTo: string;
};

/**
 * Apartment hub card — same layout language as admin project cards.
 */
export const AdminApartmentCard = ({ apartment, returnTo }: AdminApartmentCardProps) => {
  const t = useTranslations('Admin.apartments');
  const tFeatured = useTranslations('Admin.featuredOnHome');
  const salesStatus = apartment.salesStatus as ApartmentSalesStatus;
  const featuredMutation = useSetAdminApartmentFeaturedOnHomeMutation();
  const detailHref = catalogApartmentDetailHref(
    { mode: 'admin', companyId: apartment.builderCompanyId },
    apartment.id,
    { returnTo },
  );

  return (
    <article className={cn(ADMIN_INVENTORY_CARD_CLASS, 'relative')}>
      <Link
        href={detailHref}
        className="flex flex-1 flex-col p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
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
      </Link>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3">
        <ApartmentSalesStatusBadge status={salesStatus} label={t(`sales.${salesStatus}`)} />
        <div className="ml-auto">
          <AdminFeaturedOnHomeButton
            featuredOnHome={apartment.featuredOnHome}
            limitLabel={tFeatured('apartmentLimit', { count: HOME_FEATURED_APARTMENT_LIMIT })}
            onToggle={async (next) =>
              featuredMutation.mutateAsync({
                apartmentId: apartment.id,
                featuredOnHome: next,
              })
            }
          />
        </div>
      </div>
    </article>
  );
};
