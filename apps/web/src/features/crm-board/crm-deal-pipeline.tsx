'use client';

import type { CrmDealStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { CRM_KANBAN_STATUSES } from '@/features/crm-board/constants';
import { cn } from '@/shared/ui/cn';

type CrmDealPipelineProps = {
  status: CrmDealStatus;
};

/**
 * Horizontal pipeline strip for deal sheet header.
 */
export const CrmDealPipeline = ({ status }: CrmDealPipelineProps) => {
  const t = useTranslations('CrmBoard.statuses');
  const activeIndex = CRM_KANBAN_STATUSES.indexOf(status);

  return (
    <ol className="flex flex-wrap gap-1.5" aria-label={t(status)}>
      {CRM_KANBAN_STATUSES.map((item, index) => {
        const isActive = item === status;
        const isPast = index < activeIndex;
        return (
          <li
            key={item}
            className={cn(
              'rounded-pill px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em]',
              'transition-colors duration-200',
              isActive
                ? 'bg-cta-dark text-on-dark shadow-xs'
                : isPast
                  ? 'bg-brand/12 text-brand'
                  : 'bg-surface text-ink-muted',
            )}
          >
            {t(item)}
          </li>
        );
      })}
    </ol>
  );
};
