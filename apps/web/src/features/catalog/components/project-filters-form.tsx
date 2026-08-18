'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ProjectLiveSearch } from '@/features/catalog/components/project-live-search';
import { ProjectRoomsFilter } from '@/features/catalog/components/project-rooms-filter';
import type { ProjectFilterParams } from '@/features/catalog/utils/project-filters';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

type ProjectFiltersFormProps = {
  filters: ProjectFilterParams;
};

/** Compact control height for the projects filter toolbar. */
const FILTER_CONTROL_CLASS = 'h-10 px-3.5 text-sm';
const FILTER_FIELD_CLASS =
  'flex min-w-0 flex-col gap-1 text-xs font-medium text-ink-secondary';
const FILTER_PRICE_MOBILE_CLASS =
  'col-span-3 row-start-2 sm:col-auto sm:row-auto sm:min-w-[6.5rem] sm:flex-none';

/**
 * SSR-friendly GET filters for the projects catalog (shareable URL params).
 * Keyword search updates live; other filters still submit via Apply.
 */
export const ProjectFiltersForm = ({ filters }: ProjectFiltersFormProps) => {
  const t = useTranslations('Catalog');
  const hasActiveFilters =
    Boolean(filters.q) ||
    filters.rooms != null ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    Boolean(filters.salesStatus) ||
    Boolean(filters.city) ||
    Boolean(filters.builderId);

  return (
    <form
      method="get"
      className="rounded-md border border-border/70 bg-surface-elevated/95 p-3 shadow-sm backdrop-blur-sm sm:p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <SlidersHorizontal className="size-3.5 text-brand" aria-hidden />
        <p className="text-xs font-semibold text-ink">{t('filters.title')}</p>
      </div>

      <div className="grid grid-cols-6 items-end gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
        <div className="col-span-6 min-w-0 sm:min-w-[10rem] sm:flex-1 sm:basis-[12rem]">
          <ProjectLiveSearch filters={filters} controlClassName={FILTER_CONTROL_CLASS} />
        </div>

        <label className={cn(FILTER_FIELD_CLASS, FILTER_PRICE_MOBILE_CLASS)}>
          {t('filters.minPrice')}
          <Input
            type="number"
            name="minPrice"
            min={0}
            defaultValue={filters.minPrice ?? ''}
            placeholder={t('filters.pricePlaceholder')}
            className={FILTER_CONTROL_CLASS}
          />
        </label>

        <label className={cn(FILTER_FIELD_CLASS, FILTER_PRICE_MOBILE_CLASS)}>
          {t('filters.maxPrice')}
          <Input
            type="number"
            name="maxPrice"
            min={0}
            defaultValue={filters.maxPrice ?? ''}
            placeholder={t('filters.pricePlaceholder')}
            className={FILTER_CONTROL_CLASS}
          />
        </label>

        <div className="col-span-6 row-start-3 flex min-w-0 items-end gap-2 sm:contents">
          <div className="w-fit shrink-0">
            <ProjectRoomsFilter rooms={filters.rooms} controlClassName={FILTER_CONTROL_CLASS} />
          </div>

          <label className={cn(FILTER_FIELD_CLASS, 'min-w-0 flex-1 sm:min-w-[8rem] sm:flex-none')}>
            {t('filters.salesStatus')}
            <Select
              name="salesStatus"
              defaultValue={filters.salesStatus ?? ''}
              className={FILTER_CONTROL_CLASS}
            >
              <option value="">{t('filters.any')}</option>
              <option value="available">{t('status.available')}</option>
              <option value="reserved">{t('status.reserved')}</option>
              <option value="sold">{t('status.sold')}</option>
            </Select>
          </label>

          <div className="flex shrink-0 items-end gap-1.5 sm:gap-2">
            {filters.city ? <input type="hidden" name="city" value={filters.city} /> : null}
            {filters.builderId ? (
              <input type="hidden" name="builderId" value={filters.builderId} />
            ) : null}
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="h-10 min-w-[5rem] rounded-sm px-4 sm:min-w-[6.5rem] sm:px-6"
            >
              {t('filters.apply')}
            </Button>
            {hasActiveFilters ? (
              <Link href="/projects">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-sm px-3 sm:px-5"
                >
                  {t('filters.reset')}
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
};
