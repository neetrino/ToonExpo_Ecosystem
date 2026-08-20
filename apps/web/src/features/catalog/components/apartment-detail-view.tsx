import type { ReactNode } from 'react';
import type { ApartmentDetail } from '@toonexpo/contracts';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';

import { ApartmentAboutSection } from '@/features/catalog/components/apartment-about-section';
import { ApartmentDetailCriteriaPanel } from '@/features/catalog/components/apartment-detail-criteria-panel';
import { ApartmentDetailPrice } from '@/features/catalog/components/apartment-price-label';
import { ApartmentInquireCard } from '@/features/catalog/components/apartment-inquire-card';
import { ApartmentMortgageEstimate } from '@/features/catalog/components/apartment-mortgage-estimate';
import { ApartmentNeighborhood } from '@/features/catalog/components/apartment-neighborhood';
import { ApartmentPhotoGallery } from '@/features/catalog/components/apartment-photo-gallery';
import { ApartmentPriceHistory } from '@/features/catalog/components/apartment-price-history';
import { ApartmentPricePerArea } from '@/features/catalog/components/apartment-price-per-area';
import { ApartmentTourSections } from '@/features/catalog/components/apartment-tour-sections';
import { CatalogEntityQr } from '@/features/catalog/components/catalog-entity-qr';
import { buildApartmentCatalogQrUrl } from '@/features/catalog/utils/build-catalog-entity-qr-url';
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
  /** Project catalog handover text (fallback when apartment has none). */
  projectHandoverDescription: string | null;
};

const EMPTY_VALUE = '—';

/**
 * Public apartment detail — Lovable about block + existing property-details cards.
 */
export const ApartmentDetailView = async ({
  apartment,
  locationLine,
  galleryImages,
  projectType,
  district,
  projectHandoverDescription,
}: ApartmentDetailViewProps) => {
  const t = await getTranslations('Catalog');
  const locale = await getLocale();
  const title = t('apartment.unit', { number: apartment.number });
  const apartmentQrUrl = buildApartmentCatalogQrUrl(locale, apartment.id);
  const typeLabel = projectType?.trim()
    ? projectType
    : apartment.rooms != null
      ? t('apartment.rooms', { count: apartment.rooms })
      : t('apartment.typeFallback');

  const detailRows = buildApartmentDetailRows({
    apartment,
    district,
    projectHandoverDescription,
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
  }).filter((row) => row.id !== 'generalDescription');

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

          <div className="mt-3 flex items-center justify-between gap-3 lg:hidden">
            <div className="flex min-w-0 items-center gap-3">
              {apartment.builder.logoUrl ? (
                <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-brand-deep">
                  <Image
                    src={apartment.builder.logoUrl}
                    alt={apartment.builder.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </span>
              ) : (
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-deep font-brand text-lg font-bold text-on-dark">
                  {apartment.builder.name.trim().slice(0, 2).toUpperCase() || '—'}
                </span>
              )}
              <p className="truncate text-[11px] font-bold tracking-[0.2em] text-brand-secondary uppercase">
                {apartment.builder.name}
              </p>
            </div>
            <CatalogEntityQr
              payloadUrl={apartmentQrUrl}
              codeLabel={t('apartment.qrTitle', {
                name: apartment.project.name,
                number: apartment.number,
              })}
              entityName={apartment.project.name}
            />
          </div>

          <div className="mt-3 flex items-start gap-3">
            <h1 className="min-w-0 flex-1 font-brand text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.15] tracking-tight text-ink-navy">
              {apartment.project.name}
            </h1>
            <CatalogEntityQr
              className="mt-1 hidden lg:inline-flex"
              payloadUrl={apartmentQrUrl}
              codeLabel={t('apartment.qrTitle', {
                name: apartment.project.name,
                number: apartment.number,
              })}
              entityName={apartment.project.name}
            />
          </div>
          <p className="mt-2 text-lg leading-[1.2] text-header-muted">
            {locationLine ?? `${apartment.building.name} · ${title}`}
          </p>

          <div
            className={cn(
              'mx-auto mt-8 w-full max-w-md border-y border-header-border py-6',
              'md:mx-0 md:flex md:max-w-none md:flex-wrap md:items-start md:justify-between md:gap-y-4',
            )}
          >
            <div className="grid w-full grid-cols-6 gap-x-3 gap-y-5 md:contents">
              <StatBlock
                label={t('apartment.priceLabel')}
                className="col-span-3 min-w-0 items-center text-center md:shrink"
              >
                <ApartmentDetailPrice
                  apartmentId={apartment.id}
                  amount={apartment.price}
                  currency={apartment.priceCurrency}
                  priceVisibility={apartment.priceVisibility}
                  projectId={apartment.project.id}
                  priceOnRequest={apartment.priceOnRequest}
                  className={cn(
                    'text-[clamp(1.25rem,4.5vw,1.875rem)] leading-[1.25]',
                    'break-words md:whitespace-nowrap',
                  )}
                />
              </StatBlock>
              <StatBlock
                label={t('apartment.pricePerAreaLabel')}
                className="col-span-3 min-w-0 items-center text-center md:order-5 md:shrink-0"
              >
                <ApartmentPricePerArea
                  apartmentId={apartment.id}
                  amount={apartment.price}
                  currency={apartment.priceCurrency}
                  priceVisibility={apartment.priceVisibility}
                  areaTotal={apartment.areaTotal}
                  className="text-[clamp(1.125rem,4vw,1.5rem)] md:text-2xl"
                />
              </StatBlock>
              <StatBlock
                label={t('apartment.bedsLabel')}
                className="col-span-2 min-w-0 -translate-x-[15px] items-center text-center md:order-2 md:translate-x-0"
              >
                <p className="font-brand text-2xl font-bold text-ink-navy">
                  {apartment.bedrooms ?? EMPTY_VALUE}
                </p>
              </StatBlock>
              <StatBlock
                label={t('apartment.bathsLabel')}
                className="col-span-2 min-w-0 -translate-x-[15px] items-center text-center md:order-3 md:translate-x-0"
              >
                <p className="font-brand text-2xl font-bold text-ink-navy">
                  {apartment.bathrooms ?? EMPTY_VALUE}
                </p>
              </StatBlock>
              <StatBlock
                label={t('apartment.areaLabel')}
                className="col-span-2 min-w-0 -translate-x-[15px] items-center text-center md:order-4 md:translate-x-0"
              >
                <p className="font-brand text-2xl font-bold text-ink-navy">
                  {apartment.areaTotal != null
                    ? t('apartment.area', { area: apartment.areaTotal })
                    : EMPTY_VALUE}
                </p>
              </StatBlock>
            </div>
          </div>

          <ApartmentAboutSection
            title={t('apartment.aboutTitle')}
            description={apartment.description}
            emptyLabel={t('apartment.aboutEmpty')}
          />

          <section className="py-10">
            <ApartmentDetailCriteriaPanel title={t('apartment.detailsTitle')} rows={detailRows} />
          </section>

          <ApartmentTourSections
            matterportUrl={apartment.matterportUrl}
            external3dUrl={apartment.external3dUrl}
            matterportTitle={t('apartment.matterportTour')}
            external3dTitle={t('apartment.external3dTour')}
          />

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

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
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
        </aside>
      </div>
    </div>
  );
};

const StatBlock = ({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string | undefined;
}) => (
  <div className={cn('flex shrink-0 flex-col items-center text-center', className)}>
    <p className="text-[10px] font-bold tracking-widest text-header-muted uppercase">{label}</p>
    <div className="mt-1 min-w-0">{children}</div>
  </div>
);
