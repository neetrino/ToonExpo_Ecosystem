'use client';

import type { CrmDealStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { CRM_STATUS_BADGE } from '@/features/crm-board/constants';
import { cn } from '@/shared/ui/cn';

type CrmDealPipelineProps = {
  status: CrmDealStatus;
};

/**
 * Current deal status badge for the CRM sheet header (single pill, not full pipeline).
 * Soft tint matches the kanban column accent (e.g. follow-up → champagne accent).
 */
export const CrmDealPipeline = ({ status }: CrmDealPipelineProps) => {
  const t = useTranslations('CrmBoard.statuses');

  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-pill px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em]',
        CRM_STATUS_BADGE[status],
      )}
      aria-label={t(status)}
    >
      {t(status)}
    </span>
  );
};
