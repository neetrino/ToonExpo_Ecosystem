'use client';

import { Building2 } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';

import { ReadinessProgressRing } from '@/features/readiness/components/readiness-progress-ring';
import {
  OVERALL_RING_TONE,
  RING_TEXT_CLASS,
  type ReadinessRingTone,
  toneForCategoryCode,
} from '@/features/readiness/utils/readiness-ring-tone';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';
import { cn } from '@/shared/ui/cn';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';

const CARD_RADIUS_CLASS = 'rounded-[24px]';
const MEDIA_RADIUS_CLASS = 'rounded-[16px]';
const MEDIA_ASPECT_CLASS = 'aspect-[16/10]';
const OVERALL_RING_SIZE_CLASS = 'size-14';
const LOGO_SIZE_PX = 32;

export type ReadinessKpiCategoryRow = {
  id: string;
  code: string;
  percent: number;
  hasScore: boolean;
};

type ScorePairProps = {
  primary: number | null;
  tone: ReadinessRingTone;
  className?: string | undefined;
};

const ScorePair = ({ primary, tone, className }: ScorePairProps) => {
  if (primary === null) {
    return <span className={cn('tabular-nums text-ink-muted', className)}>—</span>;
  }
  return (
    <span
      className={cn(
        'font-semibold tracking-tight tabular-nums',
        RING_TEXT_CLASS[tone],
        className,
      )}
    >
      {primary}%
    </span>
  );
};

type KpiCardHeaderProps = {
  companyName: string;
  logoUrl: string | null;
  initials: string;
  title: string;
  headerTrailing: ReactNode | undefined;
};

const KpiCardHeader = ({
  companyName,
  logoUrl,
  initials,
  title,
  headerTrailing,
}: KpiCardHeaderProps) => (
  <header className="flex flex-col gap-1.5">
    <div className="flex min-w-0 items-center gap-2">
      <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-border">
        {logoUrl ? (
          <Image src={logoUrl} alt="" fill className="object-cover" sizes={`${LOGO_SIZE_PX}px`} />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-ink-muted">
            {initials}
          </span>
        )}
      </div>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink-secondary">{companyName}</p>
      {headerTrailing}
    </div>
    <h2 className="line-clamp-2 text-base font-semibold tracking-tight text-ink">{title}</h2>
  </header>
);

type KpiCardCoverProps = {
  mediaUrl: string | null;
  title: string;
};

const KpiCardCover = ({ mediaUrl, title }: KpiCardCoverProps) => (
  <div
    className={cn(
      'relative w-full overflow-hidden bg-surface ring-1 ring-border/60',
      MEDIA_ASPECT_CLASS,
      MEDIA_RADIUS_CLASS,
    )}
  >
    {mediaUrl ? (
      <Image
        src={mediaUrl}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
      />
    ) : (
      <span className="flex size-full flex-col items-center justify-center gap-1.5 text-ink-muted">
        <Building2 className="size-8 opacity-40" aria-hidden />
        <span className="max-w-[80%] truncate text-xs">{title}</span>
      </span>
    )}
  </div>
);

type KpiOverallRowProps = {
  overallPercent: number;
  overallHasScore: boolean;
  overallLabel: string;
};

const KpiOverallRow = ({
  overallPercent,
  overallHasScore,
  overallLabel,
}: KpiOverallRowProps) => {
  const overallDisplay = overallHasScore ? `${overallPercent}%` : '—';
  return (
    <div className="flex items-center gap-3">
      <ReadinessProgressRing
        percent={overallPercent}
        size="sm"
        tone={OVERALL_RING_TONE}
        showValue={false}
        className={OVERALL_RING_SIZE_CLASS}
        label={`${overallLabel}: ${overallDisplay}`}
      />
      <p className="min-w-0 flex-1 text-sm leading-tight text-ink-secondary line-clamp-2">
        {overallLabel}
      </p>
      <ScorePair
        primary={overallHasScore ? overallPercent : null}
        tone={OVERALL_RING_TONE}
        className="shrink-0 text-xl"
      />
    </div>
  );
};

type KpiCategoryListProps = {
  categories: readonly ReadinessKpiCategoryRow[];
  categoryLabel: (code: string) => string;
};

const KpiCategoryList = ({ categories, categoryLabel }: KpiCategoryListProps) => {
  if (categories.length === 0) {
    return null;
  }
  return (
    <>
      <div className="border-t border-border" aria-hidden />
      <ul className="flex flex-col gap-2.5">
        {categories.map((category) => {
          const tone = toneForCategoryCode(category.code);
          const label = categoryLabel(category.code);
          return (
            <li key={category.id} className="flex items-center gap-2.5">
              <ReadinessProgressRing
                percent={category.percent}
                size="2xs"
                tone={tone}
                showValue={false}
                label={`${label}: ${category.hasScore ? `${category.percent}%` : '—'}`}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-ink-secondary">{label}</span>
              <ScorePair
                primary={category.hasScore ? category.percent : null}
                tone={tone}
                className="shrink-0 text-sm"
              />
            </li>
          );
        })}
      </ul>
    </>
  );
};

type ReadinessKpiCardProps = {
  companyName: string;
  companyLogoUrl: string | null;
  title: string;
  coverUrl: string | null;
  overallPercent: number;
  overallHasScore: boolean;
  overallLabel: string;
  categories: readonly ReadinessKpiCategoryRow[];
  categoryLabel: (code: string) => string;
  onClick: () => void;
  headerTrailing?: ReactNode | undefined;
  srOnlyAction?: string | undefined;
  ariaExpanded?: boolean | undefined;
  ariaControls?: string | undefined;
  ariaLabel?: string | undefined;
};

/**
 * Light-mode readiness KPI card — logo, cover, colorful rings, category rows.
 */
export const ReadinessKpiCard = ({
  companyName,
  companyLogoUrl,
  title,
  coverUrl,
  overallPercent,
  overallHasScore,
  overallLabel,
  categories,
  categoryLabel,
  onClick,
  headerTrailing,
  srOnlyAction,
  ariaExpanded,
  ariaControls,
  ariaLabel,
}: ReadinessKpiCardProps) => {
  const initials = companyName.trim().slice(0, 2).toUpperCase() || '—';
  const logoUrl = resolvePublicAssetUrl(companyLogoUrl);
  const mediaUrl = resolvePublicAssetUrl(coverUrl);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-label={ariaLabel}
      className={cn(
        'flex h-full w-full flex-col gap-3 overflow-hidden border border-border/80',
        'bg-surface-elevated p-4 text-left shadow-card',
        LIST_CARD_LIFT_CLASS,
        CARD_RADIUS_CLASS,
      )}
    >
      <KpiCardHeader
        companyName={companyName}
        logoUrl={logoUrl}
        initials={initials}
        title={title}
        headerTrailing={headerTrailing}
      />
      <KpiCardCover mediaUrl={mediaUrl} title={title} />
      <KpiOverallRow
        overallPercent={overallPercent}
        overallHasScore={overallHasScore}
        overallLabel={overallLabel}
      />
      <KpiCategoryList categories={categories} categoryLabel={categoryLabel} />
      {srOnlyAction ? <span className="sr-only">{srOnlyAction}</span> : null}
    </button>
  );
};
