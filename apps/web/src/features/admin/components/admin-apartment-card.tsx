'use client';

import type { AdminApartmentListItem, ApartmentSalesStatus } from '@toonexpo/contracts';
import { Building, Building2, Home, Layers } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AdminFeaturedOnHomeButton } from '@/features/admin/components/admin-featured-on-home-button';
import {
  AdminInventoryCardMetaRow,
  AdminInventoryPublicationBadge,
} from '@/features/admin/components/admin-inventory-card';
import { useSetAdminApartmentFeaturedOnHomeMutation } from '@/features/admin/hooks/use-admin-inventory';
import type { CatalogScope } from '@/features/builder/catalog-scope';
import { catalogApartmentDetailHref } from '@/features/builder/catalog-scope';
import { HOME_FEATURED_APARTMENT_LIMIT } from '@/features/catalog/constants/home-featured';
import { Link } from '@/i18n/navigation';
import { ApartmentSalesStatusBadge } from '@/shared/ui/apartment-sales-status-badge';
import { cn } from '@/shared/ui/cn';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';

/** Same chrome as builder readiness / admin company cards. */
const CARD_RADIUS_CLASS = 'rounded-[15px]';
const MEDIA_RADIUS_CLASS = 'rounded-[14px]';
const MEDIA_ASPECT_CLASS = 'aspect-[16/10]';

type AdminApartmentCardProps = {
  apartment: AdminApartmentListItem;
  returnTo: string;
  showCompany?: boolean | undefined;
  showFeatured?: boolean | undefined;
  catalogScope?: CatalogScope | undefined;
};

const toSafeImageSource = (value: string | null | undefined): string | undefined => {
  const source = value?.trim();
  if (!source) {
    return undefined;
  }
  if (source.startsWith('/')) {
    return source;
  }

  try {
    const url = new URL(source);
    return url.protocol === 'https:' || url.protocol === 'http:' ? source : undefined;
  } catch {
    return undefined;
  }
};

type AdminApartmentImageProps = {
  apartment: AdminApartmentListItem;
};

const AdminApartmentImage = ({ apartment }: AdminApartmentImageProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const cover = apartment.cover;
  const imageSource =
    toSafeImageSource(cover?.thumbnailUrl) ?? toSafeImageSource(cover?.fileUrl);
  const validImageSource = imageFailed ? undefined : imageSource;
  const alt =
    cover?.altText?.trim() || `${apartment.projectName} — ${apartment.number}`;

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-surface ring-1 ring-border/60',
        MEDIA_ASPECT_CLASS,
        MEDIA_RADIUS_CLASS,
      )}
    >
      {validImageSource && cover ? (
        <Image
          src={validImageSource}
          alt={alt}
          fill
          className={cn(
            'object-cover transition-transform duration-[var(--duration-slow)]',
            'ease-[var(--ease-out-premium)] group-hover:scale-[1.04]',
            'motion-reduce:transition-none motion-reduce:group-hover:scale-100',
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          onError={() => {
            setImageFailed(true);
          }}
        />
      ) : (
        <span className="flex size-full flex-col items-center justify-center gap-1.5 text-ink-muted">
          <Home className="size-8 opacity-40" aria-hidden />
          <span className="max-w-[80%] truncate text-xs">{apartment.number}</span>
        </span>
      )}
    </div>
  );
};

/**
 * Apartment hub card — same size/chrome as builder readiness cards.
 */
export const AdminApartmentCard = ({
  apartment,
  returnTo,
  showCompany = true,
  showFeatured = true,
  catalogScope,
}: AdminApartmentCardProps) => {
  const t = useTranslations('Admin.apartments');
  const tFeatured = useTranslations('Admin.featuredOnHome');
  const salesStatus = apartment.salesStatus as ApartmentSalesStatus;
  const featuredMutation = useSetAdminApartmentFeaturedOnHomeMutation();
  const detailHref = catalogApartmentDetailHref(
    catalogScope ?? { mode: 'admin', companyId: apartment.builderCompanyId },
    apartment.id,
    { returnTo },
  );

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col gap-3 overflow-hidden border border-border/80',
        'bg-surface-elevated p-3.5 shadow-card',
        LIST_CARD_LIFT_CLASS,
        CARD_RADIUS_CLASS,
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <Link
          href={detailHref}
          className={cn(
            'min-w-0 flex-1 truncate text-base font-semibold tracking-tight text-ink',
            'transition-colors duration-[var(--duration-fast)] group-hover:text-brand-deep',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
          )}
        >
          {t('unit', { number: apartment.number })}
        </Link>
        <AdminInventoryPublicationBadge status={apartment.publicationStatus} />
      </header>

      <Link
        href={detailHref}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        <AdminApartmentImage key={apartment.cover?.id ?? 'fallback'} apartment={apartment} />
      </Link>

      <Link
        href={detailHref}
        className="flex flex-col gap-1 text-sm text-ink-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        <AdminInventoryCardMetaRow icon={<Building className="size-3.5" strokeWidth={2} />}>
          {apartment.buildingName} · {t('floorNumber', { number: apartment.floorNumber })}
        </AdminInventoryCardMetaRow>
        {showCompany ? (
          <AdminInventoryCardMetaRow icon={<Building2 className="size-3.5" strokeWidth={2} />}>
            {apartment.companyName}
          </AdminInventoryCardMetaRow>
        ) : null}
        <AdminInventoryCardMetaRow icon={<Layers className="size-3.5" strokeWidth={2} />}>
          {apartment.projectName}
        </AdminInventoryCardMetaRow>
      </Link>

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-3">
        <ApartmentSalesStatusBadge status={salesStatus} label={t(`sales.${salesStatus}`)} />
        {showFeatured ? (
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
        ) : null}
      </div>
    </article>
  );
};
