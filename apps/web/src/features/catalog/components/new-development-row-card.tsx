'use client';

import type { ProjectListItem } from '@toonexpo/contracts';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import { usePriceOverlay } from '@/features/catalog/components/price-overlay-scope';
import { computeSoldPercent, resolveBadge } from '@/features/catalog/utils/development-progress';
import { formatCompactPrice } from '@/features/catalog/utils/format-price';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type NewDevelopmentRowCardProps = {
  project: ProjectListItem;
  /** Alternating media placement on desktop — Figma odd/even rows. */
  imageSide: 'left' | 'right';
  className?: string | undefined;
};

/**
 * Full-width development feature row — Figma `103:2428` / `103:2454`.
 */
export const NewDevelopmentRowCard = ({
  project,
  imageSide,
  className,
}: NewDevelopmentRowCardProps) => {
  const t = useTranslations('DevelopmentsPage');
  const catalogT = useTranslations('Catalog');
  const homeT = useTranslations('HomePage.developments');
  const locale = useLocale();
  const range = usePriceOverlay().getProjectRange(project.id) ?? project;
  const soldPercent = computeSoldPercent(project);
  const badge = resolveBadge(soldPercent);
  const unitsLeft = Math.max(0, project.availability.total - project.availability.sold);
  const locationLine = buildLocationLine(project, t('completionTba'));
  const priceLabel = formatCompactPrice({
    amount: range.minPrice,
    currency: range.priceCurrency,
    locale,
    fromLabel: '',
    onRequestLabel: catalogT('price.onRequest'),
  });

  const media = (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-surface lg:aspect-auto lg:h-full lg:min-h-[27.5rem]">
      {project.cover ? (
        <Image
          src={project.cover.fileUrl}
          alt={project.cover.altText ?? project.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-sm text-header-muted">
          {project.name}
        </div>
      )}
      <span
        className={cn(
          'absolute top-4 left-4 rounded-[10px] bg-canvas/95 px-2.5 py-1',
          'text-[10px] font-bold tracking-widest text-brand-deep uppercase',
        )}
      >
        {homeT(`badges.${badge}`)}
      </span>
    </div>
  );

  const content = (
    <div className="flex min-h-0 flex-1 flex-col px-2 py-2 sm:px-4 lg:py-6">
      <p className="text-[10px] font-bold tracking-widest text-brand-secondary uppercase">
        {project.builder.name}
      </p>
      <h2 className="mt-3 font-brand text-[clamp(1.75rem,3vw,2.05rem)] font-bold tracking-[-0.02em] text-ink-navy transition-colors group-hover:text-brand-deep">
        {project.name}
      </h2>
      {locationLine ? (
        <p className="mt-3 text-base leading-6 text-header-muted">{locationLine}</p>
      ) : null}
      {project.shortDescription ? (
        <p className="mt-3 line-clamp-3 text-base leading-6 text-ink-navy/80">
          {project.shortDescription}
        </p>
      ) : null}

      <div className="mt-auto grid grid-cols-3 gap-4 pt-8">
        <Stat label={t('statFrom')} value={priceLabel} accent />
        <Stat label={t('statUnits')} value={String(project.availability.total)} />
        <Stat label={t('statSold')} value={String(project.availability.sold)} />
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-[10px] font-bold tracking-widest uppercase">
          <span className="text-ink-navy">
            {soldPercent}
            {homeT('soldPercent')}
          </span>
          <span className="text-header-muted">{t('unitsLeft', { count: unitsLeft })}</span>
        </div>
        <progress
          className={cn(
            'h-1.5 w-full appearance-none overflow-hidden rounded-pill bg-header-border',
            '[&::-webkit-progress-bar]:rounded-pill [&::-webkit-progress-bar]:bg-header-border',
            '[&::-webkit-progress-value]:rounded-pill [&::-webkit-progress-value]:bg-brand-secondary',
            '[&::-moz-progress-bar]:rounded-pill [&::-moz-progress-bar]:bg-brand-secondary',
          )}
          max={100}
          value={soldPercent}
          aria-label={homeT('soldProgressLabel', { percent: soldPercent })}
        />
      </div>
    </div>
  );

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-[24px] bg-surface-elevated',
        'ring-1 ring-header-border transition-all duration-[var(--duration-base)]',
        'hover:shadow-lg hover:shadow-brand/5 hover:ring-brand/40',
        className,
      )}
    >
      <Link
        href={`/projects/${project.id}`}
        className={cn(
          'grid gap-6 p-3 lg:grid-cols-2 lg:gap-8 lg:p-3',
          imageSide === 'right' && 'lg:[&>*:first-child]:order-2',
        )}
      >
        {media}
        {content}
      </Link>
    </article>
  );
};

const Stat = ({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <div>
    <p className="text-[10px] font-bold tracking-widest text-header-muted uppercase">{label}</p>
    <p
      className={cn(
        'mt-1 font-brand text-lg font-bold leading-7',
        accent ? 'text-brand-deep' : 'text-ink-navy',
      )}
    >
      {value}
    </p>
  </div>
);

const buildLocationLine = (project: ProjectListItem, completionLabel: string): string | null => {
  const place =
    [project.city, project.district].filter(Boolean).join(', ') ||
    project.locationText?.trim() ||
    null;
  if (!place) {
    return completionLabel;
  }
  return `${place} · ${completionLabel}`;
};
