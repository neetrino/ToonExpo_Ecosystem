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
              'rounded-pill px-2 py-1 text-[10px] font-medium uppercase tracking-wide',
              isActive
                ? 'bg-cta-dark text-on-dark'
                : isPast
                  ? 'bg-brand/15 text-brand'
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
