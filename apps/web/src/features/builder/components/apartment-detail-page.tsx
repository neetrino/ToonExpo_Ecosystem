'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { catalogProjectDetailHref, isSafeAppReturnPath } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { ApartmentPublicationActions } from '@/features/builder/components/apartment-publication-actions';
import { EditApartmentCoverForm } from '@/features/builder/components/edit-apartment-cover-form';
import { EditApartmentForm } from '@/features/builder/components/edit-apartment-form';
import { usePortalApartmentQuery } from '@/features/builder/hooks/use-portal-inventory';
import { ApartmentSalesStatusBadge } from '@/shared/ui/apartment-sales-status-badge';
import { BackLink } from '@/shared/ui/back-link';
import { Card } from '@/shared/ui/card';
import { ImageLightbox } from '@/shared/ui/image-lightbox';

type ApartmentDetailPageProps = {
  apartmentId: string;
};

/**
 * Apartment edit page. Cover card image first, then plan and details.
 */
export const ApartmentDetailPage = ({ apartmentId }: ApartmentDetailPageProps) => {
  const scope = useCatalogScope();
  const t = useTranslations('Builder.apartments');
  const searchParams = useSearchParams();
  const query = usePortalApartmentQuery(apartmentId);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('notFound')}
      </p>
    );
  }

  const apartment = query.data;
  const returnToRaw = searchParams.get('returnTo')?.trim() ?? '';
  const returnTo = isSafeAppReturnPath(returnToRaw) ? returnToRaw : null;
  const backHref =
    returnTo ??
    (scope.mode === 'admin'
      ? '/admin/projects/apartments'
      : catalogProjectDetailHref(scope, apartment.projectId));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <BackLink href={backHref} label={t('back')} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-page-title text-ink">{t('title', { number: apartment.number })}</h1>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-secondary">
              <span>{apartment.companyName}</span>
              <span aria-hidden="true">·</span>
              <span>{apartment.buildingName}</span>
              <span aria-hidden="true">·</span>
              <span>
                {apartment.floorLabel
                  ? t('meta.floorNamed', {
                      number: apartment.floorNumber,
                      name: apartment.floorLabel,
                    })
                  : t('meta.floorNumber', { number: apartment.floorNumber })}
              </span>
              <span aria-hidden="true">·</span>
              <ApartmentSalesStatusBadge
                status={apartment.salesStatus}
                label={t(`salesStatus.${apartment.salesStatus}`)}
              />
            </p>
          </div>
          <ApartmentPublicationActions apartment={apartment} />
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-border bg-surface-elevated">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">{t('coverTitle')}</h2>
          <p className="mt-0.5 text-xs text-ink-secondary">{t('coverHint')}</p>
        </div>
        <div className="p-4">
          <EditApartmentCoverForm apartment={apartment} />
        </div>
      </section>

      {apartment.plan ? (
        <section className="overflow-hidden rounded-lg border border-border bg-surface-elevated">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-ink">{t('planTitle')}</h2>
          </div>
          <div className="p-4">
            <button
              type="button"
              className="block w-full cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              aria-label={t('planViewHint')}
              onClick={() => {
                setLightboxOpen(true);
              }}
            >
              <img
                src={apartment.plan.fileUrl}
                alt={apartment.plan.altText ?? t('planAlt')}
                className="mx-auto max-h-80 w-full object-contain"
              />
            </button>
          </div>
        </section>
      ) : null}

      <Card>
        <EditApartmentForm apartment={apartment} />
      </Card>

      {apartment.plan ? (
        <ImageLightbox
          open={lightboxOpen}
          imageUrl={apartment.plan.fileUrl}
          alt={apartment.plan.altText ?? t('planAlt')}
          onClose={() => {
            setLightboxOpen(false);
          }}
        />
      ) : null}
    </div>
  );
};
