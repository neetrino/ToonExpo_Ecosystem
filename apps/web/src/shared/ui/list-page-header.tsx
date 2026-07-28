'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { IntegratedSearchFilters } from '@/shared/ui/integrated-search-filters';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import { cn } from '@/shared/ui/cn';

export type ListPageHeaderProps = {
  title: string;
  subtitle?: string | undefined;
  eyebrow?: string | undefined;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchAriaLabel: string;
  filters?: readonly IntegratedSearchFilterConfig[] | undefined;
  filterValues?: Record<string, string> | undefined;
  onFilterChange?: ((key: string, value: string) => void) | undefined;
  onClearAll?: (() => void) | undefined;
  actions?: ReactNode | undefined;
  /** Overrides default search slot width (`min-w-[12rem] max-w-md flex-1`). */
  searchClassName?: string | undefined;
  className?: string | undefined;
};

/**
 * One-row list chrome: title left, integrated search + actions right (NBOS / Admin CRM).
 */
export const ListPageHeader = ({
  title,
  subtitle,
  eyebrow,
  search,
  onSearchChange,
  searchPlaceholder,
  searchAriaLabel,
  filters,
  filterValues,
  onFilterChange,
  onClearAll,
  actions,
  searchClassName,
  className,
}: ListPageHeaderProps) => {
  const t = useTranslations('Common.integratedSearch');

  return (
    <div className={cn('flex shrink-0 flex-col gap-1', className)}>
      {eyebrow ? <p className="crm-board-page__eyebrow">{eyebrow}</p> : null}
      <div className="flex flex-nowrap items-center justify-between gap-3">
        <h1 className="min-w-0 shrink text-page-title text-ink">{title}</h1>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <div className={cn('relative min-w-[12rem] max-w-md flex-1', searchClassName)}>
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
              onClearAll={onClearAll}
            />
          </div>
          {actions}
        </div>
      </div>
      {subtitle ? <p className="truncate text-sm text-ink-secondary">{subtitle}</p> : null}
    </div>
  );
};
