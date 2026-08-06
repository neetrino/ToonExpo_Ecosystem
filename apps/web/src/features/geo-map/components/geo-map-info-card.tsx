'use client';

import { ArrowUpRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { GEO_MAP_INFO_CARD_LOGO_PX } from '@/features/geo-map/constants';
import { useAdoptPointerHoldOnMount } from '@/features/geo-map/hooks/use-adopt-pointer-hold-on-mount';
import type { GeoMapInfoCardSide } from '@/features/geo-map/utils/resolve-info-card-placement';
import { cn } from '@/shared/ui/cn';

type GeoMapInfoCardProps = {
  projectName: string;
  /** Project address as entered in admin; hidden when the project has none. */
  addressLine?: string | null | undefined;
  logoUrl?: string | null | undefined;
  /** Pin anchor in map container pixels; omitted → centered at the map top. */
  anchor?: { x: number; y: number; side: GeoMapInfoCardSide } | null | undefined;
  /** Opens the project; when omitted the card stays purely informational. */
  onActivate?: (() => void) | undefined;
  /** Keeps the card open while the pointer rests on it. */
  onPointerEnter?: (() => void) | undefined;
  onPointerLeave?: (() => void) | undefined;
  className?: string | undefined;
};

const FALLBACK_POSITION_CLASS = 'top-4 left-1/2 -translate-x-1/2';

/**
 * Real hit-area across the pin gap (`h-3` = {@link GEO_MAP_INFO_CARD_HOVER_BRIDGE_PX}).
 * A DOM node is more reliable than `::after` for pointer enter/leave.
 */
const HOVER_BRIDGE_CLASS_BY_SIDE: Record<GeoMapInfoCardSide, string> = {
  above: 'absolute inset-x-0 top-full h-3',
  below: 'absolute inset-x-0 bottom-full h-3',
};

type InfoCardContentProps = Pick<GeoMapInfoCardProps, 'projectName' | 'addressLine' | 'logoUrl'>;

const InfoCardContent = ({ projectName, addressLine, logoUrl }: InfoCardContentProps) => {
  const t = useTranslations('GeoMap.hover');
  const initials = projectName.trim().slice(0, 2).toUpperCase() || '—';

  return (
    <>
      <span className="geo-map-info-card__logo">
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
            className="absolute inset-0 flex items-center justify-center bg-brand-soft font-brand text-xs font-semibold tracking-wide text-brand-deep"
            aria-hidden
          >
            {initials}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-brand text-[0.9375rem] leading-tight font-semibold tracking-[-0.02em] text-ink-navy">
          {projectName}
        </span>
        {addressLine ? (
          <span className="mt-1 flex items-center gap-1 text-[0.6875rem] leading-none text-header-muted">
            <MapPin className="size-3 shrink-0 text-brand" strokeWidth={2.25} aria-hidden />
            <span className="truncate">{addressLine}</span>
          </span>
        ) : (
          <span className="mt-1 block text-[0.6875rem] font-medium tracking-wide text-brand-deep uppercase">
            {t('viewProject')}
          </span>
        )}
      </span>
      <span className="geo-map-info-card__cta">
        <ArrowUpRight className="size-3.5" strokeWidth={2.25} aria-hidden />
        <span className="sr-only">{t('viewProject')}</span>
      </span>
    </>
  );
};

/**
 * Shared hover/select popover for geo-map objects — logo, project name and the
 * project address, anchored to the hovered pin (falls back to the map top when
 * no anchor is available). With `onActivate` the card is clickable and stays
 * open while hovered, so visitors can reach it from the pin.
 */
export const GeoMapInfoCard = ({
  projectName,
  addressLine = null,
  logoUrl = null,
  anchor = null,
  onActivate,
  onPointerEnter,
  onPointerLeave,
  className,
}: GeoMapInfoCardProps) => {
  const side = anchor?.side ?? 'below';
  const holdSyncKey = `${projectName}:${anchor?.x ?? ''}:${anchor?.y ?? ''}`;
  const holdZoneRef = useAdoptPointerHoldOnMount(onPointerEnter, holdSyncKey);
  const content = (
    <InfoCardContent projectName={projectName} addressLine={addressLine} logoUrl={logoUrl} />
  );
  const surfaceClass = cn(
    'geo-map-info-card__surface',
    onActivate && 'geo-map-info-card__surface--interactive',
  );

  return (
    <div
      className={cn(
        'pointer-events-none absolute z-10 w-[min(18.75rem,calc(100%-1.5rem))] -translate-x-1/2',
        anchor ? 'animate-geo-map-info-card-in' : FALLBACK_POSITION_CLASS,
        anchor && side === 'above' && '-translate-y-full',
        className,
      )}
      {...(anchor ? { style: { left: `${anchor.x}px`, top: `${anchor.y}px` } } : {})}
    >
      <div
        ref={holdZoneRef}
        className={cn('relative', onActivate && 'pointer-events-auto')}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        {anchor ? (
          <span
            className={cn(
              'geo-map-info-card__tail',
              side === 'above'
                ? 'geo-map-info-card__tail--above'
                : 'geo-map-info-card__tail--below',
            )}
            aria-hidden
          />
        ) : null}
        {onActivate && anchor ? (
          <span className={HOVER_BRIDGE_CLASS_BY_SIDE[side]} aria-hidden />
        ) : null}
        {onActivate ? (
          <button type="button" className={surfaceClass} onClick={onActivate}>
            {content}
          </button>
        ) : (
          <div className={surfaceClass}>{content}</div>
        )}
      </div>
    </div>
  );
};
