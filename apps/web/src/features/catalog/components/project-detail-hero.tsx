'use client';

import type { ProjectDetail } from '@toonexpo/contracts';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import { ProjectDetailFavorite } from '@/features/buyer/components/project-detail-favorite';
import { usePriceOverlay } from '@/features/catalog/components/price-overlay-scope';
import { computeSoldPercent, resolveBadge } from '@/features/catalog/utils/development-progress';
import { formatCompactPrice } from '@/features/catalog/utils/format-price';
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
  'pl-[max(0rem,calc((100%-1.5rem)/4-2.75rem))] sm:pl-[max(0rem,calc((100%-3rem)/6-2.75rem))] lg:pl-[max(0rem,calc((100%-6rem)/10-2.75rem))]';

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
          <div className={TITLE_ALIGN_PL_CLASS}>
            <p className="text-[11px] font-bold tracking-[0.2em] text-brand-secondary uppercase">
              {project.builder.name}
            </p>
            <h1 className="mt-2 font-brand text-[clamp(2rem,5vw,3.75rem)] font-bold leading-[1.15] tracking-[-0.03em] text-ink-navy">
              {project.name}
            </h1>
            <p className="mt-3 max-w-2xl text-lg leading-6 text-header-muted">
              {project.shortDescription ?? catalogT('project.noDescription')}
            </p>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
            <HeroStat label={t('statStatus')} value={homeT(`badges.${badge}`)} />
            <HeroStat label={t('statCompletion')} value={completion} />
            <HeroStat label={t('statFrom')} value={priceLabel} />
            <HeroStat label={t('statTotalUnits')} value={String(project.availability.total)} />
            <HeroStat label={t('statSold')} value={`${soldPercent}%`} />
          </dl>
        </div>
      </div>
    </section>
  );
};

const HeroStat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-center">
    <div className={cn(STAT_CONTENT_MIN_CLASS, 'text-left')}>
      <dt className="text-[10px] font-bold tracking-widest text-header-muted uppercase">{label}</dt>
      <dd className="mt-1.5 font-brand text-xl font-bold leading-7 text-ink-navy">{value}</dd>
    </div>
  </div>
);
