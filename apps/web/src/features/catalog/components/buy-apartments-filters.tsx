'use client';

import { useState, type ChangeEvent, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import type { ProjectFilterParams } from '@/features/catalog/utils/project-filters';
import { cn } from '@/shared/ui/cn';
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

/** Same vertical chrome as header “List property” (`h-9` + pill). */
const filterControlClassName = cn(
  'h-9 rounded-full border border-header-border bg-surface-elevated px-4',
  'text-sm font-medium leading-5',
);

/**
 * Compact filter bar — Figma `103:1437` buy chrome.
 * Controls match header List property height / pill shape.
 */
export const BuyApartmentsFilters = ({ filters, cities }: BuyApartmentsFiltersProps) => {
  const t = useTranslations('BuyPage');
  const catalogT = useTranslations('Catalog');

  return (
    <form
      method="get"
      className={cn(
        'sticky top-[4.5rem] z-[var(--z-sticky)] border-b border-header-border bg-canvas',
      )}
    >
      <div className="page-container flex flex-wrap items-end gap-x-4 gap-y-3 py-4">
        <FilterField label={t('filters.location')}>
          <Select
            name="city"
            size="fit"
            defaultValue={filters.city ?? ''}
            className={cn(filterControlClassName, 'min-w-[9.5rem] bg-band-mist/60')}
            aria-label={t('filters.location')}
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
              defaultValue={filters.minPrice}
              placeholder={t('filters.min')}
              aria-label={t('filters.min')}
            />
            <span className="shrink-0 text-ink-muted" aria-hidden>
              –
            </span>
            <GrowingPriceInput
              name="maxPrice"
              defaultValue={filters.maxPrice}
              placeholder={t('filters.max')}
              aria-label={t('filters.max')}
            />
          </div>
        </FilterField>

        <FilterField label={t('filters.beds')}>
          <Select
            name="rooms"
            size="fit"
            defaultValue={filters.rooms != null ? String(filters.rooms) : ''}
            className={cn(filterControlClassName, 'min-w-[5.5rem]')}
            aria-label={t('filters.beds')}
          >
            <option value="">{catalogT('filters.any')}</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4+</option>
          </Select>
        </FilterField>

        <FilterField label={t('filters.status')}>
          <Select
            name="salesStatus"
            size="fit"
            defaultValue={filters.salesStatus ?? 'available'}
            className={cn(filterControlClassName, 'min-w-[8.5rem]')}
            aria-label={t('filters.status')}
          >
            <option value="available">{catalogT('status.available')}</option>
            <option value="reserved">{catalogT('status.reserved')}</option>
            <option value="sold">{catalogT('status.sold')}</option>
          </Select>
        </FilterField>

        <button
          type="submit"
          className={cn(
            'inline-flex h-9 shrink-0 items-center justify-center rounded-full px-4',
            'bg-brand-deep text-sm font-semibold leading-5 whitespace-nowrap text-on-dark',
            'transition-[background-color,color] hover:bg-brand-deep/90',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/30',
            'lg:ml-auto',
          )}
        >
          {catalogT('filters.apply')}
        </button>
      </div>
    </form>
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
  defaultValue: number | null | undefined;
  placeholder: string;
  'aria-label': string;
};

/**
 * Digit field — `size` grows by one with every typed digit (not a fixed width).
 */
const GrowingPriceInput = ({
  name,
  defaultValue,
  placeholder,
  'aria-label': ariaLabel,
}: GrowingPriceInputProps) => {
  const [value, setValue] = useState(defaultValue != null ? String(defaultValue) : '');

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const next = event.target.value;
    if (!PRICE_DIGITS_ONLY.test(next)) {
      return;
    }
    setValue(next);
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
        'text-sm font-medium text-ink tabular-nums',
        'focus-visible:outline-none',
      )}
      aria-label={ariaLabel}
    />
  );
};
