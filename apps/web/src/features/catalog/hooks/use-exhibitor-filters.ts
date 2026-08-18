'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  parsePartnerFilters,
  type PartnerListFilters,
} from '@/features/catalog/utils/partner-filters';
import { writeExhibitorUrl } from '@/features/catalog/utils/write-exhibitor-url';

/**
 * Exhibitors URL + tab state without an App Router RSC navigation.
 */
export const useExhibitorFilters = (
  locale: string,
  initialFilters: PartnerListFilters,
): {
  filters: PartnerListFilters;
  applyFilters: (next: PartnerListFilters) => void;
} => {
  const [filters, setFilters] = useState(initialFilters);

  const applyFilters = useCallback(
    (next: PartnerListFilters): void => {
      setFilters(next);
      writeExhibitorUrl(locale, next);
    },
    [locale],
  );

  useEffect(() => {
    const onPopState = (): void => {
      setFilters(
        parsePartnerFilters(Object.fromEntries(new URLSearchParams(window.location.search))),
      );
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return { filters, applyFilters };
};
