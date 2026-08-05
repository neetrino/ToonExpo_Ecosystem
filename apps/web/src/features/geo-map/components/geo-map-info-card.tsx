'use client';

import { ArrowUpRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { GEO_MAP_INFO_CARD_LOGO_PX } from '@/features/geo-map/constants';
import type { GeoMapInfoCardSide } from '@/features/geo-map/utils/resolve-info-card-placement';
import { cn } from '@/shared/ui/cn';

type GeoMapInfoCardProps = {
  projectName: string;
  /** Project address as entered in admin; hidden when the project has none. */
  addressLine?: string | null | undefined;
  logoUrl?: string | null | undefined;
  /** Pin anchor in map container pixels; omitted → centered at the map top. */
  anchor?: { x: number; y: number; side: GeoMapInfoCardSide } | null | undefined;
  className?: string | undefined;
};

const FALLBACK_POSITION_CLASS = 'top-4 left-1/2 -translate-x-1/2';

/**
 * Shared hover/select popover for geo-map objects — logo, project name and the
 * project address, anchored to the hovered pin (falls back to the map top when
 * no anchor is available). Mounted by `GeoMapCanvas` so home, /map and
 * apartments share one UX.
 */
export const GeoMapInfoCard = ({
  projectName,
  addressLine = null,
  logoUrl = null,
  anchor = null,
  className,
}: GeoMapInfoCardProps) => {
  const t = useTranslations('GeoMap.hover');
  const initials = projectName.trim().slice(0, 2).toUpperCase() || '—';
  const side = anchor?.side ?? 'below';

  return (
    <div
      className={cn(
        'pointer-events-none absolute z-10 w-[min(18rem,calc(100%-1.5rem))] -translate-x-1/2',
        anchor ? 'animate-geo-map-info-card-in' : FALLBACK_POSITION_CLASS,
        anchor && side === 'above' && '-translate-y-full',
        className,
      )}
      {...(anchor ? { style: { left: `${anchor.x}px`, top: `${anchor.y}px` } } : {})}
    >
      <div className="relative">
        {anchor ? (
          <span
            className={cn(
              'absolute left-1/2 size-3 -translate-x-1/2 rotate-45 rounded-[3px]',
              'bg-surface-elevated ring-1 ring-header-border',
              side === 'above' ? 'bottom-0 translate-y-1/2' : 'top-0 -translate-y-1/2',
            )}
            aria-hidden
          />
        ) : null}
        <div
          className={cn(
            'relative flex items-center gap-3 rounded-[18px] bg-surface-elevated px-3 py-2.5',
            'shadow-lg ring-1 ring-header-border',
          )}
        >
          <div
            className={cn(
              'relative size-10 shrink-0 overflow-hidden rounded-full bg-surface',
              'ring-1 ring-border',
            )}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt=""
                fill
                className="object-cover"
                sizes={`${GEO_MAP_INFO_CARD_LOGO_PX}px`}
              />
            ) : (
              <span
                className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-ink-muted"
                aria-hidden
              >
                {initials}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-brand text-sm font-semibold tracking-[-0.02em] text-ink-navy">
              {projectName}
            </p>
            {addressLine ? (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-secondary">
                <MapPin className="size-3 shrink-0 text-brand" strokeWidth={2} aria-hidden />
                <span className="truncate">{addressLine}</span>
              </p>
            ) : (
              <p className="mt-0.5 text-xs font-medium text-brand-deep">{t('viewProject')}</p>
            )}
          </div>
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-full',
              'bg-brand-soft text-brand-deep',
            )}
          >
            <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden />
            <span className="sr-only">{t('viewProject')}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
