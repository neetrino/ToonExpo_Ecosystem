import type { ReactNode } from 'react';
import type { ApartmentDetail } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import { ApartmentDetailPrice } from '@/features/catalog/components/apartment-price-label';
import { ApartmentInquireCard } from '@/features/catalog/components/apartment-inquire-card';
import { ApartmentMortgageEstimate } from '@/features/catalog/components/apartment-mortgage-estimate';
import { ApartmentNeighborhood } from '@/features/catalog/components/apartment-neighborhood';
import { ApartmentPhotoGallery } from '@/features/catalog/components/apartment-photo-gallery';
import { ApartmentPriceHistory } from '@/features/catalog/components/apartment-price-history';
import { ApartmentPricePerArea } from '@/features/catalog/components/apartment-price-per-area';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type ApartmentDetailViewProps = {
  apartment: ApartmentDetail;
  locationLine: string | null;
  galleryImages: Array<{ src: string; alt: string }>;
  /** Project completion year when known (Figma “Year built”). */
  yearBuilt: string | null;
  projectType: string | null;
};

/**
 * Public apartment detail — Figma frame `89:646` content + gallery/inquire chrome.
 */
export const ApartmentDetailView = async ({
  apartment,
  locationLine,
  galleryImages,
  yearBuilt,
  projectType,
}: ApartmentDetailViewProps) => {
  const t = await getTranslations('Catalog');
  const title = t('apartment.unit', { number: apartment.number });
  const typeLabel = projectType?.trim()
    ? projectType
    : apartment.rooms != null
      ? t('apartment.rooms', { count: apartment.rooms })
      : t('apartment.typeFallback');

  const detailRows: Array<{ label: string; value: string }> = [
    { label: t('apartment.yearBuiltLabel'), value: yearBuilt ?? '—' },
    { label: t('apartment.typeLabel'), value: typeLabel },
    {
      label: t('apartment.statusLabel'),
      value: t(`status.${apartment.salesStatus}`),
    },
    {
      label: t('apartment.bedsLabel'),
      value: apartment.bedrooms != null ? String(apartment.bedrooms) : '—',
    },
    {
      label: t('apartment.bathsLabel'),
      value: apartment.bathrooms != null ? String(apartment.bathrooms) : '—',
    },
    {
      label: t('apartment.livingAreaLabel'),
      value: apartment.areaTotal != null ? t('apartment.area', { area: apartment.areaTotal }) : '—',
    },
    { label: t('apartment.developerLabel'), value: apartment.builder.name || '—' },
    { label: t('apartment.verifiedLabel'), value: t('apartment.verifiedYes') },
    { label: t('apartment.unitIdLabel'), value: apartment.number },
  ];

  const neighborhoodStats = [
    { label: t('apartment.neighborhood.walkScore'), value: '—' },
    { label: t('apartment.neighborhood.transit'), value: '—' },
    { label: t('apartment.neighborhood.schools'), value: '—' },
    { label: t('apartment.neighborhood.crime'), value: '—' },
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

          <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-4 border-y border-header-border py-6">
            <StatBlock label={t('apartment.priceLabel')}>
              <ApartmentDetailPrice
                apartmentId={apartment.id}
                amount={apartment.price}
                currency={apartment.priceCurrency}
                priceVisibility={apartment.priceVisibility}
                className="text-[1.875rem] leading-[1.25]"
              />
            </StatBlock>
            <StatBlock label={t('apartment.bedsLabel')}>
              <p className="font-brand text-2xl font-bold text-ink-navy">
                {apartment.bedrooms ?? '—'}
              </p>
            </StatBlock>
            <StatBlock label={t('apartment.bathsLabel')}>
              <p className="font-brand text-2xl font-bold text-ink-navy">
                {apartment.bathrooms ?? '—'}
              </p>
            </StatBlock>
            <StatBlock label={t('apartment.areaLabel')}>
              <p className="font-brand text-2xl font-bold text-ink-navy">
                {apartment.areaTotal != null
                  ? t('apartment.area', { area: apartment.areaTotal })
                  : '—'}
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
            <h2 className="font-brand text-2xl font-bold tracking-tight text-ink-navy">
              {t('apartment.aboutTitle')}
            </h2>
            <p className="mt-5 text-base leading-[1.625] text-ink-navy/80">
              {apartment.description?.trim() ? apartment.description : t('apartment.aboutEmpty')}
            </p>
          </section>

          <section className="py-10">
            <h2 className="font-brand text-2xl font-bold tracking-tight text-ink-navy">
              {t('apartment.detailsTitle')}
            </h2>
            <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3">
              {detailRows.map((row) => (
                <div key={row.label} className="border-b border-header-border pb-2">
                  <dt className="text-[10px] font-bold tracking-widest text-header-muted uppercase">
                    {row.label}
                  </dt>
                  <dd className="mt-[7px] text-sm font-medium text-ink-navy">{row.value}</dd>
                </div>
              ))}
            </dl>
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
  <div className="min-w-[4.5rem]">
    <p className="text-[10px] font-bold tracking-widest text-header-muted uppercase">{label}</p>
    <div className="mt-1">{children}</div>
  </div>
);
