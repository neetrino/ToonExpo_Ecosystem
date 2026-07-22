'use client';

import type { ProjectListItem } from '@toonexpo/contracts';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import { computeSoldPercent, resolveBadge } from '@/features/catalog/utils/development-progress';
import { formatCompactPrice } from '@/features/catalog/utils/format-price';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type DevelopmentProgressCardProps = {
  project: ProjectListItem;
  className?: string | undefined;
};

/**
 * Development watch card — image, status badge, price, sold progress.
 * Figma cards inside section `81:297`.
 */
export const DevelopmentProgressCard = ({ project, className }: DevelopmentProgressCardProps) => {
  const t = useTranslations('HomePage.developments');
  const catalogT = useTranslations('Catalog');
  const locale = useLocale();
  const soldPercent = computeSoldPercent(project);
  const badge = resolveBadge(soldPercent);
  const location = [project.city, project.district].filter(Boolean).join(', ') || null;
  const priceLabel = formatCompactPrice({
    amount: project.minPrice,
    currency: project.priceCurrency,
    locale,
    fromLabel: catalogT('price.from'),
    onRequestLabel: catalogT('price.onRequest'),
  });

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-[20px] bg-surface-elevated',
        'ring-1 ring-header-border transition-all duration-[var(--duration-base)]',
        'hover:shadow-lg hover:shadow-brand/5 hover:ring-brand/40',
        className,
      )}
    >
      <Link
        href={`/projects/${project.id}`}
        className="relative block aspect-[16/10] overflow-hidden bg-surface"
      >
        {project.cover ? (
          <Image
            src={project.cover.fileUrl}
            alt={project.cover.altText ?? project.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-sm text-header-muted">
            {project.name}
          </div>
        )}
        <span
          className={cn(
            'absolute top-3 left-3 rounded-sm bg-canvas/95 px-2 py-1',
            'text-[10px] font-bold tracking-widest text-brand-deep uppercase',
          )}
        >
          {t(`badges.${badge}`)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h3 className="min-w-0 font-brand text-lg font-semibold tracking-[-0.02em] text-ink-navy">
            <Link
              href={`/projects/${project.id}`}
              className="transition-colors hover:text-brand-deep"
            >
              {project.name}
            </Link>
          </h3>
          <p className="shrink-0 text-sm font-semibold text-brand-deep">{priceLabel}</p>
        </div>

        <p className="text-xs leading-4 text-header-muted">
          <span>{project.builder.name}</span>
          {location ? (
            <>
              <span>{' · '}</span>
              <span>{location}</span>
            </>
          ) : null}
        </p>

        {project.shortDescription ? (
          <p className="mt-3 line-clamp-2 text-sm leading-5 text-ink-navy/80">
            {project.shortDescription}
          </p>
        ) : null}

        <div className="mt-auto space-y-2 pt-5">
          <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase">
            <span className="text-ink-navy">
              {soldPercent}
              {t('soldPercent')}
            </span>
            <span className="text-header-muted">{t('completionTba')}</span>
          </div>
          <progress
            className={cn(
              'h-1 w-full appearance-none overflow-hidden rounded-pill bg-header-border',
              '[&::-webkit-progress-bar]:rounded-pill [&::-webkit-progress-bar]:bg-header-border',
              '[&::-webkit-progress-value]:rounded-pill [&::-webkit-progress-value]:bg-brand-secondary',
              '[&::-moz-progress-bar]:rounded-pill [&::-moz-progress-bar]:bg-brand-secondary',
            )}
            max={100}
            value={soldPercent}
            aria-label={t('soldProgressLabel', { percent: soldPercent })}
          />
        </div>
      </div>
    </article>
  );
};
