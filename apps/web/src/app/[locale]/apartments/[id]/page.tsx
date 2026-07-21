import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { getApartment } from '@/features/catalog/api/catalog-api';
import { ApartmentDetailFavorite } from '@/features/buyer/components/apartment-detail-favorite';
import { ApartmentDetailPrice } from '@/features/catalog/components/apartment-price-label';
import { ProjectPricesOverlayScope } from '@/features/catalog/components/price-overlay-scope';
import { RequestPriceButton } from '@/features/catalog/components/request-price-button';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/shared/ui/badge';

type ApartmentPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

const loadApartment = cache((id: string, locale: string) => getApartment(id, { locale }));

export const generateMetadata = async ({ params }: ApartmentPageProps): Promise<Metadata> => {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });
  const apartment = await loadApartment(id, locale);

  if (!apartment) {
    return { title: t('apartment.notFoundTitle') };
  }

  return {
    title: t('apartment.metaTitle', {
      number: apartment.number,
      project: apartment.project.name,
    }),
    description:
      apartment.description ??
      t('apartment.metaFallback', {
        number: apartment.number,
        project: apartment.project.name,
      }),
  };
};

export default async function ApartmentPage({ params }: ApartmentPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const apartment = await loadApartment(id, locale);
  if (!apartment) {
    notFound();
  }

  const t = await getTranslations('Catalog');
  const showRequestCta =
    apartment.priceVisibility === 'by_request' ||
    (apartment.priceVisibility === 'public' && apartment.price == null);

  const statusTone =
    apartment.salesStatus === 'available'
      ? 'success'
      : apartment.salesStatus === 'reserved'
        ? 'warning'
        : 'neutral';

  return (
    <div className="min-h-screen bg-background">
      <ProjectPricesOverlayScope projectId={apartment.project.id}>
        <main className="page-container section-pad">
          <nav className="mb-6 text-sm text-ink-secondary">
            <Link href="/projects" className="transition-colors hover:text-ink">
              {t('projects.title')}
            </Link>
            <span className="mx-2 text-ink-muted">/</span>
            <Link
              href={`/projects/${apartment.project.id}`}
              className="transition-colors hover:text-ink"
            >
              {apartment.project.name}
            </Link>
            <span className="mx-2 text-ink-muted">/</span>
            <span className="text-ink">{t('apartment.unit', { number: apartment.number })}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border/80 bg-surface shadow-xs">
              {apartment.plan ? (
                <Image
                  src={apartment.plan.fileUrl}
                  alt={apartment.plan.altText ?? apartment.number}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  priority
                />
              ) : (
                <div className="flex size-full items-center justify-center text-sm text-ink-muted">
                  {t('apartment.noPlan')}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6 rounded-md border border-border/80 bg-surface-elevated p-5 shadow-xs sm:p-6">
              <header className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    {apartment.builder.logoUrl ? (
                      <span className="relative size-6 shrink-0 overflow-hidden rounded-sm bg-surface">
                        <Image
                          src={apartment.builder.logoUrl}
                          alt={apartment.builder.name}
                          fill
                          className="object-cover"
                          sizes="24px"
                        />
                      </span>
                    ) : null}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                      {apartment.builder.name} · {apartment.building.name}
                    </p>
                  </div>
                  <h1 className="mt-2 font-brand text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-tight text-ink">
                    {t('apartment.unit', { number: apartment.number })}
                  </h1>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {t('apartment.floor', {
                      floor: apartment.floor.displayLabel ?? String(apartment.floor.number),
                    })}
                  </p>
                  <div className="mt-3">
                    <Badge tone={statusTone}>{t(`status.${apartment.salesStatus}`)}</Badge>
                  </div>
                </div>
                <ApartmentDetailFavorite apartmentId={apartment.id} />
              </header>

              <ApartmentDetailPrice
                apartmentId={apartment.id}
                amount={apartment.price}
                currency={apartment.priceCurrency}
                priceVisibility={apartment.priceVisibility}
              />

              <dl className="grid grid-cols-2 gap-3">
                <Detail
                  label={t('apartment.statusLabel')}
                  value={t(`status.${apartment.salesStatus}`)}
                />
                {apartment.rooms != null ? (
                  <Detail label={t('apartment.roomsLabel')} value={String(apartment.rooms)} />
                ) : null}
                {apartment.areaTotal != null ? (
                  <Detail
                    label={t('apartment.areaLabel')}
                    value={t('apartment.area', { area: apartment.areaTotal })}
                  />
                ) : null}
                {apartment.bedrooms != null ? (
                  <Detail label={t('apartment.bedroomsLabel')} value={String(apartment.bedrooms)} />
                ) : null}
                {apartment.bathrooms != null ? (
                  <Detail
                    label={t('apartment.bathroomsLabel')}
                    value={String(apartment.bathrooms)}
                  />
                ) : null}
              </dl>

              {apartment.description ? (
                <p className="text-sm leading-relaxed text-ink-secondary">
                  {apartment.description}
                </p>
              ) : null}

              <div className="mt-auto flex flex-wrap gap-3 border-t border-border pt-5">
                {showRequestCta ? (
                  <RequestPriceButton
                    projectId={apartment.project.id}
                    apartmentId={apartment.id}
                    labelKey="requestPrice"
                  />
                ) : null}
                {apartment.matterportUrl ? (
                  <a
                    href={apartment.matterportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-sm bg-brand px-5 text-sm font-medium text-on-brand hover:bg-brand-hover"
                  >
                    {t('apartment.matterportTour')}
                  </a>
                ) : null}
                {apartment.external3dUrl ? (
                  <a
                    href={apartment.external3dUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-sm border border-border-strong px-5 text-sm font-medium text-ink hover:bg-surface"
                  >
                    {t('apartment.external3dTour')}
                  </a>
                ) : null}
                <Link
                  href={`/projects/${apartment.project.id}`}
                  className="inline-flex h-11 items-center justify-center rounded-sm border border-border-strong px-5 text-sm font-medium text-ink hover:bg-surface"
                >
                  {t('actions.viewProject')}
                </Link>
              </div>
            </div>
          </div>
        </main>
      </ProjectPricesOverlayScope>
      <SiteFooter />
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-sm bg-surface px-3 py-3">
      <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
};
