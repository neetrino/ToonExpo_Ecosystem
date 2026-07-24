import type { ReactNode } from 'react';
import type { ApartmentDetail } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import { ApartmentDetailCriteriaPanel } from '@/features/catalog/components/apartment-detail-criteria-panel';
import { ApartmentDetailPrice } from '@/features/catalog/components/apartment-price-label';
import { ApartmentInquireCard } from '@/features/catalog/components/apartment-inquire-card';
import { ApartmentMortgageEstimate } from '@/features/catalog/components/apartment-mortgage-estimate';
import { ApartmentNeighborhood } from '@/features/catalog/components/apartment-neighborhood';
import { ApartmentPhotoGallery } from '@/features/catalog/components/apartment-photo-gallery';
import { ApartmentPriceHistory } from '@/features/catalog/components/apartment-price-history';
import { ApartmentPricePerArea } from '@/features/catalog/components/apartment-price-per-area';
import { buildApartmentDetailRows } from '@/features/catalog/utils/build-apartment-detail-rows';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type ApartmentDetailViewProps = {
  apartment: ApartmentDetail;
  locationLine: string | null;
  galleryImages: Array<{ src: string; alt: string }>;
  projectType: string | null;
  /** Geographic district when set on the project. */
  district: string | null;
};

const EMPTY_VALUE = '—';

/**
 * Public apartment detail — Figma frame `89:646` content + gallery/inquire chrome.
 */
export const ApartmentDetailView = async ({
  apartment,
  locationLine,
  galleryImages,
  projectType,
  district,
}: ApartmentDetailViewProps) => {
  const t = await getTranslations('Catalog');
  const title = t('apartment.unit', { number: apartment.number });
  const typeLabel = projectType?.trim()
    ? projectType
    : apartment.rooms != null
      ? t('apartment.rooms', { count: apartment.rooms })
      : t('apartment.typeFallback');

  const detailRows = buildApartmentDetailRows({
    apartment,
    district,
    formatCeilingHeight: (height) => t('apartment.criteria.ceilingHeightValue', { height }),
    formatStatus: (status) => t(`status.${status}`),
    labels: {
      neighborhood: t('apartment.criteria.neighborhood'),
      building: t('apartment.criteria.building'),
      floor: t('apartment.criteria.floor'),
      unitNumber: t('apartment.criteria.unitNumber'),
      status: t('apartment.criteria.status'),
      windows: t('apartment.criteria.windows'),
      handoverDescription: t('apartment.criteria.handoverDescription'),
      balconies: t('apartment.criteria.balconies'),
      generalDescription: t('apartment.criteria.generalDescription'),
      ceilingHeight: t('apartment.criteria.ceilingHeight'),
      finishingStatus: t('apartment.criteria.finishingStatus'),
    },
  });

  const neighborhoodStats = [
    { label: t('apartment.neighborhood.walkScore'), value: EMPTY_VALUE },
    { label: t('apartment.neighborhood.transit'), value: EMPTY_VALUE },
    { label: t('apartment.neighborhood.schools'), value: EMPTY_VALUE },
    { label: t('apartment.neighborhood.crime'), value: EMPTY_VALUE },
  ];

  const priceHistoryRows = [
    {
      eventKey: 'listed' as const,
      dateIso: null,
      amount: apartment.price,
      currency: apartment.priceCurrency,
    },
  ];

  return (
    <div className="page-container pb-16 pt-8">
      <nav className="mb-6 text-xs text-header-muted" aria-label={t('apartment.breadcrumb')}>
        <Link href="/" className="transition-colors hover:text-ink-navy">
          {t('apartment.breadcrumbHome')}
        </Link>
        <span className="mx-1.5">/</span>
        <Link href="/projects" className="transition-colors hover:text-ink-navy">
          {t('apartment.breadcrumbSearch')}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-navy">{title}</span>
      </nav>

      <ApartmentPhotoGallery images={galleryImages} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start xl:gap-14">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-[10px] bg-band-mist px-2 py-1',
                'text-[10px] font-bold tracking-widest text-brand-deep uppercase',
              )}
            >
              {t('apartment.verifiedBadge')}
            </span>
            <span
              className={cn(
                'rounded-[10px] bg-surface px-2 py-1',
                'text-[10px] font-bold tracking-widest text-header-muted uppercase',
              )}
            >
              {typeLabel}
            </span>
          </div>

          <h1 className="mt-3 font-brand text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.15] tracking-tight text-ink-navy">
            {apartment.project.name}
          </h1>
          <p className="mt-2 text-lg leading-[1.2] text-header-muted">
            {locationLine ?? `${apartment.building.name} · ${title}`}
          </p>

          <div className="mt-8 flex flex-wrap items-start justify-between gap-y-4 border-y border-header-border py-6">
            <StatBlock label={t('apartment.priceLabel')}>
              <ApartmentDetailPrice
                apartmentId={apartment.id}
                amount={apartment.price}
                currency={apartment.priceCurrency}
                priceVisibility={apartment.priceVisibility}
                className="whitespace-nowrap text-[1.875rem] leading-[1.25]"
              />
            </StatBlock>
            <StatBlock label={t('apartment.bedsLabel')}>
              <p className="font-brand text-2xl font-bold text-ink-navy">
                {apartment.bedrooms ?? EMPTY_VALUE}
              </p>
            </StatBlock>
            <StatBlock label={t('apartment.bathsLabel')}>
              <p className="font-brand text-2xl font-bold text-ink-navy">
                {apartment.bathrooms ?? EMPTY_VALUE}
              </p>
            </StatBlock>
            <StatBlock label={t('apartment.areaLabel')}>
              <p className="font-brand text-2xl font-bold text-ink-navy">
                {apartment.areaTotal != null
                  ? t('apartment.area', { area: apartment.areaTotal })
                  : EMPTY_VALUE}
              </p>
            </StatBlock>
            <StatBlock label={t('apartment.pricePerAreaLabel')}>
              <ApartmentPricePerArea
                apartmentId={apartment.id}
                amount={apartment.price}
                currency={apartment.priceCurrency}
                priceVisibility={apartment.priceVisibility}
                areaTotal={apartment.areaTotal}
              />
            </StatBlock>
          </div>

          <section className="py-10">
            <ApartmentDetailCriteriaPanel title={t('apartment.detailsTitle')} rows={detailRows} />
          </section>

          <ApartmentNeighborhood
            title={t('apartment.neighborhoodTitle')}
            stats={neighborhoodStats}
          />

          <ApartmentPriceHistory
            apartmentId={apartment.id}
            priceVisibility={apartment.priceVisibility}
            rows={priceHistoryRows}
          />

          <div className="pb-6">
            <Link
              href={`/projects/${apartment.project.id}`}
              className="text-sm font-semibold text-brand-deep hover:underline"
            >
              {t('actions.viewProject')}
            </Link>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24">
          <ApartmentInquireCard
            apartmentId={apartment.id}
            projectId={apartment.project.id}
            projectName={apartment.project.name}
            builderName={apartment.builder.name}
            builderLogoUrl={apartment.builder.logoUrl}
          />
          <ApartmentMortgageEstimate
            apartmentId={apartment.id}
            amount={apartment.price}
            priceVisibility={apartment.priceVisibility}
          />
        </div>
      </div>
    </div>
  );
};

const StatBlock = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex shrink-0 flex-col items-center text-center">
    <p className="text-[10px] font-bold tracking-widest text-header-muted uppercase">{label}</p>
    <div className="mt-1">{children}</div>
  </div>
);
