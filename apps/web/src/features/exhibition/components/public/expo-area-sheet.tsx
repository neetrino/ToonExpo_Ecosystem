'use client';

import type { PublicVenueMapArea } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { resolveVenueMapAreaTitle } from '@/features/exhibition/utils/resolve-venue-map-area-title';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type ExpoAreaSheetProps = {
  area: PublicVenueMapArea;
  onClose: () => void;
};

/**
 * Selected-area details for the public venue map.
 */
export const ExpoAreaSheet = ({ area, onClose }: ExpoAreaSheetProps) => {
  const t = useTranslations('Expo.area');
  const title = resolveVenueMapAreaTitle(area);
  const showOccupant = area.displayMode !== 'hidden';

  return (
    <aside className="rounded-[20px] border border-header-border bg-surface-elevated p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-header-muted">
            {t(`modes.${area.displayMode}`)}
          </p>
          <h2 className="truncate text-base font-semibold text-ink-navy">{title}</h2>
          <p className="text-xs text-header-muted">
            {area.code} — {t('areaSqm', { value: area.areaSqm })}
          </p>
        </div>
        <button
          type="button"
          className={cn(
            'shrink-0 rounded-[12px] border border-header-border px-3 py-1.5',
            'text-sm font-semibold text-ink-navy transition-colors hover:border-brand/40',
          )}
          onClick={onClose}
        >
          {t('close')}
        </button>
      </div>

      {showOccupant && area.company?.href ? (
        <Link
          href={area.company.href}
          className={cn(
            'flex h-11 w-full items-center justify-center rounded-[12px]',
            'bg-brand text-sm font-semibold text-on-brand',
            'transition-colors hover:bg-brand-hover',
          )}
        >
          {t('openProfile')}
        </Link>
      ) : null}
    </aside>
  );
};
