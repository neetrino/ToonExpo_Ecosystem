'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';

type CrmKanbanScrollArrowsProps = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
  onHoverScrollStart: (direction: -1 | 1) => void;
  onHoverScrollStop: () => void;
};

/**
 * Edge chevrons — hover continuous scroll, click pages one column.
 */
export const CrmKanbanScrollArrows = ({
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
  onHoverScrollStart,
  onHoverScrollStop,
}: CrmKanbanScrollArrowsProps) => {
  const t = useTranslations('CrmBoard');

  return (
    <>
      <button
        type="button"
        className={cn('crm-kanban-scroll-arrow', 'crm-kanban-scroll-arrow--left')}
        aria-label={t('scrollColumnsLeft')}
        disabled={!canScrollLeft}
        onClick={onScrollLeft}
        onPointerEnter={() => {
          if (canScrollLeft) {
            onHoverScrollStart(-1);
          }
        }}
        onPointerLeave={onHoverScrollStop}
      >
        <ChevronLeft className="size-3.5" aria-hidden />
      </button>
      <button
        type="button"
        className={cn('crm-kanban-scroll-arrow', 'crm-kanban-scroll-arrow--right')}
        aria-label={t('scrollColumnsRight')}
        disabled={!canScrollRight}
        onClick={onScrollRight}
        onPointerEnter={() => {
          if (canScrollRight) {
            onHoverScrollStart(1);
          }
        }}
        onPointerLeave={onHoverScrollStop}
      >
        <ChevronRight className="size-3.5" aria-hidden />
      </button>
    </>
  );
};
