'use client';

import type { ProjectListItem } from '@toonexpo/contracts';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import { FavoriteToggleButton } from '@/features/buyer/components/favorite-toggle-button';
import { usePriceOverlay } from '@/features/catalog/components/price-overlay-scope';
import { formatCompactPrice, formatPriceRange } from '@/features/catalog/utils/format-price';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/ui/cn';

type ProjectCardProps = {
  project: ProjectListItem;
  className?: string | undefined;
  featured?: boolean | undefined;
  showFavorite?: boolean | undefined;
};

/**
 * Catalog project card: cover, name, city, price range, availability.
 */
export const ProjectCard = ({
  project,
  className,
  featured = false,
  showFavorite = false,
}: ProjectCardProps) => {
  const t = useTranslations('Catalog');
  const locale = useLocale();
  const location =
    project.locationText ?? [project.district, project.city].filter(Boolean).join(', ');
  const range = usePriceOverlay().getProjectRange(project.id) ?? project;
  const priceLabel = featured
    ? formatCompactPrice({
        amount: range.minPrice,
        currency: range.priceCurrency,
        locale,
        fromLabel: t('price.from'),
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
        'group flex flex-col overflow-hidden rounded-md border border-border/80 bg-surface-elevated shadow-xs transition-[box-shadow,transform] duration-[var(--duration-base)] hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
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
            <div className="flex size-full items-center justify-center bg-surface text-sm text-ink-muted">
              {project.name}
            </div>
          )}
        </Link>
        <Badge className="absolute top-3 left-3 border-white/60 bg-white/90 text-ink backdrop-blur-sm">
          {t('availability.availableCount', {
            count: project.availability.available,
          })}
        </Badge>
        {showFavorite ? (
          <FavoriteToggleButton
            targetType="project"
            targetId={project.id}
            className="absolute top-3 right-3 z-10"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-brand text-sm font-semibold text-ink">
            <Link href={`/projects/${project.id}`} className="transition-colors hover:text-brand">
              {project.name}
            </Link>
          </h3>
          <p className="shrink-0 text-xs font-semibold text-ink">{priceLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          {project.builder.logoUrl ? (
            <span className="relative size-6 shrink-0 overflow-hidden rounded-sm bg-surface">
              <Image
                src={project.builder.logoUrl}
                alt={project.builder.name}
                fill
                className="object-cover"
                sizes="24px"
              />
            </span>
          ) : null}
          <p className="min-w-0 text-[11px] text-ink-muted">
            {project.builder.name}
            {location ? ` · ${location}` : null}
          </p>
        </div>
        {project.shortDescription ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-ink-secondary">
            {project.shortDescription}
          </p>
        ) : null}
        <div className="mt-auto grid grid-cols-3 gap-2 pt-2">
          <AvailabilityTile label={t('availability.total')} value={project.availability.total} />
          <AvailabilityTile
            label={t('availability.available')}
            value={project.availability.available}
          />
          <AvailabilityTile label={t('availability.sold')} value={project.availability.sold} />
        </div>
        <Link
          href={`/projects/${project.id}`}
          className="mt-3 inline-flex h-9 items-center justify-center rounded-sm bg-cta-dark text-sm font-medium text-on-dark transition-colors hover:bg-cta-dark/90"
        >
          {t('actions.details')}
        </Link>
      </div>
    </article>
  );
};

const AvailabilityTile = ({ label, value }: { label: string; value: number }) => {
  return (
    <div className="rounded-xs bg-surface px-1 py-2 text-center">
      <p className="text-[9px] font-bold uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
};
