'use client';

import { Columns3, LayoutGrid, List, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';
import { VIEW_MODE_CARDS, VIEW_MODE_LIST, type ViewMode } from '@/shared/ui/view-mode';

type ViewModeToggleProps = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  /**
   * CRM kanban — column blocks icon + “board” label instead of card grid.
   */
  cardsAsBoard?: boolean | undefined;
  className?: string | undefined;
};

/**
 * List/cards (or list/board) view switcher with a sliding thumb.
 * Hidden below `md` — mobile collections always use cards.
 */
export const ViewModeToggle = ({
  value,
  onChange,
  cardsAsBoard = false,
  className,
}: ViewModeToggleProps) => {
  const t = useTranslations('Common.viewMode');
  const cardsIcon: LucideIcon = cardsAsBoard ? Columns3 : LayoutGrid;
  const cardsLabelKey = cardsAsBoard ? ('board' as const) : ('cards' as const);

  const options = [
    { mode: VIEW_MODE_LIST, Icon: List, labelKey: 'list' as const },
    { mode: VIEW_MODE_CARDS, Icon: cardsIcon, labelKey: cardsLabelKey },
  ] as const;

  return (
    <div
      role="group"
      aria-label={t('label')}
      className={cn(
        'relative hidden h-9 items-center gap-0.5 rounded-[15px] bg-surface p-0.5 ring-1 ring-border md:inline-flex',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-0.5 left-0.5 size-8 rounded-[15px] bg-background shadow-xs',
          'transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
          'motion-reduce:transition-none',
          value === VIEW_MODE_CARDS && 'translate-x-[calc(100%+0.125rem)]',
        )}
      />
      {options.map(({ mode, Icon, labelKey }) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            aria-label={t(labelKey)}
            aria-pressed={active}
            title={t(labelKey)}
            className={cn(
              'relative z-10 inline-flex size-8 items-center justify-center rounded-[15px]',
              'text-ink-muted transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-premium)]',
              'hover:text-ink motion-reduce:transition-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
              active && 'text-ink',
            )}
            onClick={() => {
              onChange(mode);
            }}
          >
            <Icon className="size-4" strokeWidth={1.75} aria-hidden />
          </button>
        );
      })}
    </div>
  );
};
