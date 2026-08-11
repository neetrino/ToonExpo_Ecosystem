import type { AdminHomeHero, UpdateHomeHeroRequest } from '@toonexpo/contracts';

import { apiFetch } from '@/shared/api/client';

const jsonCredentials = {
  credentials: 'include' as const,
  headers: { 'Content-Type': 'application/json' },
};

export const getAdminHomeHero = (): Promise<AdminHomeHero> =>
  apiFetch<AdminHomeHero>({
    path: '/admin/site/home-hero',
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

export const updateAdminHomeHero = (body: UpdateHomeHeroRequest): Promise<AdminHomeHero> =>
  apiFetch<AdminHomeHero>({
    path: '/admin/site/home-hero',
    method: 'PATCH',
    ...jsonCredentials,
    body: JSON.stringify(body),
  });
