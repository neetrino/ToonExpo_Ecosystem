'use client';

import type { ProjectListItem } from '@toonexpo/contracts';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import { FavoriteToggleButton } from '@/features/buyer/components/favorite-toggle-button';
import { usePriceOverlay } from '@/features/catalog/components/price-overlay-scope';
import { formatCompactPrice, formatPriceRange } from '@/features/catalog/utils/format-price';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type ProjectCardProps = {
  project: ProjectListItem;
  className?: string | undefined;
  /** Compact marketplace price (e.g. 1.2M AMD) instead of full range. */
  featured?: boolean | undefined;
  showFavorite?: boolean | undefined;
};

/**
 * Marketplace project card — Figma listing grid (`81:176` / `81:177`).
 */
export const ProjectCard = ({
  project,
  className,
  featured = false,
  showFavorite = false,
}: ProjectCardProps) => {
  const t = useTranslations('Catalog');
  const locale = useLocale();
  const district = project.district?.trim() || null;
  const city = project.city?.trim() || null;
  const locationFallback = project.locationText?.trim() || null;
  const range = usePriceOverlay().getProjectRange(project.id) ?? project;
  const priceLabel = featured
    ? formatCompactPrice({
        amount: range.minPrice,
        currency: range.priceCurrency,
        locale,
        fromLabel: '',
        onRequestLabel: t('price.onRequest'),
      })
    : formatPriceRange({
        minPrice: range.minPrice,
        maxPrice: range.maxPrice,
        currency: range.priceCurrency,
        locale,
        onRequestLabel: t('price.onRequest'),
      });

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-[20px] bg-surface-elevated p-2',
        'ring-1 ring-header-border transition-all duration-[var(--duration-base)]',
        'hover:shadow-lg hover:shadow-brand/5 hover:ring-brand/40',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface">
        <Link href={`/projects/${project.id}`} className="absolute inset-0 block">
          {project.cover ? (
            <Image
              src={project.cover.fileUrl}
              alt={project.cover.altText ?? project.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-surface text-sm text-header-muted">
              {project.name}
            </div>
          )}
        </Link>

        <span
          className={cn(
            'pointer-events-none absolute top-3 left-3 rounded-sm bg-canvas/95 px-2 py-1',
            'text-[10px] font-bold tracking-widest text-brand-deep uppercase',
          )}
        >
          {t('badges.verified')}
        </span>

        {showFavorite ? (
          <FavoriteToggleButton
            targetType="project"
            targetId={project.id}
            className="absolute top-3 right-3 z-10"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate font-brand text-base font-semibold tracking-[-0.02em] text-ink-navy">
            <Link
              href={`/projects/${project.id}`}
              className="transition-colors hover:text-brand-deep"
            >
              {project.name}
            </Link>
          </h3>
          <p className="shrink-0 font-brand text-lg font-bold leading-7 text-brand-deep">
            {priceLabel}
          </p>
        </div>

        <p className="mb-4 text-xs leading-4 text-header-muted">
          {district && city ? (
            <>
              <span>{district}</span>
              <span>{' · '}</span>
              <span>{city}</span>
            </>
          ) : (
            (locationFallback ?? city ?? district ?? project.builder.name)
          )}
        </p>

        <div
          className={cn(
            'mt-auto flex flex-wrap items-center gap-4 border-t border-header-border pt-3',
            'text-[11px] font-medium tracking-tight text-header-muted uppercase',
          )}
        >
          <SpecStat value={project.availability.available} label={t('availability.availShort')} />
          <SpecStat value={project.availability.total} label={t('availability.unitsShort')} />
          <SpecStat value={project.availability.sold} label={t('availability.soldShort')} />
        </div>
      </div>
    </article>
  );
};

const SpecStat = ({ value, label }: { value: number; label: string }) => {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span>{value}</span>
      <span>{label}</span>
    </span>
  );
};
