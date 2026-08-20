'use client';

import type { ProjectDetail } from '@toonexpo/contracts';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { ProjectDetailFavorite } from '@/features/buyer/components/project-detail-favorite';
import { CatalogEntityQr } from '@/features/catalog/components/catalog-entity-qr';
import { ProjectPriceCta } from '@/features/catalog/components/project-price-cta';
import { usePriceOverlay } from '@/features/catalog/components/price-overlay-scope';
import { buildProjectCatalogQrUrl } from '@/features/catalog/utils/build-catalog-entity-qr-url';
import { computeSoldPercent, resolveBadge } from '@/features/catalog/utils/development-progress';
import { formatCompactPrice } from '@/features/catalog/utils/format-price';
import { shouldShowPriceOnRequestCta } from '@/features/catalog/utils/price-on-request-cta';
import { formatCompletionQuarter } from '@/features/catalog/utils/project-detail-presentation';
import { cn } from '@/shared/ui/cn';

type ProjectDetailHeroProps = {
  project: ProjectDetail;
};

/** Shared width so title left edge matches first centered stats column. */
const STAT_CONTENT_MIN_CLASS = 'min-w-[5.5rem]';
/**
 * Left inset of a centered `min-w-[5.5rem]` block inside the first grid column
 * (accounts for `gap-6` gutters).
 */
const TITLE_ALIGN_PL_CLASS =
  'sm:pl-[max(0rem,calc((100%-3rem)/6-2.75rem))] lg:pl-[max(0rem,calc((100%-6rem)/10-2.75rem))]';
/** Builder mark beside the project title. */
const BUILDER_LOGO_SIZE_CLASS = 'size-14 sm:size-16';
const BUILDER_LOGO_IMAGE_SIZES = '64px';

type BuilderMarkProps = {
  name: string;
  logoUrl: string | null;
  initials: string;
};

const BuilderMark = ({ name, logoUrl, initials }: BuilderMarkProps) =>
  logoUrl ? (
    <span
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-header-border',
        BUILDER_LOGO_SIZE_CLASS,
      )}
    >
      <Image
        src={logoUrl}
        alt={name}
        fill
        className="object-cover"
        sizes={BUILDER_LOGO_IMAGE_SIZES}
      />
    </span>
  ) : (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-brand-deep font-brand text-lg font-bold text-on-dark sm:text-xl',
        BUILDER_LOGO_SIZE_CLASS,
      )}
      aria-hidden
    >
      {initials}
    </span>
  );

type ProjectHeroSummaryProps = {
  project: ProjectDetail;
  projectQrUrl: string;
  builderInitials: string;
  qrTitle: string;
  description: string;
};

const ProjectHeroSummary = ({
  project,
  projectQrUrl,
  builderInitials,
  qrTitle,
  description,
}: ProjectHeroSummaryProps) => (
  <div className={cn(TITLE_ALIGN_PL_CLASS)}>
    {/* Mobile: logo + builder name left, QR right — one line */}
    <div className="flex items-center justify-between gap-3 sm:hidden">
      <div className="flex min-w-0 items-center gap-3">
        <BuilderMark
          name={project.builder.name}
          logoUrl={project.builder.logoUrl}
          initials={builderInitials}
        />
        <p className="truncate text-[11px] font-bold tracking-[0.2em] text-brand-secondary uppercase">
          {project.builder.name}
        </p>
      </div>
      <CatalogEntityQr payloadUrl={projectQrUrl} codeLabel={qrTitle} entityName={project.name} />
    </div>

    <div className="mt-3 sm:hidden">
      <h1 className="font-brand text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[1.15] tracking-[-0.03em] text-ink-navy">
        {project.name}
      </h1>
      <p className="mt-3 text-lg leading-6 text-header-muted">{description}</p>
    </div>

    {/* Desktop / tablet */}
    <div className="hidden items-start gap-5 sm:flex">
      <BuilderMark
        name={project.builder.name}
        logoUrl={project.builder.logoUrl}
        initials={builderInitials}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold tracking-[0.2em] text-brand-secondary uppercase">
          {project.builder.name}
        </p>
        <div className="mt-2 flex items-start gap-3">
          <h1 className="min-w-0 flex-1 font-brand text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[1.15] tracking-[-0.03em] text-ink-navy">
            {project.name}
          </h1>
          <CatalogEntityQr
            className="mt-1"
            payloadUrl={projectQrUrl}
            codeLabel={qrTitle}
            entityName={project.name}
          />
        </div>
        <p className="mt-3 max-w-2xl text-lg leading-6 text-header-muted">{description}</p>
      </div>
    </div>
  </div>
);

