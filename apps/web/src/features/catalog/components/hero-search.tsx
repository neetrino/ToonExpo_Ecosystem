'use client';

import type { ProjectListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';

import { HeroKeywordSearch } from '@/features/catalog/components/hero-keyword-search';
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
  /** Published projects for keyword suggestions. */
  projects?: readonly ProjectListItem[] | undefined;
};

const BED_OPTIONS = [1, 2, 3, 4] as const;

const POPULAR_CITY_KEYS = ['yerevan', 'gyumri', 'vanadzor', 'dilijan', 'tsaghkadzor'] as const;

type HeroSearchHrefInput = {
  q: string;
  cities: readonly string[];
  minPrice: number | null;
  maxPrice: number | null;
  rooms: readonly string[];
};

/**
 * Marketplace search card — keyword, location, price, and beds filters.
 * Stacks cleanly on small screens; desktop keeps the Figma horizontal row.
 */
export const HeroSearch = ({ className, locations = [], projects = [] }: HeroSearchProps) => {
  const t = useTranslations('HomePage.hero');
  const router = useRouter();
  const [q, setQ] = useState('');
  const [locationsSelected, setLocationsSelected] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [rooms, setRooms] = useState<string[]>([]);

  const popularCities = POPULAR_CITY_KEYS.map((key) => t(`popularCities.${key}`));
  const locationOptions = mergeLocationOptions(locations, popularCities);

  const bedOptions = BED_OPTIONS.map((count) => ({
    value: String(count),
    label: count >= 4 ? t('bedsFourPlus') : t('bedsValue', { count }),
  }));

  const hrefInput = (): HeroSearchHrefInput => ({
    q,
    cities: locationsSelected,
    minPrice,
    maxPrice,
    rooms,
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(buildProjectsHref(hrefInput()));
  };

  const applyPriceRange = (nextMin: number | null, nextMax: number | null): void => {
    setMinPrice(nextMin);
    setMaxPrice(nextMax);
    router.push(
      buildProjectsHref({
        q,
        cities: locationsSelected,
        minPrice: nextMin,
        maxPrice: nextMax,
        rooms,
      }),
    );
  };

  return (
    <div className={cn('w-full min-w-0', className)}>
      <form
        onSubmit={onSubmit}
        // Chrome iOS autofill injects `__gcruniqueid` on forms before React hydrates.
        suppressHydrationWarning
        className={cn(
          'w-full rounded-[20px] bg-surface-elevated p-2 lg:w-fit',
          'shadow-[0_20px_25px_-5px_rgb(9_43_68/0.05),0_8px_10px_-6px_rgb(9_43_68/0.05)]',
          'ring-1 ring-header-border',
        )}
      >
        <div
          className={cn(
            'grid grid-cols-1 gap-2 p-3 lg:items-center',
            'lg:grid-cols-[minmax(12rem,1fr)_minmax(11rem,14rem)_minmax(10rem,12rem)_minmax(7rem,9rem)_auto]',
          )}
        >
          <HeroKeywordSearch value={q} projects={projects} onChange={setQ} />

          <LocationSearchSelect
            className="lg:border-l lg:border-header-border lg:px-3 lg:py-2"
            values={locationsSelected}
            options={locationOptions}
            fieldLabel={t('locationLabel')}
            aria-label={t('locationLabel')}
            labels={{
              any: t('locationAny'),
              placeholder: t('locationPlaceholder'),
              search: t('locationSearch'),
              empty: t('locationEmpty'),
              selectedCount: (count) => t('locationSelectedCount', { count }),
            }}
            onChange={setLocationsSelected}
          />

          <PriceRangeSelect
            className="lg:border-l lg:border-header-border lg:px-3 lg:py-2"
            minPrice={minPrice}
            maxPrice={maxPrice}
            fieldLabel={t('priceLabel')}
            labels={{
              any: t('priceAny'),
              min: t('priceMin'),
              max: t('priceMax'),
              save: t('priceSave'),
              invalidRange: t('priceInvalidRange'),
            }}
            onApply={applyPriceRange}
          />

          <MultiListboxSelect
            className="lg:border-l lg:border-header-border lg:px-3 lg:py-2"
            aria-label={t('bedsLabel')}
            values={rooms}
            options={bedOptions}
            allLabel={t('bedsAny')}
            selectedCountLabel={(count) => t('bedsSelectedCount', { count })}
            variant="plain"
            size="full"
            heroBlock={{ label: t('bedsLabel') }}
            onChange={setRooms}
          />

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

const buildProjectsHref = (input: HeroSearchHrefInput): string => {
  const params = new URLSearchParams();
  const trimmedQ = input.q.trim();
  if (trimmedQ.length > 0) {
    params.set('q', trimmedQ);
  }

  if (input.cities.length > 0) {
    params.set('city', input.cities.join(','));
  }

  if (input.minPrice != null) {
    params.set('minPrice', String(input.minPrice));
  }
  if (input.maxPrice != null) {
    params.set('maxPrice', String(input.maxPrice));
  }

  if (input.rooms.length > 0) {
    params.set('rooms', input.rooms.join(','));
  }

  const query = params.toString();
  return query.length > 0 ? `/projects?${query}` : '/projects';
};
