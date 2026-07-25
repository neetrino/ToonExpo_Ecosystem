'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';

import { HeroSearchTabs, type HeroSearchTab } from '@/features/catalog/components/hero-search-tabs';
import { LocationSearchSelect } from '@/features/catalog/components/location-search-select';
import { PriceRangeSelect } from '@/features/catalog/components/price-range-select';
import { mergeLocationOptions } from '@/features/catalog/utils/location-options';
import { Link, useRouter } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { MultiListboxSelect } from '@/shared/ui/multi-listbox-select';

type HeroSearchProps = {
  className?: string | undefined;
  /** Cities from published catalog projects. */
  locations?: readonly string[] | undefined;
};

const BED_OPTIONS = [1, 2, 3, 4] as const;

const POPULAR_CITY_KEYS = ['yerevan', 'gyumri', 'vanadzor', 'dilijan', 'tsaghkadzor'] as const;

/**
 * Marketplace search card — Buy / Rent / New Builds tabs with location filters.
 * Stacks cleanly on small screens; desktop keeps the Figma horizontal row.
 */
export const HeroSearch = ({ className, locations = [] }: HeroSearchProps) => {
  const t = useTranslations('HomePage.hero');
  const router = useRouter();
  const [tab, setTab] = useState<HeroSearchTab>('buy');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [rooms, setRooms] = useState<string[]>([]);

  const popularCities = POPULAR_CITY_KEYS.map((key) => t(`popularCities.${key}`));
  const locationOptions = mergeLocationOptions(locations, popularCities);

  const bedOptions = BED_OPTIONS.map((count) => ({
    value: String(count),
    label: count >= 4 ? t('bedsFourPlus') : t('bedsValue', { count }),
  }));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(buildProjectsHref(location, minPrice, maxPrice, rooms, tab));
  };

  const applyPriceRange = (nextMin: number | null, nextMax: number | null): void => {
    setMinPrice(nextMin);
    setMaxPrice(nextMax);
    router.push(buildProjectsHref(location, nextMin, nextMax, rooms, tab));
  };

  return (
    <div className={cn('w-full min-w-0', className)}>
      <form
        onSubmit={onSubmit}
        className={cn(
          'w-full rounded-[20px] bg-surface-elevated p-2 lg:w-fit',
          'shadow-[0_20px_25px_-5px_rgb(9_43_68/0.05),0_8px_10px_-6px_rgb(9_43_68/0.05)]',
          'ring-1 ring-header-border',
        )}
      >
        <HeroSearchTabs
          activeTab={tab}
          listLabel={t('tabsLabel')}
          labels={{
            buy: t('tabs.buy'),
            rent: t('tabs.rent'),
            newBuilds: t('tabs.newBuilds'),
          }}
          onChange={setTab}
        />

        <div className="grid grid-cols-1 gap-2 p-3 lg:grid-cols-[minmax(11rem,15rem)_auto_auto_auto] lg:items-center">
          <div className="flex min-w-0 flex-col gap-1 px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-header-muted">
              {t('locationLabel')}
            </span>
            <LocationSearchSelect
              value={location}
              options={locationOptions}
              aria-label={t('locationLabel')}
              labels={{
                any: t('locationAny'),
                placeholder: t('locationPlaceholder'),
                search: t('locationSearch'),
                empty: t('locationEmpty'),
              }}
              onChange={setLocation}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-1 border-t border-header-border px-3 py-2 lg:border-t-0 lg:border-l">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-header-muted">
              {t('priceLabel')}
            </span>
            <PriceRangeSelect
              minPrice={minPrice}
              maxPrice={maxPrice}
              labels={{
                any: t('priceAny'),
                min: t('priceMin'),
                max: t('priceMax'),
                save: t('priceSave'),
                invalidRange: t('priceInvalidRange'),
              }}
              onApply={applyPriceRange}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-1 border-t border-header-border px-3 py-2 lg:border-t-0 lg:border-l">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-header-muted">
              {t('bedsLabel')}
            </span>
            <MultiListboxSelect
              aria-label={t('bedsLabel')}
              values={rooms}
              options={bedOptions}
              allLabel={t('bedsAny')}
              selectedCountLabel={(count) => t('bedsSelectedCount', { count })}
              variant="plain"
              size="fit"
              onChange={setRooms}
            />
          </div>

          <button
            type="submit"
            className={cn(
              'inline-flex h-[51px] w-full items-center justify-center rounded-[16px] bg-brand-deep px-6',
              'text-sm font-semibold text-on-dark transition-colors duration-[var(--duration-fast)]',
              'hover:bg-brand-deep/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/30',
              'lg:w-auto',
            )}
          >
            {t('search')}
          </button>
        </div>
      </form>

      <div className="mt-8 flex flex-col gap-2">
        <span className="text-sm font-medium leading-5 text-on-dark">{t('popular')}</span>
        <div className="flex flex-wrap gap-2">
          {POPULAR_CITY_KEYS.map((key) => {
            const city = t(`popularCities.${key}`);
            return (
              <Link
                key={key}
                href={`/projects?city=${encodeURIComponent(city)}`}
                className={cn(
                  'inline-flex h-7 cursor-pointer items-center rounded-pill px-3',
                  'bg-white/80 text-xs font-medium leading-4 text-ink-navy',
                  'ring-1 ring-header-border backdrop-blur-[6px]',
                  'transition-[background-color,color,box-shadow,transform] duration-[var(--duration-slow)] ease-[var(--ease-out-premium)]',
                  'hover:bg-white hover:text-brand-deep hover:shadow-[0_0_0_1px_rgb(26_143_152/0.35),0_2px_8px_rgb(14_15_20/0.06)]',
                  'active:scale-[0.98]',
                )}
              >
                {city}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const buildProjectsHref = (
  location: string,
  minPrice: number | null,
  maxPrice: number | null,
  rooms: readonly string[],
  tab: HeroSearchTab,
): string => {
  const params = new URLSearchParams();
  const trimmed = location.trim();
  if (trimmed.length > 0) {
    params.set('city', trimmed);
  }

  if (minPrice != null) {
    params.set('minPrice', String(minPrice));
  }
  if (maxPrice != null) {
    params.set('maxPrice', String(maxPrice));
  }

  if (rooms.length > 0) {
    params.set('rooms', rooms.join(','));
  }

  if (tab === 'newBuilds') {
    params.set('salesStatus', 'available');
  }

  const query = params.toString();
  return query.length > 0 ? `/projects?${query}` : '/projects';
};
