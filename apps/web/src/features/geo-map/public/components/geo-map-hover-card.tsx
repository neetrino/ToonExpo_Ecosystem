'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';

type GeoMapHoverCardProps = {
  projectName: string;
  className?: string | undefined;
};

/**
 * Small floating card when hovering a marker or 3D model on the public geo map.
 */
export const GeoMapHoverCard = ({ projectName, className }: GeoMapHoverCardProps) => {
  const t = useTranslations('GeoMap.hover');

  return (
    <div
      className={cn(
        'pointer-events-none absolute top-4 left-1/2 z-10 w-[min(18rem,calc(100%-2rem))] -translate-x-1/2',
        className,
      )}
    >
      <div
        className={cn(
          'rounded-[20px] bg-surface-elevated/95 px-4 py-3 shadow-lg ring-1 ring-header-border',
          'backdrop-blur-sm',
        )}
      >
        <p className="font-brand text-sm font-semibold tracking-[-0.02em] text-ink-navy">
          {projectName}
        </p>
        <p className="mt-1 text-xs font-medium text-brand-deep">{t('viewProject')}</p>
      </div>
    </div>
  );
};
