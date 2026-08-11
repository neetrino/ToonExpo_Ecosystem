'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ProjectLiveSearch } from '@/features/catalog/components/project-live-search';
import { ProjectRoomsFilter } from '@/features/catalog/components/project-rooms-filter';
import type { ProjectFilterParams } from '@/features/catalog/utils/project-filters';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

type ProjectFiltersFormProps = {
  filters: ProjectFilterParams;
};

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
      className="rounded-md border border-border/70 bg-surface-elevated/95 p-4 shadow-sm backdrop-blur-sm sm:p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="size-4 text-brand" aria-hidden />
        <p className="text-sm font-semibold text-ink">{t('filters.title')}</p>
      </div>

      <div className="mb-3">
        <ProjectLiveSearch filters={filters} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <ProjectRoomsFilter rooms={filters.rooms} />

        <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-secondary">
          {t('filters.minPrice')}
          <Input
            type="number"
            name="minPrice"
            min={0}
            defaultValue={filters.minPrice ?? ''}
            placeholder={t('filters.pricePlaceholder')}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-secondary">
          {t('filters.maxPrice')}
          <Input
            type="number"
            name="maxPrice"
            min={0}
            defaultValue={filters.maxPrice ?? ''}
            placeholder={t('filters.pricePlaceholder')}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-secondary">
          {t('filters.salesStatus')}
          <Select name="salesStatus" defaultValue={filters.salesStatus ?? ''}>
            <option value="">{t('filters.any')}</option>
            <option value="available">{t('status.available')}</option>
            <option value="reserved">{t('status.reserved')}</option>
            <option value="sold">{t('status.sold')}</option>
          </Select>
        </label>

        <div className="flex items-end gap-2">
          {filters.city ? <input type="hidden" name="city" value={filters.city} /> : null}
          {filters.builderId ? (
            <input type="hidden" name="builderId" value={filters.builderId} />
          ) : null}
          <Button type="submit" variant="secondary" className="h-11 w-full">
            {t('filters.apply')}
          </Button>
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="mt-3">
          <Link href="/projects">
            <Button type="button" variant="outline" size="md" className="h-11">
              {t('filters.reset')}
            </Button>
          </Link>
        </div>
      ) : null}
    </form>
  );
};
