'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';

import { HeroSearchTabs, type HeroSearchTab } from '@/features/catalog/components/hero-search-tabs';
import { Link, useRouter } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type HeroSearchProps = {
  className?: string | undefined;
};

const DEFAULT_MIN_PRICE = 500_000;
const DEFAULT_MAX_PRICE = 2_000_000;
const DEFAULT_ROOMS = 2;

const PRICE_OPTIONS = [
  { min: 0, max: 250_000, labelKey: 'priceUnder250k' as const },
  { min: 250_000, max: 500_000, labelKey: 'price250to500' as const },
  { min: 500_000, max: 2_000_000, labelKey: 'price500to2m' as const },
  { min: 2_000_000, max: undefined, labelKey: 'priceOver2m' as const },
] as const;

const BED_OPTIONS = [1, 2, 3, 4] as const;

const POPULAR_CITY_KEYS = ['yerevan', 'gyumri', 'vanadzor', 'dilijan', 'tsaghkadzor'] as const;

/**
 * Marketplace search card — Buy / Rent / New Builds tabs with location filters.
 * Stacks cleanly on small screens; desktop keeps the Figma horizontal row.
 */
export const HeroSearch = ({ className }: HeroSearchProps) => {
  const t = useTranslations('HomePage.hero');
  const router = useRouter();
  const [tab, setTab] = useState<HeroSearchTab>('buy');
  const [location, setLocation] = useState('');
  const [priceKey, setPriceKey] = useState<string>('price500to2m');
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(buildProjectsHref(location, priceKey, rooms, tab));
  };

  return (
    <div className={cn('w-full min-w-0', className)}>
      <form
        onSubmit={onSubmit}
        className={cn(
          'overflow-hidden rounded-[20px] bg-surface-elevated p-2',
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

        <div className="grid grid-cols-1 gap-2 p-3 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-center">
          <label className="flex min-w-0 flex-col gap-1 px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-header-muted">
              {t('locationLabel')}
            </span>
            <input
              type="search"
              name="city"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder={t('locationPlaceholder')}
              className="w-full min-w-0 border-none bg-transparent p-0 text-sm font-medium text-ink-navy outline-none placeholder:text-ink-muted"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-1 border-t border-header-border px-3 py-2 lg:border-t-0 lg:border-l">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-header-muted">
              {t('priceLabel')}
            </span>
            <select
              name="price"
              value={priceKey}
              onChange={(event) => setPriceKey(event.target.value)}
              className="w-full min-w-0 cursor-pointer appearance-none border-none bg-transparent p-0 text-sm font-medium text-ink-navy outline-none"
            >
              {PRICE_OPTIONS.map((option) => (
                <option key={option.labelKey} value={option.labelKey}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1 border-t border-header-border px-3 py-2 lg:border-t-0 lg:border-l">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-header-muted">
              {t('bedsLabel')}
            </span>
            <select
              name="rooms"
              value={rooms}
              onChange={(event) => setRooms(Number.parseInt(event.target.value, 10))}
              className="w-full min-w-0 cursor-pointer appearance-none border-none bg-transparent p-0 text-sm font-medium text-ink-navy outline-none"
            >
              {BED_OPTIONS.map((count) => (
                <option key={count} value={count}>
                  {t('bedsValue', { count })}
                </option>
              ))}
            </select>
          </label>

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

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="shrink-0 text-xs font-normal leading-4 text-on-dark">{t('popular')}</span>
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
  );
};

const buildProjectsHref = (
  location: string,
  priceKey: string,
  rooms: number,
  tab: HeroSearchTab,
): string => {
  const params = new URLSearchParams();
  const trimmed = location.trim();
  if (trimmed.length > 0) {
    params.set('city', trimmed);
  }

  const price = PRICE_OPTIONS.find((option) => option.labelKey === priceKey);
  if (price) {
    if (price.min > 0) {
      params.set('minPrice', String(price.min));
    }
    if (price.max != null) {
      params.set('maxPrice', String(price.max));
    }
  } else {
    params.set('minPrice', String(DEFAULT_MIN_PRICE));
    params.set('maxPrice', String(DEFAULT_MAX_PRICE));
  }

  if (rooms > 0) {
    params.set('rooms', String(rooms));
  }

  if (tab === 'newBuilds') {
    params.set('salesStatus', 'available');
  }

  const query = params.toString();
  return query.length > 0 ? `/projects?${query}` : '/projects';
};
