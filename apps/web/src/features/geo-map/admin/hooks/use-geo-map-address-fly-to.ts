'use client';

import { useCallback, useState } from 'react';

import { GEO_MAP_ADDRESS_SEARCH_ZOOM } from '@/features/geo-map/admin/constants';
import { useGeocodeGeoMapAddressMutation } from '@/features/geo-map/admin/hooks/use-geo-map-admin';
import type { GeoMapLngLat, GeoMapViewRequest } from '@/features/geo-map/types';
import { isApiErrorStatus } from '@/shared/api/errors';

export type GeoMapAddressFlyToResult =
  | { status: 'ok'; center: GeoMapLngLat }
  | { status: 'not-found' }
  | { status: 'failed' };

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
        return { status: 'failed' };
      }
      try {
        const response = await geocodeMutation.mutateAsync(trimmed);
        const center = {
          longitude: response.data.longitude,
          latitude: response.data.latitude,
        };
        setViewRequest((previous) => ({
          center,
          zoom: GEO_MAP_ADDRESS_SEARCH_ZOOM,
          token: (previous?.token ?? 0) + 1,
        }));
        return { status: 'ok', center };
      } catch (error) {
        return { status: isApiErrorStatus(error, 404) ? 'not-found' : 'failed' };
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
