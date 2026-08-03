'use client';

import { useQuery } from '@tanstack/react-query';

import { getPublicGeoMapModels } from '@/features/geo-map/public/api/public-geo-map-api';
import { PUBLIC_GEO_MAP_MODELS_QUERY_KEY } from '@/features/geo-map/public/constants';

export const usePublicGeoMapModelsQuery = () =>
  useQuery({
    queryKey: PUBLIC_GEO_MAP_MODELS_QUERY_KEY,
    queryFn: () => getPublicGeoMapModels(),
  });
