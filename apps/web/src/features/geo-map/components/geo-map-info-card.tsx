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
  /** Opens the project; when omitted the card stays purely informational. */
  onActivate?: (() => void) | undefined;
  /** Keeps the card open while the pointer rests on it. */
  onPointerEnter?: (() => void) | undefined;
  onPointerLeave?: (() => void) | undefined;
  className?: string | undefined;
};

const FALLBACK_POSITION_CLASS = 'top-4 left-1/2 -translate-x-1/2';

const CARD_SURFACE_CLASS =
  'relative flex w-full items-center gap-3 rounded-[18px] bg-surface-elevated px-3 py-2.5 ' +
  'text-left shadow-lg ring-1 ring-header-border';

const CARD_INTERACTIVE_CLASS =
  'cursor-pointer transition-shadow duration-150 hover:shadow-xl focus-visible:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2';

/** Invisible strip across the pin gap so the pointer never leaves a hover area. */
const HOVER_BRIDGE_CLASS = "after:absolute after:inset-x-0 after:h-3 after:content-['']";

type InfoCardContentProps = Pick<GeoMapInfoCardProps, 'projectName' | 'addressLine' | 'logoUrl'>;

const InfoCardContent = ({ projectName, addressLine, logoUrl }: InfoCardContentProps) => {
  const t = useTranslations('GeoMap.hover');
  const initials = projectName.trim().slice(0, 2).toUpperCase() || '—';

  return (
    <>
      <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-border">
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
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-brand text-sm font-semibold tracking-[-0.02em] text-ink-navy">
          {projectName}
        </span>
        {addressLine ? (
          <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-secondary">
            <MapPin className="size-3 shrink-0 text-brand" strokeWidth={2} aria-hidden />
            <span className="truncate">{addressLine}</span>
          </span>
        ) : (
          <span className="mt-0.5 block text-xs font-medium text-brand-deep">
            {t('viewProject')}
          </span>
        )}
      </span>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-deep">
        <ArrowUpRight className="size-4" strokeWidth={2} aria-hidden />
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
  const content = (
    <InfoCardContent projectName={projectName} addressLine={addressLine} logoUrl={logoUrl} />
  );

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
      <div
        className={cn(
          'relative',
          onActivate && 'pointer-events-auto',
          onActivate && anchor && HOVER_BRIDGE_CLASS,
          onActivate && anchor && (side === 'above' ? 'after:top-full' : 'after:bottom-full'),
        )}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
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
        {onActivate ? (
          <button
            type="button"
            className={cn(CARD_SURFACE_CLASS, CARD_INTERACTIVE_CLASS)}
            onClick={onActivate}
          >
            {content}
          </button>
        ) : (
          <div className={CARD_SURFACE_CLASS}>{content}</div>
        )}
      </div>
    </div>
  );
};
