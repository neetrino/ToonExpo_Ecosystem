'use client';

import { type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import {
  useLiveCatalogFilters,
  useLivePriceInputs,
} from '@/features/catalog/hooks/use-live-catalog-filters';
import {
  CATALOG_APARTMENTS_PATH,
  parseRoomsFilterValue,
  parseSalesStatusFilter,
  type ProjectFilterParams,
} from '@/features/catalog/utils/project-filters';
import { cn } from '@/shared/ui/cn';
import { Form } from '@/shared/ui/form';
import { Select } from '@/shared/ui/select';

type BuyApartmentsFiltersProps = {
  filters: ProjectFilterParams;
  cities: string[];
};

const PRICE_DIGITS_ONLY = /^\d*$/;
/** Empty / short values still show a usable field. */
const PRICE_INPUT_MIN_SIZE = 3;
/** Extra slot so the caret never sits flush against the edge. */
const PRICE_INPUT_CARET_ROOM = 1;

/** Shared filter control chrome (`h-9` + pill). */
const filterControlClassName = cn(
  'h-9 rounded-full border border-header-border bg-surface-elevated px-4',
  'text-sm font-medium leading-5',
);

/**
 * Compact filter bar — Figma `103:1437` buy chrome.
 * Filters apply live; price fields debounce while typing.
 */
export const BuyApartmentsFilters = ({ filters, cities }: BuyApartmentsFiltersProps) => {
  const t = useTranslations('BuyPage');
  const catalogT = useTranslations('Catalog');
  const { replaceFilters } = useLiveCatalogFilters(CATALOG_APARTMENTS_PATH, filters);
  const prices = useLivePriceInputs(filters.minPrice, filters.maxPrice, replaceFilters);
  const roomsValue =
    filters.rooms != null && filters.rooms.length === 1
      ? String(filters.rooms[0])
      : filters.rooms != null && filters.rooms.length > 1
        ? filters.rooms.join(',')
        : '';

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className={cn(
        'sticky top-[4.5rem] z-[var(--z-sticky)] border-b border-header-border bg-canvas',
      )}
    >
      <div className="page-container flex flex-wrap items-end gap-x-4 gap-y-3 py-4">
        <FilterField label={t('filters.location')}>
          <Select
            name="city"
            size="fit"
            value={filters.city ?? ''}
            className={cn(filterControlClassName, 'min-w-[9.5rem] bg-band-mist/60')}
            aria-label={t('filters.location')}
            onChange={(event) => {
              const city = event.target.value.trim();
              replaceFilters({ city: city.length > 0 ? city : undefined });
            }}
          >
            <option value="">{t('filters.allCities')}</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField label={t('filters.price')} shrink={false}>
          <div className={cn(filterControlClassName, 'flex w-fit shrink-0 items-center gap-2')}>
            <GrowingPriceInput
              name="minPrice"
              value={prices.minPrice}
              onValueChange={prices.onMinPriceChange}
              placeholder={t('filters.min')}
              aria-label={t('filters.min')}
            />
            <span className="shrink-0 text-ink-muted" aria-hidden>
              –
            </span>
            <GrowingPriceInput
              name="maxPrice"
              value={prices.maxPrice}
              onValueChange={prices.onMaxPriceChange}
              placeholder={t('filters.max')}
              aria-label={t('filters.max')}
            />
          </div>
        </FilterField>

        <FilterField label={t('filters.beds')}>
          <Select
            name="rooms"
            size="fit"
            value={roomsValue}
            className={cn(filterControlClassName, 'min-w-[5.5rem]')}
            aria-label={t('filters.beds')}
            onChange={(event) => {
              replaceFilters({ rooms: parseRoomsFilterValue(event.target.value) });
            }}
          >
            <option value="">{catalogT('filters.any')}</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4+</option>
            {filters.rooms != null && filters.rooms.length > 1 ? (
              <option value={filters.rooms.join(',')}>
                {filters.rooms.map((count) => (count >= 4 ? '4+' : String(count))).join(', ')}
              </option>
            ) : null}
          </Select>
        </FilterField>

        <FilterField label={t('filters.status')}>
          <Select
            name="salesStatus"
            size="fit"
            value={filters.salesStatus ?? 'available'}
            className={cn(filterControlClassName, 'min-w-[8.5rem]')}
            aria-label={t('filters.status')}
            onChange={(event) => {
              replaceFilters({
                salesStatus: parseSalesStatusFilter(event.target.value) ?? 'available',
              });
            }}
          >
            <option value="available">{catalogT('status.available')}</option>
            <option value="reserved">{catalogT('status.reserved')}</option>
            <option value="sold">{catalogT('status.sold')}</option>
          </Select>
        </FilterField>
      </div>
    </Form>
  );
};

const FilterField = ({
  label,
  children,
  shrink = true,
}: {
  label: string;
  children: ReactNode;
  shrink?: boolean;
}) => (
  <label className={cn('flex flex-col gap-1.5', shrink ? 'min-w-0' : 'shrink-0')}>
    <span className="text-[10px] font-bold tracking-widest text-header-muted uppercase">
      {label}
    </span>
    {children}
  </label>
);

type GrowingPriceInputProps = {
  name: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  'aria-label': string;
};

/**
 * Digit field — `size` grows by one with every typed digit (not a fixed width).
 */
const GrowingPriceInput = ({
  name,
  value,
  onValueChange,
  placeholder,
  'aria-label': ariaLabel,
}: GrowingPriceInputProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const next = event.target.value;
    if (!PRICE_DIGITS_ONLY.test(next)) {
      return;
    }
    onValueChange(next);
  };

  const fieldSize = Math.max(
    value.length + PRICE_INPUT_CARET_ROOM,
    placeholder.length,
    PRICE_INPUT_MIN_SIZE,
  );

  return (
    <input
      type="text"
      name={name}
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      value={value}
      size={fieldSize}
      onChange={handleChange}
      placeholder={placeholder}
      className={cn(
        'w-auto min-w-0 border-0 bg-transparent p-0',
        'text-base font-medium text-ink tabular-nums lg:text-sm',
        'focus-visible:outline-none',
      )}
      aria-label={ariaLabel}
      suppressHydrationWarning
    />
  );
};
