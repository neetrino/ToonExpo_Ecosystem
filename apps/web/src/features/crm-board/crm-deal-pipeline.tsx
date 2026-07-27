'use client';

import type { CrmDealStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

type CrmDealPipelineProps = {
  status: CrmDealStatus;
};

/**
 * Current deal status badge for the CRM sheet header (single pill, not full pipeline).
 */
export const CrmDealPipeline = ({ status }: CrmDealPipelineProps) => {
  const t = useTranslations('CrmBoard.statuses');

  return (
    <span
      className="inline-flex shrink-0 rounded-pill bg-cta-dark px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-on-dark shadow-xs"
      aria-label={t(status)}
    >
      {t(status)}
    </span>
  );
};
