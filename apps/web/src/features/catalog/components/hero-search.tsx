'use client';

import type { ProjectListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';

import { HeroKeywordSearch } from '@/features/catalog/components/hero-keyword-search';
import { HomeHeroSearchGapNav } from '@/features/catalog/components/home-hero-nav-buttons';
import { LocationSearchSelect } from '@/features/catalog/components/location-search-select';
import { PriceRangeSelect } from '@/features/catalog/components/price-range-select';
import {
  HOME_PAYMENT_METHODS,
  HOME_PRICE_MILLION_AMD,
  isHomePaymentMethodId,
} from '@/features/catalog/constants/home-payment-methods';
import {
  expandCityFilterValues,
  mergeLocationOptions,
  POPULAR_CITY_KEYS,
} from '@/features/catalog/utils/location-options';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { MultiListboxSelect } from '@/shared/ui/multi-listbox-select';

type HeroSearchProps = {
  className?: string | undefined;
  locations?: readonly string[] | undefined;
  projects?: readonly ProjectListItem[] | undefined;
};

const CELL_CLASS = 'lg:border-l lg:border-header-border lg:px-3 lg:py-2';

/**
 * Home search card in the original horizontal hero row.
 * Price is millions of AMD; area is square meters.
 */
export const HeroSearch = ({ className, locations = [], projects = [] }: HeroSearchProps) => {
  const t = useTranslations('HomePage.hero');
  const router = useRouter();
  const [q, setQ] = useState('');
  const [locationsSelected, setLocationsSelected] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minArea, setMinArea] = useState<number | null>(null);
  const [maxArea, setMaxArea] = useState<number | null>(null);
  const [payment, setPayment] = useState<string[]>([]);

  const popularCities = POPULAR_CITY_KEYS.map((key) => t(`popularCities.${key}`));
  const locationOptions = mergeLocationOptions(locations, popularCities);
  const paymentOptions = HOME_PAYMENT_METHODS.map((method) => ({
    value: method.id,
    label: t(`paymentMethods.${method.id}`),
  }));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(
      buildProjectsHref({
        q,
        cities: locationsSelected,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        payment,
      }),
    );
  };

  return (
    <div className={cn('w-full min-w-0', className)}>
      <form
        onSubmit={onSubmit}
        suppressHydrationWarning
        className={cn(
          'w-full rounded-[20px] bg-surface-elevated p-2 lg:w-fit',
          'shadow-[0_20px_25px_-5px_rgb(25_38_67/0.05),0_8px_10px_-6px_rgb(25_38_67/0.05)]',
          'ring-1 ring-header-border',
        )}
      >
        <div
          className={cn(
            'grid grid-cols-1 gap-2 p-3 lg:items-center',
            'lg:grid-cols-[minmax(12rem,1fr)_minmax(10rem,13rem)_minmax(8.5rem,11rem)_minmax(8.5rem,11rem)_minmax(9rem,12rem)_auto]',
          )}
        >
          <div className="relative flex flex-col gap-2 lg:contents">
            <HeroKeywordSearch value={q} projects={projects} onChange={setQ} />
            <HomeHeroSearchGapNav />
            <LocationSearchSelect
              className={CELL_CLASS}
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
          </div>

          <PriceRangeSelect
            className={CELL_CLASS}
            minPrice={minPrice}
            maxPrice={maxPrice}
            fieldLabel={t('priceLabel')}
            valueSuffix={t('priceSuffix')}
            labels={rangeLabels(t, 'priceMin', 'priceMax')}
            onApply={(nextMin, nextMax) => {
              setMinPrice(nextMin);
              setMaxPrice(nextMax);
            }}
          />
          <PriceRangeSelect
            className={CELL_CLASS}
            minPrice={minArea}
            maxPrice={maxArea}
            fieldLabel={t('areaLabel')}
            valueSuffix={t('areaSuffix')}
            labels={rangeLabels(t, 'areaMin', 'areaMax')}
            onApply={(nextMin, nextMax) => {
              setMinArea(nextMin);
              setMaxArea(nextMax);
            }}
          />
          <MultiListboxSelect
            className={CELL_CLASS}
            aria-label={t('paymentLabel')}
            values={payment}
            options={paymentOptions}
            allLabel={t('paymentAny')}
            selectedCountLabel={(count) => t('paymentSelectedCount', { count })}
            variant="plain"
            size="full"
            heroBlock={{ label: t('paymentLabel') }}
            onChange={setPayment}
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
    </div>
  );
};

const rangeLabels = (
  t: ReturnType<typeof useTranslations<'HomePage.hero'>>,
  minKey: 'priceMin' | 'areaMin',
  maxKey: 'priceMax' | 'areaMax',
) => ({
  any: t('priceAny'),
  min: t(minKey),
  max: t(maxKey),
  save: t('priceSave'),
  invalidRange: t('rangeInvalid'),
});

const buildProjectsHref = (input: {
  q: string;
  cities: readonly string[];
  minPrice: number | null;
  maxPrice: number | null;
  minArea: number | null;
  maxArea: number | null;
  payment: readonly string[];
}): string => {
  const params = new URLSearchParams();
  const trimmedQ = input.q.trim();
  if (trimmedQ.length > 0) {
    params.set('q', trimmedQ);
  }
  if (input.cities.length > 0) {
    params.set('city', expandCityFilterValues(input.cities).join(','));
  }
  if (input.minPrice != null) {
    params.set('minPrice', String(input.minPrice * HOME_PRICE_MILLION_AMD));
  }
  if (input.maxPrice != null) {
    params.set('maxPrice', String(input.maxPrice * HOME_PRICE_MILLION_AMD));
  }
  if (input.minArea != null) {
    params.set('minArea', String(input.minArea));
  }
  if (input.maxArea != null) {
    params.set('maxArea', String(input.maxArea));
  }
  const payment = input.payment.filter(isHomePaymentMethodId);
  if (payment.length > 0) {
    params.set('payment', payment.join(','));
  }
  const query = params.toString();
  return query.length > 0 ? `/projects?${query}` : '/projects';
};
