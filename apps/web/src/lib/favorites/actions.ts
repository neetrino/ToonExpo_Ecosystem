'use server';

import {
  favoriteMutationResponseSchema,
  favoriteToggleInputSchema,
} from '@toonexpo/contracts';

import { getApiErrorKey } from '../api/errors';
import { serverApiRequest } from '../api/server';

export type FavoriteMutationErrorKey = 'unauthorized' | 'invalidInput' | 'notFound' | 'rateLimited';

export type FavoriteMutationResult =
  | { ok: true; favorited: boolean }
  | { ok: false; errorKey: FavoriteMutationErrorKey };

function invalidInput(): FavoriteMutationResult {
  return { ok: false, errorKey: 'invalidInput' };
}

function parseInput(raw: unknown): { targetType: 'PROJECT' | 'APARTMENT'; targetId: string } | null {
  const parsed = favoriteToggleInputSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

async function mutateFavorite(
  path: '/favorites' | '/favorites/toggle',
  method: 'POST' | 'DELETE',
  raw: unknown,
): Promise<FavoriteMutationResult> {
  const input = parseInput(raw);
  if (!input) {
    return invalidInput();
  }

  try {
    const response = await serverApiRequest<unknown>(path, { method, body: input });
    const result = favoriteMutationResponseSchema.parse(response);
    return { ok: true, favorited: result.favorited };
  } catch (error) {
    const errorKey = getApiErrorKey(error);
    if (isFavoriteErrorKey(errorKey)) {
      return { ok: false, errorKey };
    }
    throw error;
  }
}

export async function toggleFavoriteAction(raw: unknown): Promise<FavoriteMutationResult> {
  return mutateFavorite('/favorites/toggle', 'POST', raw);
}

export async function addFavoriteAction(raw: unknown): Promise<FavoriteMutationResult> {
  return mutateFavorite('/favorites', 'POST', raw);
}

export async function removeFavoriteAction(raw: unknown): Promise<FavoriteMutationResult> {
  return mutateFavorite('/favorites', 'DELETE', raw);
}

function isFavoriteErrorKey(value: string | null): value is FavoriteMutationErrorKey {
  return (
    value === 'unauthorized' ||
    value === 'invalidInput' ||
    value === 'notFound' ||
    value === 'rateLimited'
  );
}
