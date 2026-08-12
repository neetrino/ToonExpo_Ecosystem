'use client';

import { useQuery } from '@tanstack/react-query';

import { getPublicVenueMapCurrent } from '@/features/exhibition/api/public-venue-map-api';
import {
  PUBLIC_VENUE_MAP_QUERY_STALE_TIME_MS,
  publicVenueMapSnapshotQueryKey,
} from '@/features/exhibition/constants';

export const usePublicVenueMapSnapshotQuery = () =>
  useQuery({
    queryKey: publicVenueMapSnapshotQueryKey(),
    queryFn: () => getPublicVenueMapCurrent(),
    staleTime: PUBLIC_VENUE_MAP_QUERY_STALE_TIME_MS,
    refetchOnWindowFocus: true,
  });
