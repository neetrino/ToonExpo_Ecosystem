'use client';

import { useCallback, useState } from 'react';

import { GEO_MAP_ADDRESS_SEARCH_ZOOM } from '@/features/geo-map/admin/constants';
import { useGeocodeGeoMapAddressMutation } from '@/features/geo-map/admin/hooks/use-geo-map-admin';
import type { GeoMapViewRequest } from '@/features/geo-map/types';
import { isApiErrorStatus } from '@/shared/api/errors';

export type GeoMapAddressFlyToResult = 'ok' | 'not-found' | 'failed';

/**
 * Geocodes a typed address and flies the admin 3D map camera there.
 */
export const useGeoMapAddressFlyTo = () => {
  const geocodeMutation = useGeocodeGeoMapAddressMutation();
  const [viewRequest, setViewRequest] = useState<GeoMapViewRequest | undefined>(undefined);

  const goToAddress = useCallback(
    async (query: string): Promise<GeoMapAddressFlyToResult> => {
      const trimmed = query.trim();
      if (trimmed.length < 3) {
        return 'failed';
      }
      try {
        const response = await geocodeMutation.mutateAsync(trimmed);
        setViewRequest((previous) => ({
          center: {
            longitude: response.data.longitude,
            latitude: response.data.latitude,
          },
          zoom: GEO_MAP_ADDRESS_SEARCH_ZOOM,
          token: (previous?.token ?? 0) + 1,
        }));
        return 'ok';
      } catch (error) {
        return isApiErrorStatus(error, 404) ? 'not-found' : 'failed';
      }
    },
    [geocodeMutation],
  );

  return {
    viewRequest,
    goToAddress,
    isGeocoding: geocodeMutation.isPending,
  };
};
