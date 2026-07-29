'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { loadDiscoverApartments } from '@/features/discover/utils/load-discover-apartments';

export const DISCOVER_APARTMENTS_QUERY_KEY = ['discover', 'apartments'] as const;

/**
 * Available apartments for the mobile discover / swipe deck.
 */
export const useDiscoverApartmentsQuery = () => {
  const locale = useLocale();

  return useQuery({
    queryKey: [...DISCOVER_APARTMENTS_QUERY_KEY, locale] as const,
    queryFn: () => loadDiscoverApartments(locale),
  });
};
