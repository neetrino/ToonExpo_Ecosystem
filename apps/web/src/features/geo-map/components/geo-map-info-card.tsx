'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { GEO_MAP_INFO_CARD_LOGO_PX } from '@/features/geo-map/constants';
import { cn } from '@/shared/ui/cn';

type GeoMapInfoCardProps = {
  projectName: string;
  logoUrl?: string | null | undefined;
  className?: string | undefined;
};

/**
 * Shared hover/select popover for geo-map objects — logo + project name.
 * Mounted by `GeoMapCanvas` so home, /map, and apartments share one UX.
 */
export const GeoMapInfoCard = ({ projectName, logoUrl = null, className }: GeoMapInfoCardProps) => {
  const t = useTranslations('GeoMap.hover');
  const initials = projectName.trim().slice(0, 2).toUpperCase() || '—';

  return (
    <div
      className={cn(
        'pointer-events-none absolute top-4 left-1/2 z-10 w-[min(20rem,calc(100%-2rem))] -translate-x-1/2',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 rounded-[20px] bg-surface-elevated/95 px-3 py-2.5',
          'shadow-lg ring-1 ring-header-border backdrop-blur-sm',
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
          <p className="mt-0.5 text-xs font-medium text-brand-deep">{t('viewProject')}</p>
        </div>
      </div>
    </div>
  );
};
