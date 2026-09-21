'use client';

import { useTranslations } from 'next-intl';

import {
  FLOOR_PLAN_SALES_LEGEND_STATUSES,
  FLOOR_PLAN_SALES_SWATCH_CLASS,
} from '@/features/visual-map/constants';

/**
 * Color key for public floor-plan apartment fills (available / reserved / sold).
 */
export const FloorPlanSalesLegend = () => {
  const t = useTranslations('Catalog.visualMap');
  const tStatus = useTranslations('Catalog.status');

  return (
    <ul className="flex flex-wrap items-center gap-3" aria-label={t('legend')}>
      {FLOOR_PLAN_SALES_LEGEND_STATUSES.map((status) => (
        <li key={status} className="flex items-center gap-1.5 text-xs text-ink-secondary">
          <span
            className={`size-2.5 shrink-0 rounded-sm ${FLOOR_PLAN_SALES_SWATCH_CLASS[status]}`}
            aria-hidden="true"
          />
          {tStatus(status)}
        </li>
      ))}
    </ul>
  );
};