/**
 * Full-bleed cover + overlapping summary card — Figma `89:876` hero.
 */
export const ProjectDetailHero = ({ project }: ProjectDetailHeroProps) => {
  const t = useTranslations('Catalog.projectDetail');
  const homeT = useTranslations('HomePage.developments');
  const catalogT = useTranslations('Catalog');
  const locale = useLocale();
  const range = usePriceOverlay().getProjectRange(project.id) ?? project;
  const soldPercent = computeSoldPercent(project);
  const badge = resolveBadge(soldPercent);
  const completion = formatCompletionQuarter(project.completionDate) ?? t('completionTba');
  const priceLabel = formatCompactPrice({
    amount: range.minPrice,
    currency: range.priceCurrency,
    locale,
    fromLabel: '',
    onRequestLabel: catalogT('price.onRequest'),
  });
  const builderInitials = project.builder.name.trim().slice(0, 2).toUpperCase() || '—';
  const projectQrUrl = buildProjectCatalogQrUrl(locale, project.id);

  return (
    <section className="relative">
      <div className="relative h-[min(72vh,48rem)] w-full overflow-hidden bg-surface">
        {project.cover ? (
          <Image
            src={project.cover.fileUrl}
            alt={project.cover.altText ?? project.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="size-full bg-band-mist" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/20" />
        <ProjectDetailFavorite projectId={project.id} />
      </div>

      <div className="page-container relative z-[1] -mt-40 pb-4 sm:-mt-48">
        <div
          className={cn(
            'rounded-[24px] bg-surface-elevated p-6 ring-1 ring-header-border sm:p-8',
            'shadow-lg shadow-brand/5',
          )}
        >
          <ProjectHeroSummary
            project={project}
            projectQrUrl={projectQrUrl}
            builderInitials={builderInitials}
            qrTitle={t('qrTitle', { name: project.name })}
            description={project.shortDescription ?? catalogT('project.noDescription')}
          />

          <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            <HeroStat label={t('statStatus')} value={homeT(`badges.${badge}`)} />
            <HeroStat label={t('statCompletion')} value={completion} />
            <HeroStat
              label={t('statFrom')}
              value={
                <ProjectPriceCta
                  projectId={project.id}
                  priceOnRequest={shouldShowPriceOnRequestCta({
                    priceOnRequest: project.priceOnRequest,
                    minPrice: range.minPrice,
                    maxPrice: range.maxPrice,
                  })}
                  priceLabel={priceLabel}
                />
              }
              className="order-5 max-sm:col-span-2 max-sm:justify-start max-sm:pl-[max(0rem,calc((100%-1.5rem)/4-2.75rem))] sm:order-3"
              valueClassName="max-sm:whitespace-nowrap"
            />
            <HeroStat
              label={t('statTotalUnits')}
              value={String(project.availability.total)}
              align="center"
              className="order-4"
            />
            <HeroStat
              label={t('statSold')}
              value={`${soldPercent}%`}
              className="order-3 sm:order-5"
            />
          </dl>
        </div>
      </div>
    </section>
  );
};

const HeroStat = ({
  label,
  value,
  className,
  valueClassName,
  align = 'left',
}: {
  label: string;
  value: ReactNode;
  className?: string | undefined;
  valueClassName?: string | undefined;
  align?: 'left' | 'center' | undefined;
}) => (
  <div className={cn('flex justify-center', className)}>
    <div className={cn(STAT_CONTENT_MIN_CLASS, align === 'center' ? 'text-center' : 'text-left')}>
      <dt className="text-[10px] font-bold tracking-widest text-header-muted uppercase">{label}</dt>
      <dd
        className={cn(
          'mt-1.5 font-brand text-xl font-bold leading-7 text-ink-navy',
          valueClassName,
        )}
      >
        {value}
      </dd>
    </div>
  </div>
);
