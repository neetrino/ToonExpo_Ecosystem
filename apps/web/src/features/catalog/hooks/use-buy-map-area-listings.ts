'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { listApartments } from '@/features/catalog/api/catalog-api';
import { BUY_MAP_AREA_MIN_ZOOM, BUY_MAP_AREA_PAGE_SIZE } from '@/features/catalog/constants';
import type { BuyApartmentListing } from '@/features/catalog/utils/load-buy-apartments';
import { toBuyApartmentListing } from '@/features/catalog/utils/load-buy-apartments';
import type { ProjectFilterParams } from '@/features/catalog/utils/project-filters';
import type { LngLatBounds } from '@/features/geo-map/utils/geo-bounds';

export type BuyMapViewport = {
  zoom: number;
  bounds: LngLatBounds | null;
};

const AREA_QUERY_KEY = ['catalog', 'buy-map-area'] as const;

/**
 * Published apartments whose project sits inside the current map viewport.
 * Inactive below district zoom so the city-wide list stays the SSR page.
 */
export const useBuyMapAreaListings = (
  viewport: BuyMapViewport | null,
  filters: ProjectFilterParams,
) => {
  const locale = useLocale();
  const bounds = viewport?.bounds ?? null;
  const enabled = viewport != null && viewport.zoom >= BUY_MAP_AREA_MIN_ZOOM && bounds != null;

  return useQuery({
    queryKey: [
      ...AREA_QUERY_KEY,
      locale,
      enabled ? bounds : null,
      filters.salesStatus ?? null,
      filters.minPrice ?? null,
      filters.maxPrice ?? null,
      filters.rooms ?? null,
      filters.city ?? null,
      filters.builderId ?? null,
      filters.q ?? null,
    ],
    enabled,
    queryFn: async (): Promise<BuyApartmentListing[]> => {
      if (bounds == null) {
        return [];
      }
      const response = await listApartments(
        {
          page: 1,
          pageSize: BUY_MAP_AREA_PAGE_SIZE,
          west: bounds.west,
          south: bounds.south,
          east: bounds.east,
          north: bounds.north,
          ...(filters.salesStatus ? { salesStatus: filters.salesStatus } : {}),
          ...(filters.minPrice != null ? { minPrice: filters.minPrice } : {}),
          ...(filters.maxPrice != null ? { maxPrice: filters.maxPrice } : {}),
          ...(filters.rooms != null && filters.rooms.length > 0 ? { rooms: filters.rooms } : {}),
          ...(filters.city ? { city: filters.city } : {}),
          ...(filters.builderId ? { builderId: filters.builderId } : {}),
          ...(filters.q ? { q: filters.q } : {}),
        },
        { locale, cacheMode: 'no-store' },
      );
      return response.data.map(toBuyApartmentListing);
    },
  });
};
