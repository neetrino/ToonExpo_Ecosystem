import {
  favoriteListSchema,
  favoriteStatusResponseSchema,
  type FavoriteListItem,
  type FavoriteToggleInput,
} from '@toonexpo/contracts';

import { apiRequest } from '../api/client';

/**
 * Buyer-private favorite list for account UI.
 * Keeps rows even when apartment status becomes RESERVED/SOLD.
 * Drops rows whose target was deleted.
 */
export async function listBuyerFavorites(): Promise<FavoriteListItem[]> {
  const response = await apiRequest<unknown>('/favorites');
  return favoriteListSchema.parse(response);
}

/** Whether the buyer already saved this target (for public page toggle state). */
export async function isFavorited(input: FavoriteToggleInput): Promise<boolean> {
  const query = new URLSearchParams(input);
  const response = await apiRequest<unknown>(`/favorites/status?${query.toString()}`);
  return favoriteStatusResponseSchema.parse(response).favorited;
}
