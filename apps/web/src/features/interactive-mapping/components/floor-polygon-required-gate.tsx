'use client';

import { Lock } from 'lucide-react';

import { Link } from '@/i18n/navigation';

export type FloorPolygonRequiredGateProps = {
  floorLabel: string;
  message: string;
  ctaLabel: string;
  buildingRenderHref: string;
};

/**
 * Soft gate when Phase 4 is opened for a floor that has no building-render polygon yet.
 */
export const FloorPolygonRequiredGate = ({
  floorLabel,
  message,
  ctaLabel,
  buildingRenderHref,
}: FloorPolygonRequiredGateProps) => (
  <div
    role="status"
    className="flex flex-col gap-4 rounded-sm border border-border bg-surface px-4 py-5 sm:flex-row sm:items-start sm:justify-between"
  >
    <div className="flex gap-3">
      <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-ink-muted shadow-xs">
        <Lock className="size-4" aria-hidden />
      </span>
      <div className="space-y-1">
        <p className="font-display text-lg text-ink">{floorLabel}</p>
        <p className="max-w-xl text-sm leading-relaxed text-ink-muted">{message}</p>
      </div>
    </div>
    <Link
      href={buildingRenderHref}
      className="inline-flex h-9 shrink-0 items-center justify-center self-start rounded-[15px] bg-cta-dark px-4 text-sm font-medium tracking-tight text-on-dark shadow-xs transition-colors hover:bg-cta-dark/90"
    >
      {ctaLabel}
    </Link>
  </div>
);
