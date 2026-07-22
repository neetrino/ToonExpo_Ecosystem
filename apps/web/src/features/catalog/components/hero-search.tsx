'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';

import { Link, useRouter } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type HeroSearchTab = 'buy' | 'rent' | 'newBuilds';

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

const TAB_KEYS: readonly HeroSearchTab[] = ['buy', 'rent', 'newBuilds'];

/**
 * Marketplace search card — Buy / Rent / New Builds tabs with location filters.
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
    <div className={cn('w-full', className)}>
      <form
        onSubmit={onSubmit}
        className={cn(
          'overflow-hidden rounded-[20px] bg-surface-elevated p-2',
          'shadow-[0_20px_25px_-5px_rgb(9_43_68/0.05),0_8px_10px_-6px_rgb(9_43_68/0.05)]',
          'ring-1 ring-header-border',
        )}
      >
        <div
          className="flex border-b border-header-border"
          role="tablist"
          aria-label={t('tabsLabel')}
        >
          {TAB_KEYS.map((key) => {
            const isActive = tab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(key)}
                className={cn(
                  'px-5 py-3 text-sm font-semibold transition-colors duration-[var(--duration-fast)]',
                  isActive
                    ? 'border-b-2 border-brand-secondary text-brand-deep'
                    : 'border-b-2 border-transparent text-header-muted hover:text-brand-deep',
                )}
              >
                {t(`tabs.${key}`)}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-[1.5fr_1fr_1fr_auto] sm:items-center">
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
              className="w-full border-none bg-transparent p-0 text-sm font-medium text-ink-navy outline-none placeholder:text-ink-muted"
            />
          </label>

          <label className="flex flex-col gap-1 border-t border-header-border px-3 py-2 sm:border-t-0 sm:border-l">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-header-muted">
              {t('priceLabel')}
            </span>
            <select
              name="price"
              value={priceKey}
              onChange={(event) => setPriceKey(event.target.value)}
              className="w-full cursor-pointer appearance-none border-none bg-transparent p-0 text-sm font-medium text-ink-navy outline-none"
            >
              {PRICE_OPTIONS.map((option) => (
                <option key={option.labelKey} value={option.labelKey}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 border-t border-header-border px-3 py-2 sm:border-t-0 sm:border-l">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-header-muted">
              {t('bedsLabel')}
            </span>
            <select
              name="rooms"
              value={rooms}
              onChange={(event) => setRooms(Number.parseInt(event.target.value, 10))}
              className="w-full cursor-pointer appearance-none border-none bg-transparent p-0 text-sm font-medium text-ink-navy outline-none"
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
              'inline-flex h-[51px] items-center justify-center rounded-md bg-brand-deep px-6',
              'text-sm font-semibold text-on-dark transition-colors duration-[var(--duration-fast)]',
              'hover:bg-brand-deep/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/30',
            )}
          >
            {t('search')}
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-header-muted">{t('popular')}</span>
        {POPULAR_CITY_KEYS.map((key) => {
          const city = t(`popularCities.${key}`);
          return (
            <Link
              key={key}
              href={`/projects?city=${encodeURIComponent(city)}`}
              className={cn(
                'rounded-pill bg-surface-elevated/80 px-3 py-1.5 text-xs font-medium text-ink-navy',
                'ring-1 ring-header-border backdrop-blur-[6px]',
                'transition-colors duration-[var(--duration-fast)]',
                'hover:bg-surface-elevated hover:ring-brand/30',
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
