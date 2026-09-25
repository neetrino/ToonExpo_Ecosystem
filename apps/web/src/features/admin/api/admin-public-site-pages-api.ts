import type {
  AdminSitePagesResponse,
  PublicSitePagesResponse,
  UpdatePublicSitePagesRequest,
} from '@toonexpo/contracts';

import { apiFetch } from '@/shared/api/client';

const jsonCredentials = {
  credentials: 'include' as const,
  headers: { 'Content-Type': 'application/json' },
};

export const getAdminPublicSitePages = (): Promise<AdminSitePagesResponse> =>
  apiFetch<AdminSitePagesResponse>({
    path: '/admin/site/public-pages',
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

export const updateAdminPublicSitePages = (
  body: UpdatePublicSitePagesRequest,
): Promise<AdminSitePagesResponse> =>
  apiFetch<AdminSitePagesResponse>({
    path: '/admin/site/public-pages',
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });

export type { PublicSitePagesResponse };
