'use client';

import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { IntegratedSearchFilters } from '@/shared/ui/integrated-search-filters';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import { cn } from '@/shared/ui/cn';
import { Reveal } from '@/shared/ui/motion';
import { PageTitleBlock } from '@/shared/ui/page-title-icon';

export type ListPageHeaderProps = {
  title: string;
  subtitle?: string | undefined;
  eyebrow?: string | undefined;
  /** Analytics-style leading icon beside the title. */
  icon?: LucideIcon | undefined;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchAriaLabel: string;
  filters?: readonly IntegratedSearchFilterConfig[] | undefined;
  filterValues?: Record<string, string> | undefined;
  onFilterChange?: ((key: string, value: string) => void) | undefined;
  onApplyFilters?: ((draftFilters: Record<string, string>) => void) | undefined;
  onDraftFilterChange?: ((draftFilters: Record<string, string>) => void) | undefined;
  onPanelOpenChange?: ((open: boolean) => void) | undefined;
  onClearAll?: (() => void) | undefined;
  actions?: ReactNode | undefined;
  /** Overrides default search slot width (`min-w-[12rem] max-w-md flex-1`). */
  searchClassName?: string | undefined;
  className?: string | undefined;
};

/**
 * List chrome: title + search. Mobile stacks search under the title;
 * `md+` keeps title left and search/actions right.
 */
export const ListPageHeader = ({
  title,
  subtitle,
  eyebrow,
  icon,
  search,
  onSearchChange,
  searchPlaceholder,
  searchAriaLabel,
  filters,
  filterValues,
  onFilterChange,
  onApplyFilters,
  onDraftFilterChange,
  onPanelOpenChange,
  onClearAll,
  actions,
  searchClassName,
  className,
}: ListPageHeaderProps) => {
  const t = useTranslations('Common.integratedSearch');

  return (
    <Reveal force>
      <div className={cn('flex shrink-0 flex-col gap-1', className)}>
        {eyebrow ? <p className="crm-board-page__eyebrow">{eyebrow}</p> : null}
        <div className="flex flex-col gap-3 md:flex-row md:flex-nowrap md:items-center md:justify-between">
          <PageTitleBlock
            title={title}
            {...(subtitle ? { subtitle } : {})}
            {...(icon ? { icon } : {})}
            className="min-w-0 shrink"
          />
          <div className="flex w-full min-w-0 items-center gap-2 md:flex-1 md:justify-end max-md:flex-wrap">
            <div
              className={cn(
                'relative w-full min-w-0 md:min-w-[12rem] md:max-w-md md:flex-1',
                searchClassName,
              )}
            >
              <IntegratedSearchFilters
                search={search}
                searchPlaceholder={searchPlaceholder}
                searchAriaLabel={searchAriaLabel}
                filters={filters}
                filterValues={filterValues}
                applyLabel={t('apply')}
                resetLabel={t('reset')}
                clearAllAriaLabel={t('clearAll')}
                panelAriaLabel={t('panelLabel')}
                removeChipAriaLabel={(chipLabel) => t('removeChip', { label: chipLabel })}
                panelAlign="end"
                onSearchChange={onSearchChange}
                onFilterChange={onFilterChange}
                onDraftFilterChange={onDraftFilterChange}
                onPanelOpenChange={onPanelOpenChange}
                onClearAll={onClearAll}
              />
            </div>
            {actions}
          </div>
        </div>
      </div>
    </Reveal>
  );
};
