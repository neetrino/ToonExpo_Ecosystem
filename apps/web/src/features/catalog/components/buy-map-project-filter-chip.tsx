'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type BuyMapProjectFilterChipProps = {
  projectName: string;
  projectHref: `/projects/${string}`;
  onClear: () => void;
};

/**
 * Active map→list project filter chip: project name, open-project link, clear.
 */
export const BuyMapProjectFilterChip = ({
  projectName,
  projectHref,
  onClear,
}: BuyMapProjectFilterChipProps) => {
  const t = useTranslations('BuyPage');

  return (
    <div
      className={cn(
        'mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-header-border',
        'bg-band-mist/50 px-3 py-2 text-sm',
      )}
      role="status"
      aria-live="polite"
    >
      <span className="font-medium text-ink-navy">
        {t('mapProjectFilter', { project: projectName })}
      </span>
      <Link
        href={projectHref}
        className={cn(
          'font-semibold text-brand-deep underline-offset-2 hover:underline',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/30',
        )}
      >
        {t('openProject')}
      </Link>
      <button
        type="button"
        onClick={onClear}
        className={cn(
          'ml-auto inline-flex h-8 items-center gap-1 rounded-full px-3',
          'bg-surface-elevated text-xs font-semibold text-ink-navy ring-1 ring-header-border',
          'transition-colors hover:bg-canvas',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/30',
        )}
      >
        <X className="size-3.5" aria-hidden />
        {t('clearMapFilter')}
      </button>
    </div>
  );
};
