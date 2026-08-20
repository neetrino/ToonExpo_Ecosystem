'use client';

import { startTransition, useCallback, useEffect, useRef, useState } from 'react';

import { PROJECTS_SEARCH_DEBOUNCE_MS } from '@/features/catalog/constants/projects';
import {
  buildCatalogFilterHref,
  mergeLiveCatalogFilters,
  type CatalogListPath,
  type ProjectFilterParams,
  type ProjectFilterPatch,
} from '@/features/catalog/utils/project-filters';
import { useRouter } from '@/i18n/navigation';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';

export type LivePricePair = {
  minPrice: number | undefined;
  maxPrice: number | undefined;
};

const toPriceString = (value: number | undefined): string =>
  value != null ? String(value) : '';

const parsePriceInput = (value: string): number | undefined => {
  if (value.length === 0) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

/**
 * Replaces the catalog list URL as soon as a filter changes (shareable params).
 */
export const useLiveCatalogFilters = (
  pathname: CatalogListPath,
  filters: ProjectFilterParams,
): {
  replaceFilters: (patch: ProjectFilterPatch) => void;
} => {
  const router = useRouter();
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const replaceFilters = useCallback(
    (patch: ProjectFilterPatch): void => {
      const next = mergeLiveCatalogFilters(filtersRef.current, patch);
      startTransition(() => {
        router.replace(buildCatalogFilterHref(pathname, next), { scroll: false });
      });
    },
    [pathname, router],
  );

  return { replaceFilters };
};

/**
 * Debounced min/max price fields. Clearing a field applies immediately.
 */
export const useLivePriceInputs = (
  urlMin: number | undefined,
  urlMax: number | undefined,
  onCommit: (next: LivePricePair) => void,
): {
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (next: string) => void;
  onMaxPriceChange: (next: string) => void;
} => {
  const [minPrice, setMinPrice] = useState(toPriceString(urlMin));
  const [maxPrice, setMaxPrice] = useState(toPriceString(urlMax));
  const isUserInputRef = useRef(false);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  const urlMinString = toPriceString(urlMin);
  const urlMaxString = toPriceString(urlMax);
  const trimmedMin = minPrice.trim();
  const trimmedMax = maxPrice.trim();
  const debouncedMin = useDebouncedValue(trimmedMin, PROJECTS_SEARCH_DEBOUNCE_MS);
  const debouncedMax = useDebouncedValue(trimmedMax, PROJECTS_SEARCH_DEBOUNCE_MS);
  const activeMin = trimmedMin.length === 0 ? '' : debouncedMin;
  const activeMax = trimmedMax.length === 0 ? '' : debouncedMax;

  useEffect(() => {
    if (isUserInputRef.current) {
      return;
    }
    setMinPrice(urlMinString);
    setMaxPrice(urlMaxString);
  }, [urlMinString, urlMaxString]);

  useEffect(() => {
    if (!isUserInputRef.current) {
      return;
    }
    if (activeMin === urlMinString && activeMax === urlMaxString) {
      isUserInputRef.current = false;
      return;
    }
    onCommitRef.current({
      minPrice: parsePriceInput(activeMin),
      maxPrice: parsePriceInput(activeMax),
    });
  }, [activeMin, activeMax, urlMinString, urlMaxString]);

  return {
    minPrice,
    maxPrice,
    onMinPriceChange: (next: string): void => {
      isUserInputRef.current = true;
      setMinPrice(next);
    },
    onMaxPriceChange: (next: string): void => {
      isUserInputRef.current = true;
      setMaxPrice(next);
    },
  };
};
