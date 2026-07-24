'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { catalogProjectDetailHref, isSafeAppReturnPath } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { EditApartmentForm } from '@/features/builder/components/edit-apartment-form';
import { usePortalApartmentQuery } from '@/features/builder/hooks/use-portal-inventory';
import { Link } from '@/i18n/navigation';
import { Card } from '@/shared/ui/card';
import { ImageLightbox } from '@/shared/ui/image-lightbox';

type ApartmentDetailPageProps = {
  apartmentId: string;
};

/**
 * Apartment edit page. Shows plan image first when present.
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
      <div className="flex flex-col gap-1">
        <Link href={backHref} className="text-sm text-ink-secondary hover:text-ink">
          {t('back')}
        </Link>
        <h1 className="text-page-title text-ink">{t('title', { number: apartment.number })}</h1>
        <p className="text-sm text-ink-secondary">
          {t(`salesStatus.${apartment.salesStatus}`)} ·{' '}
          {t(`publication.${apartment.publicationStatus}`)}
        </p>
      </div>

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
