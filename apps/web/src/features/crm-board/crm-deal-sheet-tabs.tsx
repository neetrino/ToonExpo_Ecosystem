'use client';

import { useTranslations } from 'next-intl';

import {
  CRM_DEAL_SHEET_TABS,
  type CrmDealSheetTab,
} from '@/features/crm-board/constants';
import { useCrmDealTabIndicator } from '@/features/crm-board/use-crm-deal-tab-indicator';
import { cn } from '@/shared/ui/cn';

type CrmDealSheetTabsProps = {
  active: CrmDealSheetTab;
  onChange: (tab: CrmDealSheetTab) => void;
};

/**
 * Deal / Payment / Notes switcher with a sliding underline.
 */
export const CrmDealSheetTabs = ({ active, onChange }: CrmDealSheetTabsProps) => {
  const t = useTranslations('CrmBoard.tabs');
  const { listRef, setTabRef, indicator } = useCrmDealTabIndicator(active);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={t('ariaLabel')}
      className="crm-deal-sheet-tabs"
    >
      <span
        aria-hidden
        className={cn(
          'crm-deal-sheet-tabs__indicator',
          indicator.width > 0 ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
        }}
      />
      {CRM_DEAL_SHEET_TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            ref={setTabRef(tab)}
            type="button"
            role="tab"
            id={`crm-sheet-tab-${tab}`}
            aria-selected={isActive}
            aria-controls={`crm-sheet-panel-${tab}`}
            className={cn(
              'relative px-3 py-2 text-sm',
              'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-premium)]',
              'motion-reduce:transition-none',
              isActive ? 'font-semibold text-ink' : 'font-medium text-ink-muted hover:text-ink',
            )}
            onClick={() => {
              onChange(tab);
            }}
          >
            {t(tab)}
          </button>
        );
      })}
    </div>
  );
};
