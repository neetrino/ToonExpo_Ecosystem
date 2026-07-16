'use server';

import { favoriteToggleInputSchema } from '@toonexpo/contracts';

import { auth } from '@/auth';
import {
  addFavorite,
  removeFavorite,
  toggleFavorite,
  type FavoriteMutationResult,
} from '@/lib/favorites/mutations';
import { assertNotRateLimited } from '@/lib/rate-limit';

function unauthorized(): FavoriteMutationResult {
  return { ok: false, errorKey: 'unauthorized' };
}

function invalidInput(): FavoriteMutationResult {
  return { ok: false, errorKey: 'invalidInput' };
}

async function requireBuyerUserId(): Promise<string | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || session.user.role !== 'BUYER') {
    return null;
  }
  return userId;
}

async function gateFavoriteMutation(
  userId: string,
  raw: unknown,
): Promise<
  { input: { targetType: 'PROJECT' | 'APARTMENT'; targetId: string } } | FavoriteMutationResult
> {
  const rate = await assertNotRateLimited('favoriteToggle', userId);
  if (rate.limited) {
    return { ok: false, errorKey: 'rateLimited' };
  }

  const parsed = favoriteToggleInputSchema.safeParse(raw);
  if (!parsed.success) {
    return invalidInput();
  }
  return { input: parsed.data };
}

export async function toggleFavoriteAction(raw: unknown): Promise<FavoriteMutationResult> {
  const userId = await requireBuyerUserId();
  if (!userId) {
    return unauthorized();
  }

  const gated = await gateFavoriteMutation(userId, raw);
  if ('ok' in gated) {
    return gated;
  }

  return toggleFavorite(userId, gated.input);
}

export async function addFavoriteAction(raw: unknown): Promise<FavoriteMutationResult> {
  const userId = await requireBuyerUserId();
  if (!userId) {
    return unauthorized();
  }

  const gated = await gateFavoriteMutation(userId, raw);
  if ('ok' in gated) {
    return gated;
  }

  return addFavorite(userId, gated.input);
}

export async function removeFavoriteAction(raw: unknown): Promise<FavoriteMutationResult> {
  const userId = await requireBuyerUserId();
  if (!userId) {
    return unauthorized();
  }

  const gated = await gateFavoriteMutation(userId, raw);
  if ('ok' in gated) {
    return gated;
  }

  return removeFavorite(userId, gated.input);
}
