import type { PublicGeoMapModelListResponse } from '@toonexpo/contracts';

import { PUBLIC_GEO_MAP_MODELS_PATH } from '@/features/geo-map/public/constants';
import { apiFetch } from '@/shared/api/client';
import { geoMapFetch } from '@/shared/api/public-fetch';

/**
 * Lists published project 3D map models (anonymous, Next Data Cache).
 */
export const getPublicGeoMapModels = (): Promise<PublicGeoMapModelListResponse> =>
  apiFetch<PublicGeoMapModelListResponse>({
    path: PUBLIC_GEO_MAP_MODELS_PATH,
    ...geoMapFetch(),
  });
